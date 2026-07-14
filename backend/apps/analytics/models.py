import uuid

from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class FunnelSnapshot(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="funnel_snapshots",
    )
    total_leads = models.PositiveIntegerField(default=0)
    won_leads = models.PositiveIntegerField(default=0)
    lost_leads = models.PositiveIntegerField(default=0)
    open_leads = models.PositiveIntegerField(default=0)
    win_rate = models.FloatField(default=0.0)
    pipeline_value = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    won_value = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    stages = models.JSONField(default=list, blank=True)
    conversions = models.JSONField(default=dict, blank=True)
    extras = models.JSONField(default=dict, blank=True)

    class Meta(TimeStampedModel.Meta):
        ordering = ["-created_at"]

    def __str__(self):
        return f"FunnelSnapshot({self.user_id}, {self.created_at})"
