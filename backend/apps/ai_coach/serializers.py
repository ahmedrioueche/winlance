from rest_framework import serializers

from apps.leads.models import Lead
from apps.proposals.models import Proposal

from .models import CoachSession
from .services import create_coach_session


class CoachSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoachSession
        fields = [
            "id",
            "user",
            "lead",
            "proposal",
            "guidance_type",
            "status",
            "prompt",
            "context_snapshot",
            "advice",
            "suggestions",
            "error_message",
            "task_id",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "status",
            "context_snapshot",
            "advice",
            "suggestions",
            "error_message",
            "task_id",
            "created_at",
            "updated_at",
        ]


class CoachSessionCreateSerializer(serializers.Serializer):
    guidance_type = serializers.ChoiceField(choices=CoachSession.GuidanceType.choices)
    prompt = serializers.CharField(required=False, allow_blank=True, default="")
    lead_id = serializers.IntegerField(required=False, allow_null=True)
    proposal_id = serializers.UUIDField(required=False, allow_null=True)
    generate = serializers.BooleanField(default=True)

    def create(self, validated_data):
        request = self.context["request"]
        lead = None
        proposal = None
        lead_id = validated_data.get("lead_id")
        proposal_id = validated_data.get("proposal_id")

        if lead_id:
            lead = Lead.objects.filter(id=lead_id, user=request.user).first()
            if not lead:
                raise serializers.ValidationError({"lead_id": "Lead not found."})
        if proposal_id:
            proposal = Proposal.objects.filter(id=proposal_id, user=request.user).first()
            if not proposal:
                raise serializers.ValidationError({"proposal_id": "Proposal not found."})

        return create_coach_session(
            request.user,
            guidance_type=validated_data["guidance_type"],
            prompt=validated_data.get("prompt") or "",
            lead=lead,
            proposal=proposal,
            generate=validated_data.get("generate", True),
        )
