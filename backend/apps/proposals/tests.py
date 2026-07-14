from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.leads.models import Company, Contact, Lead
from apps.proposals.models import Proposal
from apps.proposals.tasks import generate_proposal_draft

User = get_user_model()


class ProposalAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="freelancer",
            email="freelancer@example.com",
            password="password123",
            first_name="Free",
            last_name="Lancer",
        )
        self.other = User.objects.create_user(
            username="other",
            email="other@example.com",
            password="password123",
        )
        self.company = Company.objects.create(user=self.user, name="Acme Corp")
        self.lead = Lead.objects.create(
            user=self.user,
            company=self.company,
            title="Website Redesign",
            description="Rebuild marketing site",
            estimated_value=8000,
            status=Lead.Status.PROPOSAL_SENT,
        )
        Contact.objects.create(
            lead=self.lead,
            first_name="Ada",
            last_name="Client",
            email="ada@acme.com",
        )
        self.client.force_authenticate(user=self.user)

    def test_create_proposal_from_lead_generates_body(self):
        response = self.client.post(
            reverse("proposal-from-lead"),
            {"lead_id": self.lead.id, "generate": True},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], Proposal.Status.READY)
        self.assertIn("Website Redesign", response.data["body"])
        self.assertIn("Ada Client", response.data["body"])
        self.assertEqual(Proposal.objects.filter(user=self.user).count(), 1)

    def test_generate_task_apply(self):
        proposal = Proposal.objects.create(
            user=self.user,
            lead=self.lead,
            title="Manual offer",
            amount=5000,
            status=Proposal.Status.DRAFT,
        )
        result = generate_proposal_draft.apply(args=[str(proposal.id)])
        self.assertTrue(result.result["ok"])
        proposal.refresh_from_db()
        self.assertEqual(proposal.status, Proposal.Status.READY)
        self.assertTrue(proposal.body)

    def test_user_cannot_see_other_proposals(self):
        Proposal.objects.create(
            user=self.other,
            title="Secret",
            amount=1,
            status=Proposal.Status.DRAFT,
        )
        response = self.client.get(reverse("proposal-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 0)

    def test_send_requires_ready(self):
        proposal = Proposal.objects.create(
            user=self.user,
            lead=self.lead,
            title="Not ready",
            status=Proposal.Status.DRAFT,
        )
        response = self.client.post(reverse("proposal-send", args=[proposal.id]))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
