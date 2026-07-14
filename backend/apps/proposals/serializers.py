from rest_framework import serializers

from apps.leads.models import Lead

from .models import Proposal, ProposalTemplate
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


class ProposalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proposal
        fields = [
            "id",
            "user",
            "lead",
            "project_id",
            "template",
            "title",
            "summary",
            "body",
            "amount",
            "currency",
            "status",
            "generation_task_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "status",
            "generation_task_id",
            "created_at",
            "updated_at",
        ]

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
            amount=validated_data.get("amount"),
            template=template,
            currency=validated_data.get("currency") or "USD",
        )
