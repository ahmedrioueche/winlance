from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.core.permissions import IsOwner

from .models import Proposal, ProposalTemplate, ProposalVersion
from .serializers import (
    ProposalFromLeadSerializer,
    ProposalSerializer,
    ProposalTemplateSerializer,
)
from .services import (
    cancel_proposal_generation,
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
    queryset = Proposal.objects.select_related("lead", "template").prefetch_related("versions")

    def get_queryset(self):
        queryset = self.queryset.filter(user=self.request.user)
        client_id = self.request.query_params.get("client") or self.request.query_params.get("client_id")
        if client_id:
            queryset = queryset.filter(client_id=client_id)
        lead = self.request.query_params.get("lead")
        if lead:
            queryset = queryset.filter(lead_id=lead)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        project_id = self.request.query_params.get("project_id")
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        q = self.request.query_params.get("q") or self.request.query_params.get("search")
        if q:
            queryset = queryset.filter(title__icontains=q.strip())
        return queryset.order_by("-updated_at", "-created_at")

    def perform_create(self, serializer):
        ensure_default_template(self.request.user)
        serializer.save(user=self.request.user, status=Proposal.Status.DRAFT)

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=True, methods=["post"], url_path="accept")
    def accept(self, request, pk=None):
        proposal = self.get_object()
        proposal.status = Proposal.Status.ACCEPTED
        proposal.save(update_fields=["status", "updated_at"])
        return Response(ProposalSerializer(proposal, context={"request": request}).data)

    @action(detail=True, methods=["post"], url_path="create-project")
    def create_project(self, request, pk=None):
        proposal = self.get_object()
        from apps.projects.services import ensure_project_and_tasks_for_proposal
        project = ensure_project_and_tasks_for_proposal(proposal, user=request.user)
        return Response({"project_id": str(project.id), "title": project.title})

    @action(detail=True, methods=["post"], url_path="create-version")
    def create_version(self, request, pk=None):
        proposal = self.get_object()
        body = request.data.get("body", proposal.body)
        title = request.data.get("title", proposal.title)
        amount = request.data.get("amount", proposal.amount)
        change_summary = request.data.get("change_summary", "Updated proposal draft")
        role = request.data.get("created_by_role", "freelancer")

        last_version = proposal.versions.order_by("-version_number").first()
        next_ver = (last_version.version_number + 1) if last_version else 1

        author_name = request.user.get_full_name() or request.user.username

        ProposalVersion.objects.create(
            proposal=proposal,
            version_number=next_ver,
            title=title,
            body=body,
            amount=amount,
            currency=proposal.currency,
            change_summary=change_summary,
            created_by_name=author_name,
            created_by_role=role,
        )

        proposal.body = body
        proposal.title = title
        proposal.amount = amount
        proposal.save()

        return Response(ProposalSerializer(proposal, context={"request": request}).data)

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

    @action(detail=True, methods=["post"], url_path="cancel-generation")
    def cancel_generation(self, request, pk=None):
        proposal = self.get_object()
        cancel_proposal_generation(proposal)
        return Response(ProposalSerializer(proposal, context={"request": request}).data)

    @action(detail=True, methods=["post"], url_path="send")
    def send(self, request, pk=None):
        proposal = self.get_object()
        mark_proposal_sent(proposal)
        return Response(ProposalSerializer(proposal, context={"request": request}).data)

    @action(detail=True, methods=["post"], url_path="send-email")
    def send_email(self, request, pk=None):
        proposal = self.get_object()
        recipients = request.data.get("recipients", [])
        custom_message = request.data.get("custom_message", "")
        portal_url = request.data.get("portal_url", "")

        from .services import send_proposal_email
        send_proposal_email(proposal, recipients, custom_message=custom_message, portal_url=portal_url)
        return Response(ProposalSerializer(proposal, context={"request": request}).data)

    @action(detail=False, methods=["post"], url_path="smart-import")
    def smart_import(self, request):
        raw_text = request.data.get("raw_text", "").strip()
        if not raw_text:
            return Response({"detail": "raw_text is required."}, status=status.HTTP_400_BAD_REQUEST)

        MAX_IMPORT_CHARS = 15_000
        if len(raw_text) > MAX_IMPORT_CHARS:
            return Response(
                {"detail": f"Input too long ({len(raw_text):,} chars). Maximum is {MAX_IMPORT_CHARS:,} characters."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from .ai_import import smart_import_proposal_text
        parsed_data = smart_import_proposal_text(raw_text)
        return Response(parsed_data)

    @action(detail=False, methods=["post"], url_path="generate-section")
    def generate_section(self, request):
        section_type = request.data.get("section", "summary")
        title = request.data.get("title", "")
        milestones = request.data.get("milestones", [])

        from .ai_import import generate_proposal_section_text
        text = generate_proposal_section_text(section_type, title, milestones)
        return Response({"text": text})


