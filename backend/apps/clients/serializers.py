from django.db.models import Q
from rest_framework import serializers

from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    projects = serializers.SerializerMethodField()
    proposals = serializers.SerializerMethodField()

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
            "projects",
            "proposals",
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

    def get_projects(self, obj):
        from apps.projects.models import Project

        qs = Project.objects.filter(freelancer=obj.freelancer)
        filters = Q()
        if obj.email:
            filters |= Q(client_email__iexact=obj.email)
        if obj.name:
            filters |= Q(client_name__iexact=obj.name)
        if obj.company_name:
            filters |= Q(client_name__iexact=obj.company_name)

        if not filters:
            return []

        projects = qs.filter(filters).distinct()
        return [
            {
                "id": str(p.id),
                "title": p.title,
                "summary": p.summary,
                "status": p.status,
                "budget": p.budget,
                "due_date": p.due_date,
            }
            for p in projects
        ]

    def get_proposals(self, obj):
        from apps.proposals.models import Proposal

        qs = Proposal.objects.filter(user=obj.freelancer)
        filters = Q()
        if obj.email:
            filters |= Q(lead__email__iexact=obj.email)
        if obj.name:
            filters |= Q(lead__name__iexact=obj.name)
        if obj.company_name:
            filters |= Q(lead__company_name__iexact=obj.company_name)

        if not filters:
            return []

        proposals = qs.filter(filters).distinct()
        return [
            {
                "id": str(pr.id),
                "title": pr.title,
                "amount": pr.amount,
                "status": pr.status,
                "created_at": pr.created_at,
            }
            for pr in proposals
        ]
