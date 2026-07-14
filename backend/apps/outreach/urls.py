from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ChecklistItemViewSet,
    ChecklistViewSet,
    PlaybookViewSet,
    SequenceStepViewSet,
    SequenceViewSet,
    TagViewSet,
    TemplateViewSet,
)

router = DefaultRouter()
router.register(r"outreach/tags", TagViewSet, basename="outreach-tag")
router.register(r"outreach/templates", TemplateViewSet, basename="outreach-template")
router.register(r"outreach/sequences", SequenceViewSet, basename="outreach-sequence")
router.register(r"outreach/sequence-steps", SequenceStepViewSet, basename="outreach-sequence-step")
router.register(r"outreach/checklists", ChecklistViewSet, basename="outreach-checklist")
router.register(r"outreach/checklist-items", ChecklistItemViewSet, basename="outreach-checklist-item")
router.register(r"outreach/playbook", PlaybookViewSet, basename="outreach-playbook")

urlpatterns = [
    path("", include(router.urls)),
]
