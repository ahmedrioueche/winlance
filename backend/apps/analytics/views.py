from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.projects.models import Project

from .models import FunnelSnapshot
from .serializers import FunnelSnapshotSerializer
from .services import (
    build_analytics_summary,
    build_project_progress_report,
    compute_funnel_metrics,
    queue_funnel_snapshot,
)


class FunnelAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(compute_funnel_metrics(request.user))


class AnalyticsSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(build_analytics_summary(request.user))


class FunnelSnapshotListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        snapshots = FunnelSnapshot.objects.filter(user=request.user)[:20]
        return Response(FunnelSnapshotSerializer(snapshots, many=True).data)

    def post(self, request):
        snapshot = queue_funnel_snapshot(request.user.id)
        if snapshot is not None:
            return Response(
                FunnelSnapshotSerializer(snapshot).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(
            {"message": "Funnel snapshot refresh queued."},
            status=status.HTTP_202_ACCEPTED,
        )


class ProjectProgressReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        project = Project.objects.filter(
            id=project_id, freelancer=request.user
        ).prefetch_related("milestones", "reports", "requirements").first()
        if not project:
            return Response(
                {"error": {"message": "Project not found.", "status_code": 404}},
                status=404,
            )
        return Response(build_project_progress_report(project, for_client=False))
