from django.urls import path

from . import views

urlpatterns = [
    path("portal/<str:token>/info/", views.portal_info, name="portal-info"),
    path("portal/<str:token>/verify-passcode/", views.verify_passcode, name="portal-verify-passcode"),
    path("portal/<str:token>/proposals/", views.portal_proposals_list, name="portal-proposals-list"),
    path("portal/<str:token>/proposals/<uuid:proposal_id>/", views.portal_proposal_detail, name="portal-proposal-detail"),
    path("portal/<str:token>/proposals/<uuid:proposal_id>/suggest-edits/", views.portal_suggest_edits, name="portal-suggest-edits"),
    path("portal/<str:token>/proposals/<uuid:proposal_id>/accept/", views.portal_accept_proposal, name="portal-accept-proposal"),
    path("portal/<str:token>/projects/", views.portal_projects_list, name="portal-projects-list"),
    path("portal/<str:token>/projects/<uuid:project_id>/", views.portal_project_detail, name="portal-project-detail"),
    path("portal/<str:token>/projects/<uuid:project_id>/tasks/<uuid:task_id>/approve/", views.portal_approve_task, name="portal-approve-task"),
    path("portal/<str:token>/projects/<uuid:project_id>/milestones/<uuid:milestone_id>/approve/", views.portal_approve_milestone, name="portal-approve-milestone"),
    path("portal/<str:token>/contracts/", views.portal_contracts_list, name="portal-contracts-list"),
    path("portal/<str:token>/contracts/<uuid:contract_id>/", views.portal_contract_detail, name="portal-contract-detail"),
    path("portal/<str:token>/contracts/<uuid:contract_id>/sign/", views.portal_sign_contract, name="portal-sign-contract"),
]
