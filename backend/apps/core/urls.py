from django.urls import path

from .views import health_check, ready_check

urlpatterns = [
    path("health/", health_check, name="health-check"),
    path("health/ready/", ready_check, name="health-ready"),
]
