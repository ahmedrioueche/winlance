from django.utils import timezone
from rest_framework.exceptions import NotFound, ValidationError

from apps.proposals.models import Proposal

from .models import Milestone, Project, ProjectShareLink, Requirement


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
