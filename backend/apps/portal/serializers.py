from rest_framework import serializers

from apps.projects.models import (
    Milestone,
    Project,
    ProjectFile,
    ProjectReport,
    Requirement,
    Task,
)


class PortalTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "due_date",
            "order",
            "created_at",
        ]


class PortalMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = [
            "id",
            "title",
            "description",
            "status",
            "due_date",
            "progress_percent",
            "order",
        ]


class PortalRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Requirement
        fields = ["id", "title", "description", "order"]


class PortalProjectFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectFile
        fields = ["id", "name", "url", "notes", "created_at"]


class PortalProjectReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectReport
        fields = ["id", "title", "body", "created_at"]


class PortalProjectListSerializer(serializers.ModelSerializer):
    progress_percent = serializers.SerializerMethodField()
    milestones_count = serializers.SerializerMethodField()
    done_milestones_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "summary",
            "status",
            "start_date",
            "due_date",
            "budget",
            "currency",
            "created_at",
            "progress_percent",
            "milestones_count",
            "done_milestones_count",
        ]

    def get_milestones_count(self, obj):
        return obj.milestones.count()

    def get_done_milestones_count(self, obj):
        return obj.milestones.filter(status=Milestone.Status.DONE).count()

    def get_progress_percent(self, obj):
        if obj.status == Project.Status.COMPLETED:
            return 100
        milestones = list(obj.milestones.all())
        if not milestones:
            return 0
        done_count = sum(1 for m in milestones if m.status == Milestone.Status.DONE)
        return int(round((done_count / len(milestones)) * 100))


class PortalProjectDetailSerializer(PortalProjectListSerializer):
    tasks = PortalTaskSerializer(many=True, read_only=True)
    milestones = PortalMilestoneSerializer(many=True, read_only=True)
    requirements = PortalRequirementSerializer(many=True, read_only=True)
    files = PortalProjectFileSerializer(many=True, read_only=True)
    reports = serializers.SerializerMethodField()
    contract = serializers.SerializerMethodField()

    class Meta(PortalProjectListSerializer.Meta):
        fields = PortalProjectListSerializer.Meta.fields + [
            "tasks",
            "milestones",
            "requirements",
            "files",
            "reports",
            "contract",
        ]

    def get_reports(self, obj):
        # Only surface reports that the freelancer marked visible to the client
        visible_reports = obj.reports.filter(is_visible_to_client=True)
        return PortalProjectReportSerializer(visible_reports, many=True).data

    def get_contract(self, obj):
        from apps.contracts.models import Contract
        from apps.contracts.serializers import ContractSerializer

        contract = Contract.objects.filter(project_id=obj.id).exclude(status=Contract.Status.DRAFT).first()
        if not contract and obj.proposal_id:
            contract = Contract.objects.filter(proposal_id=obj.proposal_id).exclude(status=Contract.Status.DRAFT).first()
        if contract:
            return ContractSerializer(contract, context=self.context).data
        return None
