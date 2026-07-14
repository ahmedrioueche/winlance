from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.core.permissions import IsOwner

from .models import Company, Contact, FollowUp, Lead, Note
from .serializers import (
    CompanySerializer,
    ContactSerializer,
    FollowUpCompleteSerializer,
    FollowUpSerializer,
    LeadSerializer,
    LeadTransitionSerializer,
    NoteSerializer,
)
from .services import (
    apply_lead_filters,
    complete_follow_up,
    overdue_follow_ups_queryset,
    pipeline_summary,
    rescore_lead,
    schedule_follow_up,
    transition_lead,
    upcoming_follow_ups_queryset,
)


class UserOwnedViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CompanyViewSet(UserOwnedViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer


class LeadViewSet(UserOwnedViewSet):
    queryset = Lead.objects.select_related("company").prefetch_related(
        "contacts", "notes", "follow_ups"
    )
    serializer_class = LeadSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        try:
            return apply_lead_filters(queryset, self.request.query_params)
        except (TypeError, ValueError) as exc:
            raise ValidationError({"detail": "Invalid filter parameters."}) from exc

    @action(detail=False, methods=["get"], url_path="pipeline")
    def pipeline(self, request):
        return Response(pipeline_summary(request.user))

    @action(detail=True, methods=["post"], url_path="transition")
    def transition(self, request, pk=None):
        lead = self.get_object()
        serializer = LeadTransitionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        transition_lead(
            lead,
            serializer.validated_data["status"],
            sync_probability=serializer.validated_data["sync_probability"],
        )
        return Response(LeadSerializer(lead, context={"request": request}).data)

    @action(detail=True, methods=["post"], url_path="rescore")
    def rescore(self, request, pk=None):
        lead = self.get_object()
        rescore_lead(lead)
        return Response(LeadSerializer(lead, context={"request": request}).data)

    @action(detail=True, methods=["post"], url_path="follow-ups")
    def create_follow_up(self, request, pk=None):
        lead = self.get_object()
        serializer = FollowUpSerializer(
            data={**request.data, "lead": lead.id},
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        follow_up = schedule_follow_up(
            lead,
            scheduled_at=serializer.validated_data["scheduled_at"],
            notes=serializer.validated_data.get("notes", ""),
        )
        return Response(
            FollowUpSerializer(follow_up, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class LeadRelatedViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(lead__user=self.request.user)

    def perform_create(self, serializer):
        instance = serializer.save()
        rescore_lead(instance.lead)
        return instance

    def perform_destroy(self, instance):
        lead = instance.lead
        instance.delete()
        rescore_lead(lead)


class ContactViewSet(LeadRelatedViewSet):
    queryset = Contact.objects.select_related("lead")
    serializer_class = ContactSerializer


class NoteViewSet(LeadRelatedViewSet):
    queryset = Note.objects.select_related("lead")
    serializer_class = NoteSerializer


class FollowUpViewSet(LeadRelatedViewSet):
    queryset = FollowUp.objects.select_related("lead")
    serializer_class = FollowUpSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        params = self.request.query_params

        completed = params.get("completed")
        if completed is not None:
            queryset = queryset.filter(completed=completed.lower() == "true")

        if params.get("overdue", "").lower() == "true":
            queryset = overdue_follow_ups_queryset(queryset)

        if params.get("upcoming", "").lower() == "true":
            within = params.get("within_hours")
            queryset = upcoming_follow_ups_queryset(
                queryset,
                within_hours=int(within) if within not in (None, "") else None,
            )

        return queryset

    @action(detail=True, methods=["post"], url_path="complete")
    def complete(self, request, pk=None):
        follow_up = self.get_object()
        serializer = FollowUpCompleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        complete_follow_up(follow_up, notes=serializer.validated_data.get("notes"))
        return Response(FollowUpSerializer(follow_up, context={"request": request}).data)
