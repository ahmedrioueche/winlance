from django.conf import settings
from django.db import transaction
from rest_framework.exceptions import ValidationError

from .models import CoachSession


def build_context_snapshot(user, *, lead=None, proposal=None, extra=None):
    snapshot = {
        "freelancer_name": user.get_full_name() or user.username,
        "guidance_hints": {},
    }
    if lead:
        snapshot["lead"] = {
            "id": lead.id,
            "title": lead.title,
            "status": lead.status,
            "score": lead.score,
            "probability": lead.probability,
            "estimated_value": str(lead.estimated_value),
            "description": lead.description,
            "company": lead.company.name if lead.company_id else "",
            "contacts": lead.contacts.count(),
            "pending_follow_ups": lead.follow_ups.filter(completed=False).count(),
        }
        snapshot["guidance_hints"]["pipeline_stage"] = lead.status
        snapshot["guidance_hints"]["deal_value"] = str(lead.estimated_value)
    if proposal:
        snapshot["proposal"] = {
            "id": str(proposal.id),
            "title": proposal.title,
            "amount": str(proposal.amount),
            "currency": proposal.currency,
            "status": proposal.status,
            "summary": proposal.summary,
        }
        snapshot["guidance_hints"]["offer_amount"] = str(proposal.amount)
    if extra:
        snapshot["extra"] = extra
    return snapshot


def generate_mock_advice(session):
    """Heuristic sales coach used when no external AI provider is configured."""
    ctx = session.context_snapshot or {}
    lead = ctx.get("lead") or {}
    proposal = ctx.get("proposal") or {}
    stage = lead.get("status") or "NEW"
    value = lead.get("estimated_value") or proposal.get("amount") or "0"
    title = lead.get("title") or proposal.get("title") or "this opportunity"

    if session.guidance_type == CoachSession.GuidanceType.PRICING:
        advice = (
            f"Pricing guidance for “{title}”: anchor around {value} based on current deal size. "
            "Offer a clear scope package, one optional upgrade, and avoid hourly vagueness. "
            "If the buyer hesitates on price, trade scope—not margin."
        )
        suggestions = [
            f"Present a primary package priced near {value}.",
            "Add a lighter starter option at ~70% of anchor price.",
            "Document assumptions so change requests become paid change orders.",
        ]
    elif session.guidance_type == CoachSession.GuidanceType.NEGOTIATION:
        advice = (
            f"Negotiation guidance at stage {stage}: protect value with scoped concessions. "
            "Ask which constraint matters most (budget, timeline, or features), then swap—not slash. "
            "Keep a walk-away floor and get verbal alignment before rewriting the offer."
        )
        suggestions = [
            "Ask: “If we must reduce price, which feature can wait?”",
            "Offer payment milestones instead of a blanket discount.",
            "Confirm decision-makers and timeline before a second revision.",
        ]
    elif session.guidance_type == CoachSession.GuidanceType.FOLLOW_UP:
        pending = lead.get("pending_follow_ups", 0)
        advice = (
            f"Follow-up guidance for “{title}” ({stage}): "
            f"you have {pending} open follow-up(s). "
            "Send a concise bump with one concrete next step and a scheduling link or two time options."
        )
        suggestions = [
            "Lead with value delivered since last touch, not “just checking in”.",
            "Propose two specific call times in the next 3 business days.",
            "If silent after 2 bumps, send a breakup note to reopen or close the loop.",
        ]
    else:
        advice = (
            f"General coaching for “{title}”: advance the deal from {stage} with one clear CTA. "
            "Tighten discovery notes, quantify outcomes, and mirror the buyer’s language in your next message."
        )
        suggestions = [
            "Summarize the buyer’s goal in one sentence before pitching.",
            "Attach proof (case study or mini-scope) matching their industry.",
            "Define the single next milestone you want them to accept.",
        ]

    session.advice = advice
    session.suggestions = suggestions
    session.status = CoachSession.Status.READY
    session.error_message = ""
    session.save(
        update_fields=["advice", "suggestions", "status", "error_message", "updated_at"]
    )
    return session


def run_coach_generation(session):
    session.status = CoachSession.Status.PROCESSING
    session.save(update_fields=["status", "updated_at"])
    provider = getattr(settings, "AI_COACH_PROVIDER", "mock")
    try:
        if provider == "mock":
            return generate_mock_advice(session)
        # Future providers (OpenAI, etc.) plug in here; fall back to mock for safety.
        return generate_mock_advice(session)
    except Exception as exc:
        session.status = CoachSession.Status.FAILED
        session.error_message = str(exc)
        session.save(update_fields=["status", "error_message", "updated_at"])
        raise


def queue_coach_session(session):
    from .tasks import generate_coach_advice

    session.status = CoachSession.Status.PENDING
    session.save(update_fields=["status", "updated_at"])

    if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
        run_coach_generation(session)
        return session

    def enqueue():
        result = generate_coach_advice.delay(str(session.id))
        CoachSession.objects.filter(id=session.id).update(task_id=result.id or "")

    transaction.on_commit(enqueue)
    return session


def create_coach_session(
    user,
    *,
    guidance_type,
    prompt="",
    lead=None,
    proposal=None,
    extra=None,
    generate=True,
):
    if lead and lead.user_id != user.id:
        raise ValidationError({"lead": "Lead not found or not owned by you."})
    if proposal and proposal.user_id != user.id:
        raise ValidationError({"proposal": "Proposal not found or not owned by you."})

    session = CoachSession.objects.create(
        user=user,
        lead=lead,
        proposal=proposal,
        guidance_type=guidance_type,
        prompt=prompt or "",
        context_snapshot=build_context_snapshot(
            user, lead=lead, proposal=proposal, extra=extra
        ),
        status=CoachSession.Status.PENDING,
    )
    if generate:
        queue_coach_session(session)
        session.refresh_from_db()
    return session
