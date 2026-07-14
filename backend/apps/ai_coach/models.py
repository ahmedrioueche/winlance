import uuid

from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class CoachSession(TimeStampedModel):
    class GuidanceType(models.TextChoices):
        PRICING = "PRICING", "Pricing"
        NEGOTIATION = "NEGOTIATION", "Negotiation"
        FOLLOW_UP = "FOLLOW_UP", "Follow-up"
        GENERAL = "GENERAL", "General"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PROCESSING = "PROCESSING", "Processing"
        READY = "READY", "Ready"
        FAILED = "FAILED", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="coach_sessions",
    )
    lead = models.ForeignKey(
        "leads.Lead",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="coach_sessions",
    )
    proposal = models.ForeignKey(
        "proposals.Proposal",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="coach_sessions",
    )
    guidance_type = models.CharField(
        max_length=20,
        choices=GuidanceType.choices,
        default=GuidanceType.GENERAL,
        db_index=True,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    prompt = models.TextField(blank=True, default="")
    context_snapshot = models.JSONField(default=dict, blank=True)
    advice = models.TextField(blank=True, default="")
    suggestions = models.JSONField(default=list, blank=True)
    error_message = models.TextField(blank=True, default="")
    task_id = models.CharField(max_length=255, blank=True, default="")

    class Meta(TimeStampedModel.Meta):
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.guidance_type} ({self.status})"
