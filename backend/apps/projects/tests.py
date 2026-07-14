from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.contracts.models import Contract
from apps.leads.models import Lead
from apps.projects.models import Project
from apps.proposals.models import Proposal
from apps.proposals.services import generate_proposal_content

User = get_user_model()


class ProjectPortalAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="freelancer",
            email="freelancer@example.com",
            password="password123",
        )
        self.other = User.objects.create_user(
            username="other",
            email="other@example.com",
            password="password123",
        )
        self.lead = Lead.objects.create(
            user=self.user,
            title="Portal Lead",
            description="Build a client portal",
            estimated_value=9000,
            status=Lead.Status.PROPOSAL_SENT,
        )
        self.proposal = Proposal.objects.create(
            user=self.user,
            lead=self.lead,
            title="Portal Offer",
            summary="Shared dashboard delivery",
            amount=9000,
            status=Proposal.Status.DRAFT,
        )
        generate_proposal_content(self.proposal)
        self.contract = Contract.objects.create(
            user=self.user,
            proposal=self.proposal,
            lead=self.lead,
            title="Portal Contract",
            body="Agreement terms",
            amount=9000,
            status=Contract.Status.READY,
        )
        self.client.force_authenticate(user=self.user)

    def test_create_project_from_proposal_with_share_link(self):
        response = self.client.post(
            reverse("project-from-proposal"),
            {
                "proposal_id": str(self.proposal.id),
                "client_email": "client@acme.com",
                "client_name": "Ada Client",
                "create_share_link": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Portal Offer")
        self.assertIn("share_link", response.data)
        self.assertIn("token", response.data["share_link"])
        self.proposal.refresh_from_db()
        self.assertEqual(str(self.proposal.project_id), response.data["id"])

    def test_portal_dashboard_exposes_requirements_offer_contract_progress_reports(self):
        create = self.client.post(
            reverse("project-from-proposal"),
            {
                "proposal_id": str(self.proposal.id),
                "create_share_link": True,
            },
            format="json",
        )
        project_id = create.data["id"]
        token = create.data["share_link"]["token"]

        self.client.post(
            reverse("project-requirement-list", kwargs={"project_pk": project_id}),
            {"title": "Auth module", "description": "JWT + social"},
            format="json",
        )
        self.client.post(
            reverse("project-milestone-list", kwargs={"project_pk": project_id}),
            {"title": "MVP", "status": "IN_PROGRESS", "progress_percent": 40},
            format="json",
        )
        self.client.post(
            reverse("project-report-list", kwargs={"project_pk": project_id}),
            {
                "title": "Week 1",
                "body": "Scaffold complete",
                "is_visible_to_client": True,
            },
            format="json",
        )
        self.client.post(
            reverse("project-attach-contract", kwargs={"pk": project_id}),
            {"contract_id": str(self.contract.id)},
            format="json",
        )

        self.client.credentials()  # anonymous client portal access
        portal = self.client.get(reverse("portal-dashboard", kwargs={"token": token}))
        self.assertEqual(portal.status_code, status.HTTP_200_OK)
        self.assertEqual(portal.data["project"]["title"], "Portal Offer")
        self.assertEqual(len(portal.data["requirements"]), 1)
        self.assertEqual(portal.data["offer"]["title"], "Portal Offer")
        self.assertEqual(portal.data["contract"]["title"], "Portal Contract")
        self.assertEqual(len(portal.data["progress"]["milestones"]), 1)
        self.assertEqual(len(portal.data["reports"]), 1)

    def test_client_can_edit_requirements_via_portal(self):
        create = self.client.post(
            reverse("project-from-proposal"),
            {"proposal_id": str(self.proposal.id), "create_share_link": True},
            format="json",
        )
        token = create.data["share_link"]["token"]
        project_id = create.data["id"]

        req = self.client.post(
            reverse("project-requirement-list", kwargs={"project_pk": project_id}),
            {"title": "Initial scope"},
            format="json",
        )
        req_id = req.data["id"]

        self.client.credentials()
        created = self.client.post(
            reverse("portal-requirement-list", kwargs={"token": token}),
            {"title": "Client-added API docs"},
            format="json",
        )
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        self.assertEqual(created.data["created_by_role"], "client")

        patched = self.client.patch(
            reverse(
                "portal-requirement-detail",
                kwargs={"token": token, "requirement_id": req_id},
            ),
            {"title": "Updated by client", "description": "Clarified scope"},
            format="json",
        )
        self.assertEqual(patched.status_code, status.HTTP_200_OK)
        self.assertEqual(patched.data["title"], "Updated by client")
        self.assertEqual(patched.data["updated_by_role"], "client")

    def test_invalid_share_token_returns_404(self):
        self.client.credentials()
        response = self.client.get(
            reverse("portal-dashboard", kwargs={"token": "not-a-real-token"})
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_other_user_cannot_access_project(self):
        project = Project.objects.create(
            freelancer=self.user,
            title="Private",
            status=Project.Status.ACTIVE,
        )
        self.client.force_authenticate(user=self.other)
        response = self.client.get(reverse("project-detail", args=[project.id]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_accept_offer_and_contract_via_portal(self):
        create = self.client.post(
            reverse("project-from-proposal"),
            {"proposal_id": str(self.proposal.id), "create_share_link": True},
            format="json",
        )
        project_id = create.data["id"]
        token = create.data["share_link"]["token"]
        self.client.post(
            reverse("project-attach-contract", kwargs={"pk": project_id}),
            {"contract_id": str(self.contract.id)},
            format="json",
        )
        self.proposal.status = Proposal.Status.SENT
        self.proposal.save(update_fields=["status"])

        self.client.credentials()
        offer = self.client.post(
            reverse("portal-accept-offer", kwargs={"token": token})
        )
        self.assertEqual(offer.status_code, status.HTTP_200_OK)
        self.assertEqual(offer.data["status"], Proposal.Status.ACCEPTED)

        contract = self.client.post(
            reverse("portal-accept-contract", kwargs={"token": token})
        )
        self.assertEqual(contract.status_code, status.HTTP_200_OK)
        self.assertEqual(contract.data["status"], Contract.Status.SIGNED)
