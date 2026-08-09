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

    def test_auto_project_and_task_generation_on_proposal_acceptance(self):
        proposal = Proposal.objects.create(
            user=self.user,
            lead=self.lead,
            title="Proposal for Acme Platform v2",
            target_project_name="Acme Platform v2",
            summary="Full e-commerce platform delivery",
            body="""# Scope of Work
## Phase 1: Setup & Design
- [ ] Database Schema Setup
- [ ] UI Wireframing & Design Tokens

## Phase 2: Core Development
- [ ] Stripe Payment Gateway Integration
- [ ] User Auth & Permission System
""",
            amount=12000,
            status=Proposal.Status.SENT,
        )

        # Accept proposal via API action
        res = self.client.post(reverse("proposal-accept", kwargs={"pk": str(proposal.id)}))
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Create project from accepted proposal via API action
        create_res = self.client.post(reverse("proposal-create-project", kwargs={"pk": str(proposal.id)}))
        self.assertEqual(create_res.status_code, status.HTTP_200_OK)

        proposal.refresh_from_db()
        self.assertIsNotNone(proposal.project_id)
        
        project = Project.objects.get(id=proposal.project_id)
        # Verify title uses target_project_name
        self.assertEqual(project.title, "Acme Platform v2")
        self.assertEqual(project.status, Project.Status.ACTIVE)

        # Verify tasks were automatically seeded
        tasks = list(project.tasks.order_by("order"))
        self.assertGreaterEqual(len(tasks), 4)
        self.assertEqual(tasks[0].title, "Database Schema Setup")
        self.assertEqual(tasks[1].title, "UI Wireframing & Design Tokens")
        self.assertEqual(tasks[2].title, "Stripe Payment Gateway Integration")

        # Test project deletion and re-creation from same proposal
        project_id_before = project.id
        self.client.delete(reverse("project-detail", kwargs={"pk": str(project_id_before)}))
        proposal.refresh_from_db()
        self.assertIsNone(proposal.project_id)

        # Re-create project from proposal
        recreate_res = self.client.post(reverse("proposal-create-project", kwargs={"pk": str(proposal.id)}))
        self.assertEqual(recreate_res.status_code, status.HTTP_200_OK)
        proposal.refresh_from_db()
        self.assertIsNotNone(proposal.project_id)
        self.assertNotEqual(proposal.project_id, project_id_before)

    def test_task_crud_and_reorder_api(self):
        project = Project.objects.create(
            freelancer=self.user,
            title="Task Test Project",
            status=Project.Status.ACTIVE,
        )
        project.tasks.all().delete()
        
        # 1. Create tasks
        t1 = self.client.post(
            reverse("project-task-list", kwargs={"project_pk": str(project.id)}),
            {"title": "Task 1", "priority": "HIGH", "status": "TODO"},
            format="json",
        )
        self.assertEqual(t1.status_code, status.HTTP_201_CREATED)
        task1_id = t1.data["id"]

        t2 = self.client.post(
            reverse("project-task-list", kwargs={"project_pk": str(project.id)}),
            {"title": "Task 2", "priority": "MEDIUM", "status": "TODO"},
            format="json",
        )
        task2_id = t2.data["id"]

        # 2. Update status & priority
        patch_res = self.client.patch(
            reverse("project-task-detail", kwargs={"project_pk": str(project.id), "pk": task1_id}),
            {"status": "IN_PROGRESS", "priority": "URGENT"},
            format="json",
        )
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_res.data["status"], "IN_PROGRESS")
        self.assertEqual(patch_res.data["priority"], "URGENT")

        # 3. Reorder tasks
        reorder_res = self.client.post(
            reverse("project-task-reorder", kwargs={"project_pk": str(project.id)}),
            {"orders": [task2_id, task1_id]},
            format="json",
        )
        self.assertEqual(reorder_res.status_code, status.HTTP_200_OK)
        
        # 4. List tasks
        list_res = self.client.get(reverse("project-task-list", kwargs={"project_pk": str(project.id)}))
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        results = list_res.data.get("results", list_res.data)
        self.assertEqual(len(results), 2)
        self.assertEqual(results[0]["id"], task2_id)
        self.assertEqual(results[1]["id"], task1_id)
