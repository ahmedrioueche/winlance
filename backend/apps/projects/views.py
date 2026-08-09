from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.contracts.models import Contract
from apps.proposals.models import Proposal

from .models import Milestone, Project, ProjectFile, ProjectReport, ProjectShareLink, Requirement, Task
from .permissions import IsProjectFreelancer
from .serializers import (
    AttachContractSerializer,
    AttachProposalSerializer,
    MilestoneSerializer,
    PortalRequirementSerializer,
    ProjectFileSerializer,
    ProjectFromProposalSerializer,
    ProjectReportSerializer,
    ProjectSerializer,
    ProjectShareLinkSerializer,
    RequirementSerializer,
    TaskSerializer,
)
from .services import (
    accept_contract_via_portal,
    accept_offer_via_portal,
    attach_contract,
    attach_proposal,
    build_dashboard,
    create_share_link,
    get_valid_share_link,
    reorder_project_tasks,
    touch_share_link,
    upsert_requirement,
)


class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsProjectFreelancer]
    serializer_class = ProjectSerializer
    queryset = Project.objects.prefetch_related(
        "requirements", "milestones", "reports", "files"
    ).select_related("proposal", "contract", "lead")

    def get_queryset(self):
        return self.queryset.filter(freelancer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(freelancer=self.request.user)

    def perform_destroy(self, instance):
        if instance.proposal_id:
            Proposal.objects.filter(id=instance.proposal_id).update(project_id=None)
        Proposal.objects.filter(project_id=instance.id).update(project_id=None)
        instance.delete()

    @action(detail=False, methods=["post"], url_path="from-proposal")
    def from_proposal(self, request):
        serializer = ProjectFromProposalSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        project = serializer.save()
        share_link = None
        if serializer.validated_data.get("create_share_link", True):
            share_link = create_share_link(project)
        data = ProjectSerializer(project, context={"request": request}).data
        if share_link:
            data["share_link"] = ProjectShareLinkSerializer(share_link).data
        return Response(data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], url_path="dashboard")
    def dashboard(self, request, pk=None):
        project = self.get_object()
        return Response(build_dashboard(project, for_client=False))

    @action(detail=True, methods=["post"], url_path="share-links")
    def create_share_links(self, request, pk=None):
        project = self.get_object()
        link = create_share_link(
            project,
            label=request.data.get("label") or "Client access",
            expires_at=request.data.get("expires_at"),
        )
        return Response(
            ProjectShareLinkSerializer(link).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["get"], url_path="share-links/list")
    def list_share_links(self, request, pk=None):
        project = self.get_object()
        links = project.share_links.all()
        return Response(ProjectShareLinkSerializer(links, many=True).data)

    @action(detail=True, methods=["post"], url_path="attach-proposal", url_name="attach-proposal")
    def attach_proposal_action(self, request, pk=None):
        project = self.get_object()
        serializer = AttachProposalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        proposal = Proposal.objects.filter(
            id=serializer.validated_data["proposal_id"], user=request.user
        ).first()
        if not proposal:
            return Response(
                {"error": {"message": "Proposal not found.", "status_code": 400}},
                status=400,
            )
        attach_proposal(project, proposal, request.user)
        return Response(ProjectSerializer(project, context={"request": request}).data)

    @action(detail=True, methods=["post"], url_path="attach-contract", url_name="attach-contract")
    def attach_contract_action(self, request, pk=None):
        project = self.get_object()
        serializer = AttachContractSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        contract = Contract.objects.filter(
            id=serializer.validated_data["contract_id"], user=request.user
        ).first()
        if not contract:
            return Response(
                {"error": {"message": "Contract not found.", "status_code": 400}},
                status=400,
            )
        attach_contract(project, contract, request.user)
        return Response(ProjectSerializer(project, context={"request": request}).data)


class ProjectOwnedChildMixin:
    permission_classes = [IsAuthenticated, IsProjectFreelancer]
    project_lookup = "project_id"

    def get_project(self):
        return Project.objects.filter(
            id=self.kwargs["project_pk"], freelancer=self.request.user
        ).first()

    def get_queryset(self):
        return self.queryset.filter(
            project_id=self.kwargs["project_pk"],
            project__freelancer=self.request.user,
        )

    def perform_create(self, serializer):
        project = self.get_project()
        if not project:
            from rest_framework.exceptions import NotFound

            raise NotFound("Project not found.")
        serializer.save(project=project)


