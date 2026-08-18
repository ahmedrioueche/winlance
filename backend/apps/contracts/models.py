import uuid

from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class ContractTemplate(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="contract_templates",
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    body_template = models.TextField(
        help_text="Supports placeholders: {{client_name}}, {{company}}, {{title}}, "
        "{{amount}}, {{currency}}, {{freelancer_name}}, {{proposal_summary}}, {{today}}."
    )
    is_default = models.BooleanField(default=False)

    class Meta(TimeStampedModel.Meta):
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class Contract(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        GENERATING = "GENERATING", "Generating"
        READY = "READY", "Ready"
        SENT = "SENT", "Sent"
        SIGNED = "SIGNED", "Signed"
        VOID = "VOID", "Void"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="contracts",
    )
    proposal = models.ForeignKey(
        "proposals.Proposal",
        on_delete=models.PROTECT,
        related_name="contracts",
        null=True,
        blank=True,
    )
    lead = models.ForeignKey(
        "leads.Lead",
        on_delete=models.PROTECT,
        related_name="contracts",
        null=True,
        blank=True,
    )
    project_id = models.UUIDField(null=True, blank=True, db_index=True)
    template = models.ForeignKey(
        ContractTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="contracts",
    )
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True, default="")
    export_content = models.TextField(blank=True, default="")
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="USD")
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )
    generation_task_id = models.CharField(max_length=255, blank=True, default="")
    export_task_id = models.CharField(max_length=255, blank=True, default="")
    signed_at = models.DateTimeField(null=True, blank=True)
    signed_name = models.CharField(max_length=255, blank=True, default="")
    signed_email = models.EmailField(blank=True, default="")
    signed_ip = models.GenericIPAddressField(null=True, blank=True)

    class Meta(TimeStampedModel.Meta):
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
