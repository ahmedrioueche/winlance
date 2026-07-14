from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.core.permissions import IsOwner

from .models import Proposal, ProposalTemplate
from .serializers import (
    ProposalFromLeadSerializer,
    ProposalSerializer,
    ProposalTemplateSerializer,
)
from .services import (
    ensure_default_template,
    mark_proposal_sent,
    queue_proposal_generation,
)


class ProposalTemplateViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOwner]
    serializer_class = ProposalTemplateSerializer
    queryset = ProposalTemplate.objects.all()

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        template = serializer.save(user=self.request.user)
        if template.is_default:
            ProposalTemplate.objects.filter(user=self.request.user).exclude(
                id=template.id
            ).update(is_default=False)


class ProposalViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOwner]
    serializer_class = ProposalSerializer
    queryset = Proposal.objects.select_related("lead", "template")

    def get_queryset(self):
        queryset = self.queryset.filter(user=self.request.user)
        lead = self.request.query_params.get("lead")
        if lead:
            queryset = queryset.filter(lead_id=lead)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        project_id = self.request.query_params.get("project_id")
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset

    def perform_create(self, serializer):
        ensure_default_template(self.request.user)
        serializer.save(user=self.request.user, status=Proposal.Status.DRAFT)

    @action(detail=False, methods=["post"], url_path="from-lead")
    def from_lead(self, request):
        serializer = ProposalFromLeadSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        proposal = serializer.save()
        if serializer.validated_data.get("generate", True):
            queue_proposal_generation(proposal)
            proposal.refresh_from_db()
        return Response(
            ProposalSerializer(proposal, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="generate")
    def generate(self, request, pk=None):
        proposal = self.get_object()
        queue_proposal_generation(proposal)
        proposal.refresh_from_db()
        return Response(ProposalSerializer(proposal, context={"request": request}).data)

    @action(detail=True, methods=["post"], url_path="send")
    def send(self, request, pk=None):
        proposal = self.get_object()
        mark_proposal_sent(proposal)
        return Response(ProposalSerializer(proposal, context={"request": request}).data)
