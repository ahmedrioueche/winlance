from django.utils import timezone
from rest_framework.exceptions import NotFound, ValidationError

from apps.proposals.models import Proposal

from .ai_extractor import extract_tasks_from_proposal
from .models import Milestone, Project, ProjectShareLink, Requirement, Task


def user_can_manage_project(user, project):
    return project.freelancer_id == user.id


def user_is_project_client(user, project):
    if project.client_id and project.client_id == user.id:
        return True
    if project.client_email and user.email:
        return project.client_email.lower() == user.email.lower()
    return False


def get_valid_share_link(token):
    link = (
        ProjectShareLink.objects.select_related(
            "project",
            "project__freelancer",
            "project__proposal",
            "project__contract",
            "project__lead",
        )
        .filter(token=token)
        .first()
    )
    if not link or not link.is_valid:
        raise NotFound("Invalid or expired share link.")
    return link


def touch_share_link(link):
    ProjectShareLink.objects.filter(id=link.id).update(last_accessed_at=timezone.now())


def create_share_link(project, *, label="Client access", expires_at=None):
    return ProjectShareLink.objects.create(
        project=project,
        label=label or "Client access",
        expires_at=expires_at,
    )


def ensure_project_and_tasks_for_proposal(proposal, user=None):
    """
    Ensures an active Project exists for the proposal upon acceptance,
    and automatically populates project tasks using Gemini AI (with fallback).
    """
    if proposal.status != Proposal.Status.ACCEPTED:
        proposal.status = Proposal.Status.ACCEPTED
        proposal.save(update_fields=["status", "updated_at"])

    project = None
    if proposal.project_id:
        project = Project.objects.filter(id=proposal.project_id).first()
        if not project:
            proposal.project_id = None
            proposal.save(update_fields=["project_id", "updated_at"])

    if not project:
        freelancer = user or proposal.user
        client_name = ""
        client_email = ""
        if proposal.lead:
            contact = proposal.lead.contacts.first()
            if contact:
                client_name = f"{contact.first_name} {contact.last_name}".strip()
                client_email = contact.email or ""
            if not client_name:
                company = getattr(proposal.lead, "company", None)
                if company and getattr(company, "name", None):
                    client_name = company.name
                else:
                    client_name = proposal.lead.title

        if not client_name or not client_email:
            from apps.clients.models import Client
            matched_client = None
            if client_email:
                matched_client = Client.objects.filter(freelancer=freelancer, email__iexact=client_email).first()
            if not matched_client and proposal.lead and getattr(proposal.lead, "company", None):
                matched_client = Client.objects.filter(freelancer=freelancer, company_name__iexact=proposal.lead.company.name).first()
            if not matched_client and proposal.lead:
                matched_client = Client.objects.filter(freelancer=freelancer, name__icontains=proposal.lead.title).first()

            if matched_client:
                client_name = client_name or matched_client.name or matched_client.company_name
                client_email = client_email or matched_client.email

        if not client_name and proposal.title:
            import re
            m = re.search(r'(?:for|–|-|:)\s+([A-Za-z0-9\s.&]+?)(?:\s+v\d+|\s+ERP|\s+Proposal|\s+Project|$)', proposal.title, re.IGNORECASE)
            if m:
                extracted = m.group(1).strip()
                if extracted and len(extracted) > 1:
                    client_name = extracted

        project_title = (proposal.target_project_name or "").strip() or proposal.title

        project = Project.objects.create(
            freelancer=freelancer,
            lead=proposal.lead,
            proposal=proposal,
            title=project_title,
            summary=proposal.summary or "",
            budget=proposal.amount,
            currency=proposal.currency,
            client_name=client_name,
            client_email=client_email,
            status=Project.Status.ACTIVE,
        )
        proposal.project_id = project.id
        proposal.save(update_fields=["project_id", "updated_at"])

        contract = proposal.contracts.order_by("-created_at").first()
        if contract:
            project.contract = contract
            project.save(update_fields=["contract", "updated_at"])
            contract.project_id = project.id
            contract.save(update_fields=["project_id", "updated_at"])

    populate_milestones_and_tasks_for_project(proposal, project)
    return project


