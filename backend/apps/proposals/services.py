import re

from django.db import transaction
from rest_framework.exceptions import ValidationError

from .models import Proposal, ProposalTemplate

PLACEHOLDER_PATTERN = re.compile(r"\{\{\s*([a-zA-Z0-9_]+)\s*\}\}")

DEFAULT_PROPOSAL_BODY = """# Proposal: {{title}}

Prepared for: {{client_name}} ({{company}})
Prepared by: {{freelancer_name}}

## Overview
{{description}}

## Investment
{{amount}} {{currency}}

## Next steps
1. Review this offer
2. Confirm scope and timeline
3. Proceed to contract
"""


def render_template(template_text, context):
    def replace(match):
        key = match.group(1)
        value = context.get(key, "")
        return "" if value is None else str(value)

    return PLACEHOLDER_PATTERN.sub(replace, template_text)


def build_proposal_context(proposal):
    lead = proposal.lead
    company_name = ""
    client_name = proposal.user.get_full_name() or proposal.user.username
    description = proposal.summary or ""

    if lead:
        description = description or lead.description
        if lead.company_id:
            company_name = lead.company.name
        contact = lead.contacts.order_by("created_at").first()
        if contact:
            client_name = f"{contact.first_name} {contact.last_name}".strip() or client_name

    return {
        "title": proposal.title,
        "description": description,
        "amount": proposal.amount,
        "currency": proposal.currency,
        "company": company_name or "Client",
        "client_name": client_name,
        "freelancer_name": proposal.user.get_full_name() or proposal.user.username,
    }


def get_template_for_user(user, template_id=None):
    if template_id:
        template = ProposalTemplate.objects.filter(user=user, id=template_id).first()
        if not template:
            raise ValidationError({"template": "Template not found."})
        return template
    return (
        ProposalTemplate.objects.filter(user=user, is_default=True).first()
        or ProposalTemplate.objects.filter(user=user).order_by("-created_at").first()
    )


def ensure_default_template(user):
    template = ProposalTemplate.objects.filter(user=user, is_default=True).first()
    if template:
        return template
    return ProposalTemplate.objects.create(
        user=user,
        name="Standard offer",
        description="Default Winlance proposal template",
        body_template=DEFAULT_PROPOSAL_BODY,
        is_default=True,
    )


def create_proposal_from_lead(user, lead, *, title=None, amount=None, template=None, currency="USD"):
    if lead.user_id != user.id:
        raise ValidationError({"lead": "Lead not found or not owned by you."})

    template = template or ensure_default_template(user)
    proposal = Proposal.objects.create(
        user=user,
        lead=lead,
        template=template,
        title=title or f"Offer: {lead.title}",
        summary=lead.description,
        amount=amount if amount is not None else lead.estimated_value,
        currency=currency,
        status=Proposal.Status.DRAFT,
    )
    return proposal


def queue_proposal_generation(proposal):
    from django.conf import settings

    from .tasks import generate_proposal_draft

    proposal.status = Proposal.Status.GENERATING
    proposal.save(update_fields=["status", "updated_at"])

    if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
        generate_proposal_content(proposal)
        return proposal

    def enqueue():
        try:
            result = generate_proposal_draft.delay(str(proposal.id))
            Proposal.objects.filter(id=proposal.id).update(generation_task_id=result.id or "")
        except Exception:
            # Broker/worker unavailable — finish synchronously so the UI is not locked forever.
            generate_proposal_content(proposal)

    transaction.on_commit(enqueue)
    return proposal


def cancel_proposal_generation(proposal):
    if proposal.status != Proposal.Status.GENERATING:
        raise ValidationError({"status": "Proposal is not generating."})
    proposal.status = Proposal.Status.DRAFT
    proposal.generation_task_id = ""
    proposal.save(update_fields=["status", "generation_task_id", "updated_at"])
    return proposal


def generate_proposal_content(proposal):
    template_text = (
        proposal.template.body_template
        if proposal.template_id
        else ensure_default_template(proposal.user).body_template
    )
    context = build_proposal_context(proposal)
    proposal.body = render_template(template_text, context)
    if not proposal.summary:
        proposal.summary = context.get("description") or ""
    proposal.status = Proposal.Status.READY
    proposal.save(update_fields=["body", "summary", "status", "updated_at"])
    return proposal


def mark_proposal_sent(proposal):
    # Allow sending from DRAFT, READY, UNDER_REVIEW, or SENT
    proposal.status = Proposal.Status.SENT
    proposal.save(update_fields=["status", "updated_at"])
    return proposal
