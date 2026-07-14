from rest_framework import serializers

from apps.contracts.models import Contract
from apps.leads.models import Lead
from apps.proposals.models import Proposal

from .models import (
    Milestone,
    Project,
    ProjectFile,
    ProjectReport,
    ProjectShareLink,
    Requirement,
)
from .services import create_project_from_proposal


class RequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Requirement
        fields = [
            "id",
            "project",
            "title",
            "description",
            "order",
            "created_by_role",
            "updated_by_role",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "project",
            "created_by_role",
            "updated_by_role",
            "created_at",
            "updated_at",
        ]


class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = [
            "id",
            "project",
            "title",
            "description",
            "status",
            "due_date",
            "progress_percent",
            "order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "project", "created_at", "updated_at"]

    def validate_progress_percent(self, value):
        if value > 100:
            raise serializers.ValidationError("Progress cannot exceed 100.")
        return value


class ProjectFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectFile
        fields = [
            "id",
            "project",
            "name",
            "url",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "project", "created_at", "updated_at"]


class ProjectReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectReport
        fields = [
            "id",
            "project",
            "title",
            "body",
            "is_visible_to_client",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "project", "created_at", "updated_at"]


class ProjectShareLinkSerializer(serializers.ModelSerializer):
    portal_path = serializers.SerializerMethodField()

    class Meta:
        model = ProjectShareLink
        fields = [
            "id",
            "project",
            "token",
            "label",
            "is_active",
            "expires_at",
            "last_accessed_at",
            "portal_path",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "project",
            "token",
            "last_accessed_at",
            "portal_path",
            "created_at",
            "updated_at",
        ]

    def get_portal_path(self, obj):
        return f"/api/v1/portal/{obj.token}/"


class ProjectSerializer(serializers.ModelSerializer):
    requirements = RequirementSerializer(many=True, read_only=True)
    milestones = MilestoneSerializer(many=True, read_only=True)
    reports = ProjectReportSerializer(many=True, read_only=True)
    files = ProjectFileSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "freelancer",
            "client",
            "client_email",
            "client_name",
            "lead",
            "proposal",
            "contract",
            "title",
            "summary",
            "status",
            "requirements",
            "milestones",
            "reports",
            "files",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "freelancer", "created_at", "updated_at"]

    def validate_lead(self, lead):
        if lead is None:
            return lead
        request = self.context.get("request")
        if request and lead.user_id != request.user.id:
            raise serializers.ValidationError("Lead not found or not owned by you.")
        return lead

    def validate_proposal(self, proposal):
        if proposal is None:
            return proposal
        request = self.context.get("request")
        if request and proposal.user_id != request.user.id:
            raise serializers.ValidationError("Proposal not found or not owned by you.")
        return proposal

    def validate_contract(self, contract):
        if contract is None:
            return contract
        request = self.context.get("request")
        if request and contract.user_id != request.user.id:
            raise serializers.ValidationError("Contract not found or not owned by you.")
        return contract


class ProjectFromProposalSerializer(serializers.Serializer):
    proposal_id = serializers.UUIDField()
    title = serializers.CharField(required=False, allow_blank=True)
    client_email = serializers.EmailField(required=False, allow_blank=True)
    client_name = serializers.CharField(required=False, allow_blank=True)
    create_share_link = serializers.BooleanField(default=True)

    def create(self, validated_data):
        request = self.context["request"]
        proposal = Proposal.objects.filter(
            id=validated_data["proposal_id"], user=request.user
        ).first()
        if not proposal:
            raise serializers.ValidationError({"proposal_id": "Proposal not found."})
        return create_project_from_proposal(
            request.user,
            proposal,
            title=validated_data.get("title") or None,
            client_email=validated_data.get("client_email") or "",
            client_name=validated_data.get("client_name") or "",
        )


class AttachProposalSerializer(serializers.Serializer):
    proposal_id = serializers.UUIDField()


class AttachContractSerializer(serializers.Serializer):
    contract_id = serializers.UUIDField()


class PortalRequirementSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True, default="")
    order = serializers.IntegerField(required=False, default=0, min_value=0)
