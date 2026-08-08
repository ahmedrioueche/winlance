import uuid

from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class Client(TimeStampedModel):
    class Status(models.TextChoices):
        LEAD = "LEAD", "Lead"
        PROPOSAL_SENT = "PROPOSAL_SENT", "Proposal Sent"
        NEGOTIATING = "NEGOTIATING", "Negotiating"
        ACTIVE = "ACTIVE", "Active"
        COMPLETED = "COMPLETED", "Completed"
        ARCHIVED = "ARCHIVED", "Archived"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="clients",
    )
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True, default="")
    company_name = models.CharField(max_length=255, blank=True, default="")
    status = models.CharField(
        max_length=50,
        choices=Status.choices,
        default=Status.ACTIVE,
        db_index=True,
    )
    phone = models.CharField(max_length=50, blank=True, default="")
    website = models.URLField(blank=True, default="")
    location = models.CharField(max_length=255, blank=True, default="")
    industry = models.CharField(max_length=100, blank=True, default="")
    start_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, default="")

    # Client Portal Security Fields
    portal_token = models.UUIDField(default=uuid.uuid4, editable=False, db_index=True)
    portal_passcode = models.CharField(max_length=128, blank=True, default="")
    is_portal_password_protected = models.BooleanField(default=False)

    class Meta(TimeStampedModel.Meta):
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.company_name})" if self.company_name else self.name
