from django.db import models
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.contracts.models import Contract
from apps.projects.models import Project
from apps.proposals.models import Proposal

from .models import Client
from .serializers import ClientSerializer


class ClientViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ClientSerializer
    queryset = Client.objects.all()

    def get_queryset(self):
        return self.queryset.filter(freelancer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(freelancer=self.request.user)

    @action(detail=True, methods=["get"], url_path="overview")
    def overview(self, request, pk=None):
        client = self.get_object()

        # Build Q filter only for populated fields
        filters = models.Q()
        has_filter = False

        if client.email:
            filters |= models.Q(client_email__iexact=client.email)
            has_filter = True
        if client.name:
            filters |= models.Q(client_name__iexact=client.name)
            has_filter = True
        if client.company_name:
            filters |= models.Q(client_name__iexact=client.company_name)
            has_filter = True

        if has_filter:
            projects = Project.objects.filter(freelancer=request.user).filter(filters).distinct()
        else:
            projects = Project.objects.none()

        active_projects_count = projects.filter(status=Project.Status.ACTIVE).count()
        total_projects_count = projects.count()

        # Sum of budgets
        total_budget = sum([p.budget for p in projects if p.budget]) or 0

        # Related proposals & contracts
        project_ids = list(projects.values_list("id", flat=True))
        proposals_count = (
            Proposal.objects.filter(user=request.user, project_id__in=project_ids).count()
            if project_ids
            else 0
        )
        contracts_count = (
            Contract.objects.filter(user=request.user, project_id__in=project_ids).count()
            if project_ids
            else 0
        )

        recent_projects_list = []
        for p in projects[:5]:
            recent_projects_list.append(
                {
                    "id": str(p.id),
                    "title": p.title,
                    "summary": p.summary or "",
                    "status": p.status,
                    "due_date": str(p.due_date) if p.due_date else None,
                    "budget": float(p.budget) if p.budget else None,
                }
            )

        return Response(
            {
                "client": ClientSerializer(client).data,
                "stats": {
                    "active_projects_count": active_projects_count,
                    "total_projects_count": total_projects_count,
                    "pending_proposals_count": proposals_count,
                    "signed_contracts_count": contracts_count,
                    "total_budget": float(total_budget),
                },
                "recent_projects": recent_projects_list,
            }
        )
