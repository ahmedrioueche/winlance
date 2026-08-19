from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("apps.core.urls")),
    path("api/v1/", include("apps.accounts.urls")),
    path("api/v1/", include("apps.accounts.social_urls")),
    path("api/v1/", include("apps.clients.urls")),
    path("api/v1/", include("apps.leads.urls")),
    path("api/v1/", include("apps.proposals.urls")),
    path("api/v1/", include("apps.portal.urls")),
    path("api/v1/", include("apps.contracts.urls")),
    path("api/v1/", include("apps.projects.urls")),
    path("api/v1/", include("apps.outreach.urls")),
    path("api/v1/", include("apps.ai_coach.urls")),
    path("api/v1/", include("apps.analytics.urls")),
]
