import uuid

from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class ProposalTemplate(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="proposal_templates",
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    body_template = models.TextField(
        help_text="Supports placeholders: {{client_name}}, {{company}}, {{title}}, "
        "{{description}}, {{amount}}, {{currency}}, {{freelancer_name}}."
    )
    is_default = models.BooleanField(default=False)

    class Meta(TimeStampedModel.Meta):
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class Proposal(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        READY = "READY", "Ready"
        UNDER_REVIEW = "UNDER_REVIEW", "Under Review"
        CHANGES_REQUESTED = "CHANGES_REQUESTED", "Changes Requested"
        SENT = "SENT", "Sent"
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"
        EXPIRED = "EXPIRED", "Expired"
        WITHDRAWN = "WITHDRAWN", "Withdrawn"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="proposals",
    )
    lead = models.ForeignKey(
        "leads.Lead",
        on_delete=models.PROTECT,
        related_name="proposals",
        null=True,
        blank=True,
    )
    # Soft link until Phase 5 projects app owns the FK.
    project_id = models.UUIDField(null=True, blank=True, db_index=True)
    template = models.ForeignKey(
        ProposalTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="proposals",
    )
    title = models.CharField(max_length=255)
    target_project_name = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Workspace project title created upon proposal acceptance.",
    )
    summary = models.TextField(blank=True, default="")
    body = models.TextField(blank=True, default="")
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="USD")
    status = models.CharField(
        max_length=25,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )
    generation_task_id = models.CharField(max_length=255, blank=True, default="")

    class Meta(TimeStampedModel.Meta):
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class ProposalVersion(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    proposal = models.ForeignKey(
        Proposal,
        on_delete=models.CASCADE,
        related_name="versions",
    )
    version_number = models.PositiveIntegerField(default=1)
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True, default="")
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="USD")
    change_summary = models.CharField(max_length=255, blank=True, default="Initial version")
    created_by_name = models.CharField(max_length=255, blank=True, default="")
    created_by_role = models.CharField(
        max_length=20,
        choices=(("freelancer", "Freelancer"), ("client", "Client")),
        default="freelancer",
    )

    class Meta(TimeStampedModel.Meta):
        ordering = ["-version_number", "-created_at"]

    def __str__(self):
        return f"{self.proposal.title} v{self.version_number}"
