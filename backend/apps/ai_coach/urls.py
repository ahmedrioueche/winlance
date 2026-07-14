from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CoachSessionViewSet

router = DefaultRouter()
router.register(r"ai-coach/sessions", CoachSessionViewSet, basename="coach-session")

urlpatterns = [
    path("", include(router.urls)),
]
