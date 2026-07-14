from django.urls import path

from .views import (
    AnalyticsSummaryView,
    FunnelAnalyticsView,
    FunnelSnapshotListCreateView,
    ProjectProgressReportView,
)

urlpatterns = [
    path("analytics/funnel/", FunnelAnalyticsView.as_view(), name="analytics-funnel"),
    path("analytics/summary/", AnalyticsSummaryView.as_view(), name="analytics-summary"),
    path(
        "analytics/snapshots/",
        FunnelSnapshotListCreateView.as_view(),
        name="analytics-snapshots",
    ),
    path(
        "analytics/projects/<uuid:project_id>/progress-report/",
        ProjectProgressReportView.as_view(),
        name="analytics-project-progress",
    ),
]
