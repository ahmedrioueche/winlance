from django.urls import path

from . import views

urlpatterns = [
    path("portal/<str:token>/info/", views.portal_info, name="portal-info"),
    path("portal/<str:token>/verify-passcode/", views.verify_passcode, name="portal-verify-passcode"),
    path("portal/<str:token>/proposals/", views.portal_proposals_list, name="portal-proposals-list"),
    path("portal/<str:token>/proposals/<uuid:proposal_id>/", views.portal_proposal_detail, name="portal-proposal-detail"),
    path("portal/<str:token>/proposals/<uuid:proposal_id>/suggest-edits/", views.portal_suggest_edits, name="portal-suggest-edits"),
    path("portal/<str:token>/proposals/<uuid:proposal_id>/accept/", views.portal_accept_proposal, name="portal-accept-proposal"),
]
