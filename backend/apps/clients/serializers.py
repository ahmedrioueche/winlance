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
            "portal_token",
            "portal_passcode",
            "is_portal_password_protected",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "freelancer",
            "portal_token",
            "created_at",
            "updated_at",
        ]
