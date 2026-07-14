from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, LeadViewSet, ContactViewSet, NoteViewSet, FollowUpViewSet

router = DefaultRouter()
router.register(r'companies', CompanyViewSet, basename='company')
router.register(r'leads', LeadViewSet, basename='lead')
router.register(r'contacts', ContactViewSet, basename='contact')
router.register(r'notes', NoteViewSet, basename='note')
router.register(r'follow-ups', FollowUpViewSet, basename='follow-up')

urlpatterns = [
    path('', include(router.urls)),
]
