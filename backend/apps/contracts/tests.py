from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.contracts.models import Contract
from apps.contracts.services import build_contract_export, generate_contract_content
from apps.leads.models import Lead
from apps.proposals.models import Proposal
from apps.proposals.services import generate_proposal_content

User = get_user_model()


class ContractAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="freelancer",
            email="freelancer@example.com",
            password="password123",
        )
        self.lead = Lead.objects.create(
            user=self.user,
            title="App Build",
            description="MVP delivery",
            estimated_value=15000,
            status=Lead.Status.NEGOTIATION,
        )
        self.proposal = Proposal.objects.create(
            user=self.user,
            lead=self.lead,
            title="App Build Offer",
            summary="Build an MVP in 8 weeks",
            amount=15000,
            status=Proposal.Status.DRAFT,
        )
        generate_proposal_content(self.proposal)
        self.client.force_authenticate(user=self.user)

    def test_create_contract_from_proposal(self):
        response = self.client.post(
            reverse("contract-from-proposal"),
            {"proposal_id": str(self.proposal.id), "generate": True},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], Contract.Status.READY)
        self.assertIn("Service Agreement", response.data["body"])
        self.assertEqual(response.data["lead"], self.lead.id)
        self.assertEqual(Contract.objects.filter(user=self.user).count(), 1)

    def test_export_contract(self):
        contract = Contract.objects.create(
            user=self.user,
            proposal=self.proposal,
            lead=self.lead,
            title="Export me",
            amount=15000,
            status=Contract.Status.DRAFT,
        )
        generate_contract_content(contract)
        response = self.client.post(reverse("contract-export", args=[contract.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        contract.refresh_from_db()
        self.assertTrue(contract.export_content)
        self.assertIn("Export me", contract.export_content)

        result = build_contract_export(contract)
        self.assertTrue(result.export_content)

    def test_sign_contract(self):
        contract = Contract.objects.create(
            user=self.user,
            proposal=self.proposal,
            lead=self.lead,
            title="Sign me",
            body="Terms",
            amount=15000,
            status=Contract.Status.READY,
        )
        response = self.client.post(
            reverse("contract-sign", args=[contract.id]),
            {"signed_name": "Jane Client", "signed_email": "jane@example.com"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], Contract.Status.SIGNED)
        self.assertIsNotNone(response.data["signed_at"])
        self.assertEqual(response.data["signed_name"], "Jane Client")
        self.assertEqual(response.data["signed_email"], "jane@example.com")

    def test_filter_by_project_id_for_future_portal(self):
        import uuid

        project_id = uuid.uuid4()
        Contract.objects.create(
            user=self.user,
            proposal=self.proposal,
            lead=self.lead,
            project_id=project_id,
            title="Portal contract",
            status=Contract.Status.READY,
        )
        response = self.client.get(
            reverse("contract-list"), {"project_id": str(project_id)}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
