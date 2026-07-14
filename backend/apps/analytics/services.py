from decimal import Decimal

from django.db import transaction
from django.db.models import Count, Sum
from django.utils import timezone

from apps.contracts.models import Contract
from apps.leads.models import Lead
from apps.projects.models import Milestone, Project
from apps.proposals.models import Proposal

from .models import FunnelSnapshot


def compute_funnel_metrics(user):
    leads = Lead.objects.filter(user=user)
    total = leads.count()
    by_status = {
        row["status"]: row["count"]
        for row in leads.values("status").annotate(count=Count("id"))
    }

    stages = []
    for value, label in Lead.Status.choices:
        stages.append(
            {
                "status": value,
                "label": label,
                "count": by_status.get(value, 0),
            }
        )

    won = by_status.get(Lead.Status.WON, 0)
    lost = by_status.get(Lead.Status.LOST, 0)
    closed = won + lost
    open_leads = total - closed
    win_rate = (won / closed * 100.0) if closed else 0.0

    open_statuses = [
        Lead.Status.NEW,
        Lead.Status.CONTACTED,
        Lead.Status.INTERESTED,
        Lead.Status.DISCOVERY_CALL,
        Lead.Status.PROPOSAL_SENT,
        Lead.Status.NEGOTIATION,
    ]
    pipeline_value = leads.filter(status__in=open_statuses).aggregate(
        total=Sum("estimated_value")
    )["total"] or Decimal("0")
    won_value = leads.filter(status=Lead.Status.WON).aggregate(
        total=Sum("estimated_value")
    )["total"] or Decimal("0")

    # Simple stage-to-stage conversion vs previous stage in the happy path.
    happy_path = [
        Lead.Status.NEW,
        Lead.Status.CONTACTED,
        Lead.Status.INTERESTED,
        Lead.Status.DISCOVERY_CALL,
        Lead.Status.PROPOSAL_SENT,
        Lead.Status.NEGOTIATION,
        Lead.Status.WON,
    ]
    conversions = {}
    for idx in range(1, len(happy_path)):
        prev = happy_path[idx - 1]
        curr = happy_path[idx]
        prev_count = by_status.get(prev, 0)
        # Approximate: share of leads that reached this stage or beyond is hard;
        # use relative count of current vs previous as a lightweight indicator.
        curr_count = by_status.get(curr, 0)
        rate = (curr_count / prev_count * 100.0) if prev_count else 0.0
        conversions[f"{prev}_to_{curr}"] = round(rate, 2)

    proposal_stats = {
        "total": Proposal.objects.filter(user=user).count(),
        "accepted": Proposal.objects.filter(
            user=user, status=Proposal.Status.ACCEPTED
        ).count(),
        "sent": Proposal.objects.filter(user=user, status=Proposal.Status.SENT).count(),
    }
    contract_stats = {
        "total": Contract.objects.filter(user=user).count(),
        "signed": Contract.objects.filter(
            user=user, status=Contract.Status.SIGNED
        ).count(),
    }
    project_stats = {
        "total": Project.objects.filter(freelancer=user).count(),
        "active": Project.objects.filter(
            freelancer=user, status=Project.Status.ACTIVE
        ).count(),
        "completed": Project.objects.filter(
            freelancer=user, status=Project.Status.COMPLETED
        ).count(),
    }

    return {
        "total_leads": total,
        "won_leads": won,
        "lost_leads": lost,
        "open_leads": open_leads,
        "win_rate": round(win_rate, 2),
        "pipeline_value": str(pipeline_value),
        "won_value": str(won_value),
        "stages": stages,
        "conversions": conversions,
        "proposals": proposal_stats,
        "contracts": contract_stats,
        "projects": project_stats,
        "generated_at": timezone.now().isoformat(),
    }


def save_funnel_snapshot(user, metrics=None):
    metrics = metrics or compute_funnel_metrics(user)
    return FunnelSnapshot.objects.create(
        user=user,
        total_leads=metrics["total_leads"],
        won_leads=metrics["won_leads"],
        lost_leads=metrics["lost_leads"],
        open_leads=metrics["open_leads"],
        win_rate=metrics["win_rate"],
        pipeline_value=metrics["pipeline_value"],
        won_value=metrics["won_value"],
        stages=metrics["stages"],
        conversions=metrics["conversions"],
        extras={
            "proposals": metrics["proposals"],
            "contracts": metrics["contracts"],
            "projects": metrics["projects"],
        },
    )


def queue_funnel_snapshot(user_id):
    from django.conf import settings
    from django.contrib.auth import get_user_model

    from .tasks import refresh_funnel_snapshot

    if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
        user = get_user_model().objects.get(id=user_id)
        return save_funnel_snapshot(user, compute_funnel_metrics(user))

    def enqueue():
        refresh_funnel_snapshot.delay(user_id)

    transaction.on_commit(enqueue)
    return None


def build_project_progress_report(project, *, for_client=False):
    milestones = list(project.milestones.all())
    done = sum(1 for m in milestones if m.status == Milestone.Status.DONE)
    in_progress = sum(1 for m in milestones if m.status == Milestone.Status.IN_PROGRESS)
    blocked = sum(1 for m in milestones if m.status == Milestone.Status.BLOCKED)
    total = len(milestones)
    percent = int((done / total) * 100) if total else 0

    reports = project.reports.all()
    if for_client:
        reports = reports.filter(is_visible_to_client=True)
    reports = list(reports.order_by("-created_at")[:10])

    return {
        "project_id": str(project.id),
        "title": project.title,
        "status": project.status,
        "progress_percent": percent,
        "milestone_summary": {
            "total": total,
            "done": done,
            "in_progress": in_progress,
            "blocked": blocked,
            "pending": total - done - in_progress - blocked,
        },
        "milestones": [
            {
                "id": str(m.id),
                "title": m.title,
                "status": m.status,
                "progress_percent": m.progress_percent,
                "due_date": m.due_date.isoformat() if m.due_date else None,
            }
            for m in milestones
        ],
        "recent_reports": [
            {
                "id": str(r.id),
                "title": r.title,
                "body": r.body,
                "created_at": r.created_at.isoformat(),
            }
            for r in reports
        ],
        "requirements_count": project.requirements.count(),
        "has_offer": bool(project.proposal_id),
        "has_contract": bool(project.contract_id),
        "generated_at": timezone.now().isoformat(),
    }


def build_analytics_summary(user):
    funnel = compute_funnel_metrics(user)
    latest_snapshot = (
        FunnelSnapshot.objects.filter(user=user).order_by("-created_at").first()
    )
    return {
        "kpis": {
            "open_leads": funnel["open_leads"],
            "win_rate": funnel["win_rate"],
            "pipeline_value": funnel["pipeline_value"],
            "won_value": funnel["won_value"],
            "active_projects": funnel["projects"]["active"],
            "proposals_sent": funnel["proposals"]["sent"],
            "contracts_signed": funnel["contracts"]["signed"],
        },
        "funnel": funnel,
        "latest_snapshot_id": str(latest_snapshot.id) if latest_snapshot else None,
        "latest_snapshot_at": (
            latest_snapshot.created_at.isoformat() if latest_snapshot else None
        ),
    }
