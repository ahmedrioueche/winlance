from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    MilestoneViewSet,
    PortalAcceptContractView,
    PortalAcceptOfferView,
    PortalDashboardView,
    PortalRequirementDetailView,
    PortalRequirementListCreateView,
    ProjectFileViewSet,
    ProjectReportViewSet,
    ProjectViewSet,
    RequirementViewSet,
    TaskViewSet,
)

router = DefaultRouter()
router.register(r"projects", ProjectViewSet, basename="project")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "projects/<uuid:project_pk>/tasks/",
        TaskViewSet.as_view({"get": "list", "post": "create"}),
        name="project-task-list",
    ),
    path(
        "projects/<uuid:project_pk>/tasks/reorder/",
        TaskViewSet.as_view({"post": "reorder"}),
        name="project-task-reorder",
    ),
    path(
        "projects/<uuid:project_pk>/tasks/<uuid:pk>/",
        TaskViewSet.as_view(
            {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
        ),
        name="project-task-detail",
    ),
    path(
        "projects/<uuid:project_pk>/requirements/",
        RequirementViewSet.as_view({"get": "list", "post": "create"}),
        name="project-requirement-list",
    ),
    path(
        "projects/<uuid:project_pk>/requirements/<uuid:pk>/",
        RequirementViewSet.as_view(
            {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
        ),
        name="project-requirement-detail",
    ),
    path(
        "projects/<uuid:project_pk>/milestones/",
        MilestoneViewSet.as_view({"get": "list", "post": "create"}),
        name="project-milestone-list",
    ),
    path(
        "projects/<uuid:project_pk>/milestones/<uuid:pk>/",
        MilestoneViewSet.as_view(
            {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
        ),
        name="project-milestone-detail",
    ),
    path(
        "projects/<uuid:project_pk>/reports/",
        ProjectReportViewSet.as_view({"get": "list", "post": "create"}),
        name="project-report-list",
    ),
    path(
        "projects/<uuid:project_pk>/reports/<uuid:pk>/",
        ProjectReportViewSet.as_view(
            {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
        ),
        name="project-report-detail",
    ),
    path(
        "projects/<uuid:project_pk>/files/",
        ProjectFileViewSet.as_view({"get": "list", "post": "create"}),
        name="project-file-list",
    ),
    path(
        "projects/<uuid:project_pk>/files/<uuid:pk>/",
        ProjectFileViewSet.as_view(
            {"get": "retrieve", "put": "update", "patch": "partial_update", "delete": "destroy"}
        ),
        name="project-file-detail",
    ),
    # Client portal (secure share link)
    path("portal/<str:token>/", PortalDashboardView.as_view(), name="portal-dashboard"),
    path(
        "portal/<str:token>/requirements/",
        PortalRequirementListCreateView.as_view(),
        name="portal-requirement-list",
    ),
    path(
        "portal/<str:token>/requirements/<uuid:requirement_id>/",
        PortalRequirementDetailView.as_view(),
        name="portal-requirement-detail",
    ),
    path(
        "portal/<str:token>/accept-offer/",
        PortalAcceptOfferView.as_view(),
        name="portal-accept-offer",
    ),
    path(
        "portal/<str:token>/accept-contract/",
        PortalAcceptContractView.as_view(),
        name="portal-accept-contract",
    ),
]
