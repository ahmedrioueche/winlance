from rest_framework import serializers

from .models import Company, Contact, FollowUp, Lead, Note
from .services import assert_valid_transition, calculate_lead_score


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "id",
            "user",
            "name",
            "website",
            "industry",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]


class OwnedLeadFieldMixin:
    def _get_owned_lead(self, lead):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")
        if lead.user_id != request.user.id:
            raise serializers.ValidationError("Lead not found or not owned by you.")
        return lead


class ContactSerializer(OwnedLeadFieldMixin, serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = [
            "id",
            "lead",
            "first_name",
            "last_name",
            "email",
            "phone",
            "linkedin_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_lead(self, lead):
        return self._get_owned_lead(lead)


class NoteSerializer(OwnedLeadFieldMixin, serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "lead", "content", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_lead(self, lead):
        return self._get_owned_lead(lead)


class FollowUpSerializer(OwnedLeadFieldMixin, serializers.ModelSerializer):
    class Meta:
        model = FollowUp
        fields = [
            "id",
            "lead",
            "scheduled_at",
            "completed",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_lead(self, lead):
        return self._get_owned_lead(lead)


class LeadSerializer(serializers.ModelSerializer):
    contacts = ContactSerializer(many=True, read_only=True)
    notes = NoteSerializer(many=True, read_only=True)
    follow_ups = FollowUpSerializer(many=True, read_only=True)

    class Meta:
        model = Lead
        fields = [
            "id",
            "user",
            "company",
            "title",
            "description",
            "status",
            "probability",
            "score",
            "estimated_value",
            "contacts",
            "notes",
            "follow_ups",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "score", "created_at", "updated_at"]

    def validate_company(self, company):
        if company is None:
            return company
        request = self.context.get("request")
        if request and company.user_id != request.user.id:
            raise serializers.ValidationError("Company not found or not owned by you.")
        return company

    def validate_status(self, new_status):
        if self.instance and self.instance.status != new_status:
            assert_valid_transition(self.instance.status, new_status)
        return new_status

    def create(self, validated_data):
        lead = super().create(validated_data)
        lead.score = calculate_lead_score(lead)
        if "probability" not in self.initial_data:
            from .services import STATUS_PROBABILITY

            lead.probability = STATUS_PROBABILITY.get(lead.status, lead.probability)
        lead.save(update_fields=["score", "probability", "updated_at"])
        return lead

    def update(self, instance, validated_data):
        lead = super().update(instance, validated_data)
        lead.score = calculate_lead_score(lead)
        lead.save(update_fields=["score", "updated_at"])
        return lead


class LeadTransitionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Lead.Status.choices)
    sync_probability = serializers.BooleanField(default=True)


class FollowUpCompleteSerializer(serializers.Serializer):
    notes = serializers.CharField(required=False, allow_blank=True)
