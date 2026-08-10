from rest_framework import serializers

from apps.leads.models import Lead

from .models import Proposal, ProposalMilestone, ProposalTemplate, ProposalVersion
from .services import create_proposal_from_lead


class ProposalTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProposalTemplate
        fields = [
            "id",
            "user",
            "name",
            "description",
            "body_template",
            "is_default",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]


class ProposalVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProposalVersion
        fields = [
            "id",
            "proposal",
            "version_number",
            "title",
            "body",
            "amount",
            "currency",
            "change_summary",
            "created_by_name",
            "created_by_role",
            "created_at",
        ]
        read_only_fields = ["id", "proposal", "version_number", "created_at"]


class ProposalMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProposalMilestone
        fields = [
            "id",
            "proposal",
            "title",
            "description",
            "amount",
            "percentage",
            "due_date",
            "order",
            "deliverables",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "proposal", "created_at", "updated_at"]


class ProposalSerializer(serializers.ModelSerializer):
    versions = ProposalVersionSerializer(many=True, read_only=True)
    milestones = ProposalMilestoneSerializer(many=True, required=False)

    class Meta:
        model = Proposal
        fields = [
            "id",
            "user",
            "lead",
            "project_id",
            "template",
            "title",
            "target_project_name",
            "summary",
            "body",
            "amount",
            "currency",
            "status",
            "generation_task_id",
            "versions",
            "milestones",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "generation_task_id",
            "created_at",
            "updated_at",
        ]

    def update(self, instance, validated_data):
        milestones_data = validated_data.pop("milestones", None)
        instance = super().update(instance, validated_data)

        if milestones_data is not None:
            instance.milestones.all().delete()
            to_create = [
                ProposalMilestone(
                    proposal=instance,
                    title=m.get("title", ""),
                    description=m.get("description", ""),
                    amount=m.get("amount", 0),
                    percentage=m.get("percentage", 0),
                    due_date=m.get("due_date"),
                    order=m.get("order", idx + 1),
                    deliverables=m.get("deliverables", []),
                )
                for idx, m in enumerate(milestones_data)
            ]
            if to_create:
                ProposalMilestone.objects.bulk_create(to_create)

        return instance

    def validate_lead(self, lead):
        if lead is None:
            return lead
        request = self.context.get("request")
        if request and lead.user_id != request.user.id:
            raise serializers.ValidationError("Lead not found or not owned by you.")
        return lead

    def validate_template(self, template):
        if template is None:
            return template
        request = self.context.get("request")
        if request and template.user_id != request.user.id:
            raise serializers.ValidationError("Template not found or not owned by you.")
        return template


class ProposalFromLeadSerializer(serializers.Serializer):
    lead_id = serializers.IntegerField()
    title = serializers.CharField(required=False, allow_blank=True)
    target_project_name = serializers.CharField(required=False, allow_blank=True)
    amount = serializers.DecimalField(
        max_digits=12, decimal_places=2, required=False, allow_null=True
    )
    currency = serializers.CharField(required=False, default="USD", max_length=3)
    template_id = serializers.UUIDField(required=False, allow_null=True)
    generate = serializers.BooleanField(default=True)

    def create(self, validated_data):
        request = self.context["request"]
        lead = Lead.objects.filter(id=validated_data["lead_id"], user=request.user).first()
        if not lead:
            raise serializers.ValidationError({"lead_id": "Lead not found."})

        template = None
        template_id = validated_data.get("template_id")
        if template_id:
            template = ProposalTemplate.objects.filter(
                id=template_id, user=request.user
            ).first()
            if not template:
                raise serializers.ValidationError({"template_id": "Template not found."})

        return create_proposal_from_lead(
            request.user,
            lead,
            title=validated_data.get("title") or None,
            target_project_name=validated_data.get("target_project_name") or None,
            amount=validated_data.get("amount"),
            template=template,
            currency=validated_data.get("currency") or "USD",
        )
