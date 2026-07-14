from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from .models import FollowUp, Lead

# Allowed forward (and reopen) transitions for the sales pipeline.
ALLOWED_TRANSITIONS = {
    Lead.Status.NEW: {Lead.Status.CONTACTED, Lead.Status.LOST},
    Lead.Status.CONTACTED: {
        Lead.Status.INTERESTED,
        Lead.Status.LOST,
    },
    Lead.Status.INTERESTED: {
        Lead.Status.DISCOVERY_CALL,
        Lead.Status.LOST,
    },
    Lead.Status.DISCOVERY_CALL: {
        Lead.Status.PROPOSAL_SENT,
        Lead.Status.LOST,
    },
    Lead.Status.PROPOSAL_SENT: {
        Lead.Status.NEGOTIATION,
        Lead.Status.WON,
        Lead.Status.LOST,
    },
    Lead.Status.NEGOTIATION: {Lead.Status.WON, Lead.Status.LOST},
    Lead.Status.WON: set(),
    Lead.Status.LOST: {Lead.Status.NEW, Lead.Status.CONTACTED},
}

STATUS_PROBABILITY = {
    Lead.Status.NEW: 5,
    Lead.Status.CONTACTED: 15,
    Lead.Status.INTERESTED: 30,
    Lead.Status.DISCOVERY_CALL: 45,
    Lead.Status.PROPOSAL_SENT: 60,
    Lead.Status.NEGOTIATION: 75,
    Lead.Status.WON: 100,
    Lead.Status.LOST: 0,
}

STATUS_SCORE_WEIGHT = {
    Lead.Status.NEW: 10,
    Lead.Status.CONTACTED: 20,
    Lead.Status.INTERESTED: 35,
    Lead.Status.DISCOVERY_CALL: 50,
    Lead.Status.PROPOSAL_SENT: 65,
    Lead.Status.NEGOTIATION: 80,
    Lead.Status.WON: 100,
    Lead.Status.LOST: 0,
}


def assert_valid_transition(current_status, new_status):
    if current_status == new_status:
        raise ValidationError({"status": "Lead is already in that status."})
    allowed = ALLOWED_TRANSITIONS.get(current_status, set())
    if new_status not in allowed:
        raise ValidationError(
            {
                "status": (
                    f"Cannot transition from {current_status} to {new_status}. "
                    f"Allowed: {sorted(allowed) or 'none (terminal status)'}."
                )
            }
        )


def transition_lead(lead, new_status, *, sync_probability=True):
    assert_valid_transition(lead.status, new_status)
    lead.status = new_status
    update_fields = ["status", "updated_at"]
    if sync_probability:
        lead.probability = STATUS_PROBABILITY.get(new_status, lead.probability)
        update_fields.append("probability")
    lead.score = calculate_lead_score(lead)
    update_fields.append("score")
    lead.save(update_fields=update_fields)
    return lead


def calculate_lead_score(lead):
    """Heuristic 0–100 score from pipeline stage, value, and CRM activity."""
    score = STATUS_SCORE_WEIGHT.get(lead.status, 0)

    estimated = float(lead.estimated_value or 0)
    if estimated > 0:
        # Log-ish scaling: $1k → +5, $10k → +15, $50k+ → +25
        if estimated >= 50000:
            score += 25
        elif estimated >= 10000:
            score += 15
        elif estimated >= 1000:
            score += 5

    contact_count = lead.contacts.count() if lead.pk else 0
    score += min(contact_count * 5, 15)

    note_count = lead.notes.count() if lead.pk else 0
    score += min(note_count * 2, 10)

    if lead.pk:
        follow_ups = lead.follow_ups.all()
        completed = sum(1 for item in follow_ups if item.completed)
        pending = sum(1 for item in follow_ups if not item.completed)
        score += min(completed * 3, 9)
        score += min(pending * 2, 6)

    # Blend in explicit probability lightly
    score += int((lead.probability or 0) * 0.1)

    return max(0, min(100, int(score)))


def rescore_lead(lead):
    lead.score = calculate_lead_score(lead)
    lead.save(update_fields=["score", "updated_at"])
    return lead


def complete_follow_up(follow_up, notes=None):
    follow_up.completed = True
    update_fields = ["completed", "updated_at"]
    if notes is not None:
        follow_up.notes = notes
        update_fields.append("notes")
    follow_up.save(update_fields=update_fields)
    rescore_lead(follow_up.lead)
    return follow_up


def schedule_follow_up(lead, scheduled_at, notes=""):
    follow_up = FollowUp.objects.create(
        lead=lead,
        scheduled_at=scheduled_at,
        notes=notes or "",
        completed=False,
    )
    rescore_lead(lead)
    return follow_up


def overdue_follow_ups_queryset(queryset):
    return queryset.filter(completed=False, scheduled_at__lt=timezone.now())


def upcoming_follow_ups_queryset(queryset, *, within_hours=None):
    qs = queryset.filter(completed=False, scheduled_at__gte=timezone.now())
    if within_hours is not None:
        deadline = timezone.now() + timedelta(hours=int(within_hours))
        qs = qs.filter(scheduled_at__lte=deadline)
    return qs


def pipeline_summary(user):
    counts = (
        Lead.objects.filter(user=user)
        .values("status")
        .annotate(count=Count("id"))
        .order_by("status")
    )
    by_status = {row["status"]: row["count"] for row in counts}
    stages = []
    for value, label in Lead.Status.choices:
        stages.append(
            {
                "status": value,
                "label": label,
                "count": by_status.get(value, 0),
            }
        )
    return {
        "total": sum(by_status.values()),
        "stages": stages,
    }


def apply_lead_filters(queryset, params):
    status = params.get("status")
    if status:
        queryset = queryset.filter(status=status)

    company = params.get("company")
    if company:
        queryset = queryset.filter(company_id=company)

    min_score = params.get("min_score")
    if min_score is not None and min_score != "":
        queryset = queryset.filter(score__gte=int(min_score))

    max_score = params.get("max_score")
    if max_score is not None and max_score != "":
        queryset = queryset.filter(score__lte=int(max_score))

    q = (params.get("q") or "").strip()
    if q:
        queryset = queryset.filter(
            Q(title__icontains=q)
            | Q(description__icontains=q)
            | Q(company__name__icontains=q)
            | Q(contacts__email__icontains=q)
            | Q(contacts__first_name__icontains=q)
            | Q(contacts__last_name__icontains=q)
        ).distinct()

    ordering = params.get("ordering")
    allowed_ordering = {
        "created_at",
        "-created_at",
        "updated_at",
        "-updated_at",
        "score",
        "-score",
        "estimated_value",
        "-estimated_value",
        "title",
        "-title",
        "status",
        "-status",
    }
    if ordering in allowed_ordering:
        queryset = queryset.order_by(ordering)

    return queryset