def populate_milestones_and_tasks_for_project(proposal, project):
    """
    Populates milestones and tasks for a newly created project from a proposal.
    If proposal has structured editor milestones, copies them.
    Otherwise uses AI / fallback extractor to generate structured milestones + tasks.
    """
    if project.milestones.exists() or project.tasks.exists():
        return

    if proposal.milestones.exists():
        copy_proposal_milestones_to_project(proposal, project)
        return

    from .ai_extractor import extract_milestones_and_tasks_from_proposal

    extracted_milestones = extract_milestones_and_tasks_from_proposal(
        title=proposal.title,
        summary=proposal.summary or "",
        body=proposal.body or "",
    )

    for idx, m_item in enumerate(extracted_milestones):
        m_status = Milestone.Status.IN_PROGRESS if idx == 0 else Milestone.Status.PENDING
        milestone = Milestone.objects.create(
            project=project,
            title=m_item["title"],
            description=m_item.get("description", ""),
            status=m_status,
            order=m_item.get("order", idx + 1),
        )
        tasks_to_create = [
            Task(
                project=project,
                milestone=milestone,
                title=t_item["title"],
                description=t_item.get("description", ""),
                priority=t_item.get("priority", "MEDIUM"),
                due_date=t_item.get("due_date"),
                order=t_item.get("order", t_idx + 1),
                source_proposal=proposal,
                status=Task.Status.TODO,
            )
            for t_idx, t_item in enumerate(m_item.get("tasks", []))
        ]
        if tasks_to_create:
            Task.objects.bulk_create(tasks_to_create)


def copy_proposal_milestones_to_project(proposal, project):
    """
    Copies ProposalMilestone records from proposal into actual Milestone and Task records in project.
    Sets first milestone to IN_PROGRESS and remaining to PENDING.
    """
    if not proposal.milestones.exists():
        return False

    proposal_milestones = proposal.milestones.all().order_by("order", "created_at")
    global_t_order = 1
    for idx, p_m in enumerate(proposal_milestones):
        m_status = Milestone.Status.IN_PROGRESS if idx == 0 else Milestone.Status.PENDING
        milestone = Milestone.objects.create(
            project=project,
            title=p_m.title,
            description=p_m.description,
            status=m_status,
            due_date=p_m.due_date,
            order=p_m.order or (idx + 1),
        )

        deliverables = p_m.deliverables or []
        if isinstance(deliverables, list):
            tasks_to_create = []
            for d_item in deliverables:
                title_str = d_item if isinstance(d_item, str) else d_item.get("title", "")
                if title_str.strip():
                    tasks_to_create.append(
                        Task(
                            project=project,
                            milestone=milestone,
                            title=title_str.strip(),
                            order=global_t_order,
                            source_proposal=proposal,
                            status=Task.Status.TODO,
                        )
                    )
                    global_t_order += 1
            if tasks_to_create:
                Task.objects.bulk_create(tasks_to_create)
    return True



def reorder_project_tasks(project, task_id_orders):
    """
    Bulk updates the order field for tasks in a project.
    """
    if not task_id_orders:
        return

    tasks_by_id = {str(t.id): t for t in project.tasks.all()}
    to_update = []

    if isinstance(task_id_orders, list):
        for idx, item in enumerate(task_id_orders, start=1):
            if isinstance(item, dict):
                tid = str(item.get("id"))
                ord_val = item.get("order", idx)
            else:
                tid = str(item)
                ord_val = idx

            if tid in tasks_by_id:
                t = tasks_by_id[tid]
                t.order = ord_val
                to_update.append(t)

    if to_update:
        Task.objects.bulk_update(to_update, ["order", "updated_at"])


def create_project_from_proposal(user, proposal, *, title=None, client_email="", client_name=""):
    if proposal.user_id != user.id:
        raise ValidationError({"proposal": "Proposal not found or not owned by you."})

    project = Project.objects.create(
        freelancer=user,
        lead=proposal.lead,
        proposal=proposal,
        title=title or proposal.title,
        summary=proposal.summary or "",
        client_email=client_email or "",
        client_name=client_name or "",
        status=Project.Status.ACTIVE,
    )
    proposal.project_id = project.id
    proposal.save(update_fields=["project_id", "updated_at"])

    contract = proposal.contracts.order_by("-created_at").first()
    if contract and contract.user_id == user.id:
        project.contract = contract
        project.save(update_fields=["contract", "updated_at"])
        contract.project_id = project.id
        contract.save(update_fields=["project_id", "updated_at"])

    populate_milestones_and_tasks_for_project(proposal, project)
    return project


def attach_proposal(project, proposal, user):
    if proposal.user_id != user.id:
        raise ValidationError({"proposal": "Proposal not found or not owned by you."})
    project.proposal = proposal
    project.save(update_fields=["proposal", "updated_at"])
    proposal.project_id = project.id
    proposal.save(update_fields=["project_id", "updated_at"])
    return project


def attach_contract(project, contract, user):
    if contract.user_id != user.id:
        raise ValidationError({"contract": "Contract not found or not owned by you."})
    project.contract = contract
    project.save(update_fields=["contract", "updated_at"])
    contract.project_id = project.id
    contract.save(update_fields=["project_id", "updated_at"])
    return project


