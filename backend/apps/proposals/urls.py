from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ProposalTemplateViewSet, ProposalViewSet

router = DefaultRouter()
router.register(r"proposal-templates", ProposalTemplateViewSet, basename="proposal-template")
router.register(r"proposals", ProposalViewSet, basename="proposal")

urlpatterns = [
    path("", include(router.urls)),
]
