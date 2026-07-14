from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ContractTemplateViewSet, ContractViewSet

router = DefaultRouter()
router.register(r"contract-templates", ContractTemplateViewSet, basename="contract-template")
router.register(r"contracts", ContractViewSet, basename="contract")

urlpatterns = [
    path("", include(router.urls)),
]
