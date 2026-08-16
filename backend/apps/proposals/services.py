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


def create_proposal_from_lead(user, lead, *, title=None, target_project_name=None, amount=None, template=None, currency="USD"):
    if lead.user_id != user.id:
        raise ValidationError({"lead": "Lead not found or not owned by you."})

    template = template or ensure_default_template(user)
    proposal = Proposal.objects.create(
        user=user,
        lead=lead,
        template=template,
        title=title or f"Offer: {lead.title}",
        target_project_name=target_project_name or "",
        summary=lead.description,
        amount=amount if amount is not None else lead.estimated_value,
        currency=currency,
        status=Proposal.Status.DRAFT,
    )
    return proposal


def queue_proposal_generation(proposal):
    from django.conf import settings

    from .tasks import generate_proposal_draft

    proposal.status = Proposal.Status.DRAFT
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
    if proposal.status not in [Proposal.Status.READY, Proposal.Status.SENT, Proposal.Status.UNDER_REVIEW]:
        raise ValidationError({"status": "Only READY proposals can be marked as sent."})
    proposal.status = Proposal.Status.SENT
    proposal.save(update_fields=["status", "updated_at"])
    return proposal


def send_proposal_email(proposal, recipients, custom_message="", portal_url=""):
    """
    Dispatches a styled HTML email to multiple recipient email addresses
    with a direct call-to-action button linking to the client portal proposal.
    """
    from django.core.mail import EmailMultiAlternatives
    from django.utils.html import strip_tags

    if isinstance(recipients, str):
        recipients = [e.strip() for e in recipients.replace(";", ",").split(",") if e.strip()]
    else:
        recipients = [str(e).strip() for e in recipients if str(e).strip()]

    if not recipients:
        raise ValidationError({"recipients": "At least one valid recipient email is required."})

    freelancer_name = proposal.user.get_full_name() or proposal.user.username or "Your Freelancer"
    portal_link = portal_url or f"http://localhost:5173/portal/proposals/{proposal.id}"
    formatted_amount = f"{float(proposal.amount):,.2f} {proposal.currency}" if proposal.amount else ""

    subject = f"New Proposal: {proposal.title} — {freelancer_name}"

    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f7; color: #1a1a2e; margin: 0; padding: 24px; }}
    .email-card {{ max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }}
    .header {{ background: #4f46e5; padding: 32px 28px; text-align: center; color: #ffffff; }}
    .header h1 {{ margin: 0; font-size: 22px; font-weight: 700; font-family: inherit; }}
    .header p {{ margin: 6px 0 0; font-size: 13px; opacity: 0.9; }}
    .body {{ padding: 32px 28px; }}
    .title {{ font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 12px; }}
    .amount-badge {{ display: inline-block; background: #e0e7ff; color: #3730a3; padding: 6px 14px; border-radius: 20px; font-size: 14px; font-weight: 700; margin-bottom: 20px; }}
    .custom-note {{ background: #f9fafb; border-left: 4px solid #4f46e5; padding: 14px 18px; border-radius: 6px; font-size: 13px; color: #374151; margin-bottom: 24px; line-height: 1.6; white-space: pre-wrap; }}
    .summary {{ font-size: 13px; color: #4b5563; line-height: 1.6; margin-bottom: 28px; }}
    .cta-container {{ text-align: center; margin: 32px 0 16px; }}
    .cta-button {{ display: inline-block; background: #4f46e5; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 28px; border-radius: 10px; box-shadow: 0 2px 6px rgba(79, 70, 229, 0.3); }}
    .footer {{ border-top: 1px solid #f3f4f6; padding: 20px 28px; text-align: center; font-size: 11px; color: #9ca3af; }}
  </style>
</head>
<body>
  <div class="email-card">
    <div class="header">
      <h1>Project Proposal Offered</h1>
      <p>Prepared by {freelancer_name}</p>
    </div>
    <div class="body">
      <h2 class="title">{proposal.title}</h2>
      {f'<div class="amount-badge">Total Investment: {formatted_amount}</div>' if formatted_amount else ''}
      {f'<div class="custom-note"><strong>Note from {freelancer_name}:</strong><br>{custom_message}</div>' if custom_message and custom_message.strip() else ''}
      {f'<div class="summary"><strong>Executive Summary:</strong><br>{proposal.summary}</div>' if proposal.summary and proposal.summary.strip() else ''}
      <div class="cta-container">
        <a href="{portal_link}" class="cta-button">View Interactive Proposal &rarr;</a>
      </div>
    </div>
    <div class="footer">
      Sent securely via Winlance &middot; Click the button above to view, review milestones, or accept the proposal online.
    </div>
  </div>
</body>
</html>"""

    text_content = strip_tags(html_content)

    email_msg = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=None,
        to=recipients,
    )
    email_msg.attach_alternative(html_content, "text/html")
    email_msg.send(fail_silently=False)

    proposal.status = Proposal.Status.SENT
    proposal.save(update_fields=["status", "updated_at"])
    return proposal

