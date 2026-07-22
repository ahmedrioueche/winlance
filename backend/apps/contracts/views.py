from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.core.permissions import IsOwner

from .models import Contract, ContractTemplate
from .serializers import (
    ContractFromProposalSerializer,
    ContractSerializer,
    ContractTemplateSerializer,
)
from .services import (
    cancel_contract_generation,
    ensure_default_contract_template,
    mark_contract_sent,
    mark_contract_signed,
    queue_contract_export,
    queue_contract_generation,
)


class ContractTemplateViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOwner]
    serializer_class = ContractTemplateSerializer
    queryset = ContractTemplate.objects.all()

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        template = serializer.save(user=self.request.user)
        if template.is_default:
            ContractTemplate.objects.filter(user=self.request.user).exclude(
                id=template.id
            ).update(is_default=False)


class ContractViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOwner]
    serializer_class = ContractSerializer
    queryset = Contract.objects.select_related("proposal", "lead", "template")

    def get_queryset(self):
        queryset = self.queryset.filter(user=self.request.user)
        proposal = self.request.query_params.get("proposal")
        if proposal:
            queryset = queryset.filter(proposal_id=proposal)
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
        ensure_default_contract_template(self.request.user)
        serializer.save(user=self.request.user, status=Contract.Status.DRAFT)

    @action(detail=False, methods=["post"], url_path="from-proposal")
    def from_proposal(self, request):
        serializer = ContractFromProposalSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        contract = serializer.save()
        if serializer.validated_data.get("generate", True):
            queue_contract_generation(contract)
            contract.refresh_from_db()
        return Response(
            ContractSerializer(contract, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="generate")
    def generate(self, request, pk=None):
        contract = self.get_object()
        queue_contract_generation(contract)
        contract.refresh_from_db()
        return Response(ContractSerializer(contract, context={"request": request}).data)

    @action(detail=True, methods=["post"], url_path="cancel-generation")
    def cancel_generation(self, request, pk=None):
        contract = self.get_object()
        cancel_contract_generation(contract)
        return Response(ContractSerializer(contract, context={"request": request}).data)

    @action(detail=True, methods=["post"], url_path="export")
    def export(self, request, pk=None):
        contract = self.get_object()
        queue_contract_export(contract)
        contract.refresh_from_db()
        return Response(ContractSerializer(contract, context={"request": request}).data)

    @action(detail=True, methods=["post"], url_path="send")
    def send(self, request, pk=None):
        contract = self.get_object()
        mark_contract_sent(contract)
        return Response(ContractSerializer(contract, context={"request": request}).data)

    @action(detail=True, methods=["post"], url_path="sign")
    def sign(self, request, pk=None):
        contract = self.get_object()
        mark_contract_signed(contract)
        return Response(ContractSerializer(contract, context={"request": request}).data)
