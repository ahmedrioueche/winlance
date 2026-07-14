from rest_framework import serializers

from apps.proposals.models import Proposal

from .models import Contract, ContractTemplate
from .services import create_contract_from_proposal


class ContractTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContractTemplate
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


class ContractSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contract
        fields = [
            "id",
            "user",
            "proposal",
            "lead",
            "project_id",
            "template",
            "title",
            "body",
            "export_content",
            "amount",
            "currency",
            "status",
            "generation_task_id",
            "export_task_id",
            "signed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "status",
            "export_content",
            "generation_task_id",
            "export_task_id",
            "signed_at",
            "created_at",
            "updated_at",
        ]

    def validate_proposal(self, proposal):
        if proposal is None:
            return proposal
        request = self.context.get("request")
        if request and proposal.user_id != request.user.id:
            raise serializers.ValidationError("Proposal not found or not owned by you.")
        return proposal

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


class ContractFromProposalSerializer(serializers.Serializer):
    proposal_id = serializers.UUIDField()
    title = serializers.CharField(required=False, allow_blank=True)
    template_id = serializers.UUIDField(required=False, allow_null=True)
    generate = serializers.BooleanField(default=True)

    def create(self, validated_data):
        request = self.context["request"]
        proposal = Proposal.objects.filter(
            id=validated_data["proposal_id"], user=request.user
        ).first()
        if not proposal:
            raise serializers.ValidationError({"proposal_id": "Proposal not found."})

        template = None
        template_id = validated_data.get("template_id")
        if template_id:
            template = ContractTemplate.objects.filter(
                id=template_id, user=request.user
            ).first()
            if not template:
                raise serializers.ValidationError({"template_id": "Template not found."})

        return create_contract_from_proposal(
            request.user,
            proposal,
            title=validated_data.get("title") or None,
            template=template,
        )