class TaskViewSet(ProjectOwnedChildMixin, viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    queryset = Task.objects.all()

    @action(detail=False, methods=["post"], url_path="reorder")
    def reorder(self, request, project_pk=None):
        project = self.get_project()
        if not project:
            from rest_framework.exceptions import NotFound

            raise NotFound("Project not found.")

        task_orders = request.data.get("orders") or request.data.get("task_orders") or request.data
        reorder_project_tasks(project, task_orders)

        tasks = TaskSerializer(project.tasks.all(), many=True).data
        return Response(tasks)


class RequirementViewSet(ProjectOwnedChildMixin, viewsets.ModelViewSet):
    serializer_class = RequirementSerializer
    queryset = Requirement.objects.all()

    def perform_create(self, serializer):
        project = self.get_project()
        if not project:
            from rest_framework.exceptions import NotFound

            raise NotFound("Project not found.")
        serializer.save(
            project=project,
            created_by_role="freelancer",
            updated_by_role="freelancer",
        )

    def perform_update(self, serializer):
        serializer.save(updated_by_role="freelancer")


class MilestoneViewSet(ProjectOwnedChildMixin, viewsets.ModelViewSet):
    serializer_class = MilestoneSerializer
    queryset = Milestone.objects.all()


class ProjectReportViewSet(ProjectOwnedChildMixin, viewsets.ModelViewSet):
    serializer_class = ProjectReportSerializer
    queryset = ProjectReport.objects.all()


class ProjectFileViewSet(ProjectOwnedChildMixin, viewsets.ModelViewSet):
    serializer_class = ProjectFileSerializer
    queryset = ProjectFile.objects.all()


class PortalDashboardView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_scope = "portal"

    def get(self, request, token):
        link = get_valid_share_link(token)
        touch_share_link(link)
        return Response(build_dashboard(link.project, for_client=True))


class PortalRequirementListCreateView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_scope = "portal"

    def get(self, request, token):
        link = get_valid_share_link(token)
        touch_share_link(link)
        data = RequirementSerializer(link.project.requirements.all(), many=True).data
        return Response(data)

    def post(self, request, token):
        link = get_valid_share_link(token)
        touch_share_link(link)
        serializer = PortalRequirementSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        requirement = upsert_requirement(
            link.project,
            title=serializer.validated_data["title"],
            description=serializer.validated_data.get("description", ""),
            order=serializer.validated_data.get("order", 0),
            role="client",
        )
        return Response(
            RequirementSerializer(requirement).data,
            status=status.HTTP_201_CREATED,
        )


class PortalRequirementDetailView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_scope = "portal"

    def patch(self, request, token, requirement_id):
        link = get_valid_share_link(token)
        touch_share_link(link)
        requirement = link.project.requirements.filter(id=requirement_id).first()
        if not requirement:
            return Response(
                {"error": {"message": "Requirement not found.", "status_code": 404}},
                status=404,
            )
        data = {
            "title": request.data.get("title", requirement.title),
            "description": request.data.get("description", requirement.description),
            "order": request.data.get("order", requirement.order),
        }
        serializer = PortalRequirementSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        requirement = upsert_requirement(
            link.project,
            title=serializer.validated_data["title"],
            description=serializer.validated_data.get("description", ""),
            order=serializer.validated_data.get("order", requirement.order),
            role="client",
            requirement=requirement,
        )
        return Response(RequirementSerializer(requirement).data)


class PortalAcceptOfferView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_scope = "portal"

    def post(self, request, token):
        link = get_valid_share_link(token)
        touch_share_link(link)
        proposal = accept_offer_via_portal(link.project)
        return Response({"status": proposal.status, "offer_id": str(proposal.id)})


class PortalAcceptContractView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_scope = "portal"

    def post(self, request, token):
        link = get_valid_share_link(token)
        touch_share_link(link)
        contract = accept_contract_via_portal(link.project)
        return Response(
            {
                "status": contract.status,
                "contract_id": str(contract.id),
                "signed_at": contract.signed_at,
            }
        )
