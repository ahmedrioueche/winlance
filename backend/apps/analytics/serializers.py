from rest_framework import serializers

from .models import FunnelSnapshot


class FunnelSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = FunnelSnapshot
        fields = [
            "id",
            "user",
            "total_leads",
            "won_leads",
            "lost_leads",
            "open_leads",
            "win_rate",
            "pipeline_value",
            "won_value",
            "stages",
            "conversions",
            "extras",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields
