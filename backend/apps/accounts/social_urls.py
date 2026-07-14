from django.urls import path

from .views import SocialLoginView

urlpatterns = [
    path("auth/social/<str:provider>/", SocialLoginView.as_view(), name="auth-social-login"),
]
