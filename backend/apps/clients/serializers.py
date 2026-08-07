from rest_framework import serializers

from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = [
            "id",
            "freelancer",
            "name",
            "email",
            "company_name",
            "status",
            "phone",
            "website",
            "location",
            "industry",
            "start_date",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "freelancer", "created_at", "updated_at"]
