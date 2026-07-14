from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.core.permissions import IsOwner

from .models import CoachSession
from .serializers import CoachSessionCreateSerializer, CoachSessionSerializer
from .services import queue_coach_session


class CoachSessionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOwner]
    serializer_class = CoachSessionSerializer
    http_method_names = ["get", "post", "head", "options"]
    queryset = CoachSession.objects.select_related("lead", "proposal")

    def get_queryset(self):
        qs = self.queryset.filter(user=self.request.user)
        guidance_type = self.request.query_params.get("guidance_type")
        if guidance_type:
            qs = qs.filter(guidance_type=guidance_type)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        lead = self.request.query_params.get("lead")
        if lead:
            qs = qs.filter(lead_id=lead)
        return qs

    def create(self, request, *args, **kwargs):
        serializer = CoachSessionCreateSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        session = serializer.save()
        return Response(
            CoachSessionSerializer(session, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="regenerate", url_name="regenerate")
    def regenerate(self, request, pk=None):
        session = self.get_object()
        queue_coach_session(session)
        session.refresh_from_db()
        return Response(CoachSessionSerializer(session, context={"request": request}).data)