def build_dashboard(project, *, for_client=False):
    tasks = list(project.tasks.all())
    requirements = list(project.requirements.all())
    milestones = list(project.milestones.all())
    reports = project.reports.all()
    if for_client:
        reports = reports.filter(is_visible_to_client=True)
    reports = list(reports)
    files = list(project.files.all())

    proposal_data = None
    if project.proposal_id:
        p = project.proposal
        proposal_data = {
            "id": str(p.id),
            "title": p.title,
            "summary": p.summary,
            "body": p.body,
            "amount": str(p.amount),
            "currency": p.currency,
            "status": p.status,
        }

    contract_data = None
    if project.contract_id:
        c = project.contract
        contract_data = {
            "id": str(c.id),
            "title": c.title,
            "body": c.body,
            "amount": str(c.amount),
            "currency": c.currency,
            "status": c.status,
            "signed_at": c.signed_at.isoformat() if c.signed_at else None,
            "export_content": c.export_content if not for_client else c.export_content,
        }

    # Evaluate milestone readiness
    milestones_updated = []
    for m in milestones:
        m_tasks = [t for t in tasks if t.milestone_id == m.id]
        if m_tasks and m.status in {Milestone.Status.PENDING, Milestone.Status.IN_PROGRESS}:
            if all(t.status == Task.Status.DONE for t in m_tasks):
                m.status = Milestone.Status.READY_FOR_SIGNOFF
                m.save(update_fields=["status", "updated_at"])
                milestones_updated.append(m)

    done = sum(1 for m in milestones if m.status == Milestone.Status.DONE)
    total = len(milestones)
    progress = int((done / total) * 100) if total else 0

    from apps.analytics.services import build_project_progress_report

    progress_report = build_project_progress_report(project, for_client=for_client)

    return {
        "project": {
            "id": str(project.id),
            "title": project.title,
            "summary": project.summary,
            "status": project.status,
            "client_name": project.client_name,
            "client_email": project.client_email,
            "progress_percent": progress,
        },
        "tasks": [
            {
                "id": str(t.id),
                "milestone_id": str(t.milestone_id) if t.milestone_id else None,
                "title": t.title,
                "description": t.description,
                "status": t.status,
                "priority": t.priority,
                "order": t.order,
                "due_date": t.due_date.isoformat() if t.due_date else None,
                "created_at": t.created_at.isoformat(),
            }
            for t in tasks
        ],
        "requirements": [
            {
                "id": str(r.id),
                "title": r.title,
                "description": r.description,
                "order": r.order,
                "created_by_role": r.created_by_role,
                "updated_by_role": r.updated_by_role,
                "updated_at": r.updated_at.isoformat(),
            }
            for r in requirements
        ],
        "offer": proposal_data,
        "contract": contract_data,
        "progress": {
            "percent": progress,
            "milestones": [
                {
                    "id": str(m.id),
                    "title": m.title,
                    "description": m.description,
                    "status": m.status,
                    "due_date": m.due_date.isoformat() if m.due_date else None,
                    "progress_percent": m.progress_percent,
                    "order": m.order,
                }
                for m in milestones
            ],
        },
        "reports": [
            {
                "id": str(r.id),
                "title": r.title,
                "body": r.body,
                "created_at": r.created_at.isoformat(),
            }
            for r in reports
        ],
        "files": [
            {
                "id": str(f.id),
                "name": f.name,
                "url": f.url,
                "notes": f.notes,
            }
            for f in files
        ],
        "progress_report": progress_report,
    }


def upsert_requirement(project, *, title, description="", order=0, role="freelancer", requirement=None):
    if requirement is None:
        return Requirement.objects.create(
            project=project,
            title=title,
            description=description,
            order=order,
            created_by_role=role,
            updated_by_role=role,
        )
    requirement.title = title
    requirement.description = description
    if order is not None:
        requirement.order = order
    requirement.updated_by_role = role
    requirement.save(
        update_fields=["title", "description", "order", "updated_by_role", "updated_at"]
    )
    return requirement


def accept_offer_via_portal(project):
    if not project.proposal_id:
        raise ValidationError({"offer": "No offer attached to this project."})
    proposal = project.proposal
    if proposal.status not in {Proposal.Status.READY, Proposal.Status.SENT, Proposal.Status.ACCEPTED}:
        raise ValidationError({"offer": "Offer is not ready to accept."})
    proposal.status = Proposal.Status.ACCEPTED
    proposal.save(update_fields=["status", "updated_at"])
    return proposal


def accept_contract_via_portal(project):
    if not project.contract_id:
        raise ValidationError({"contract": "No contract attached to this project."})
    from apps.contracts.services import mark_contract_signed

    return mark_contract_signed(project.contract)
