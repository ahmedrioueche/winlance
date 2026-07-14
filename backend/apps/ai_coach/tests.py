from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.ai_coach.models import CoachSession
from apps.ai_coach.services import run_coach_generation
from apps.leads.models import Lead

User = get_user_model()


class AICoachAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="freelancer",
            email="freelancer@example.com",
            password="password123",
        )
        self.lead = Lead.objects.create(
            user=self.user,
            title="Website rebuild",
            description="Marketing site",
            status=Lead.Status.NEGOTIATION,
            estimated_value=12000,
            score=70,
        )
        self.client.force_authenticate(user=self.user)

    def test_create_pricing_session_runs_async_eager(self):
        response = self.client.post(
            reverse("coach-session-list"),
            {
                "guidance_type": "PRICING",
                "lead_id": self.lead.id,
                "prompt": "Help me price this",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], CoachSession.Status.READY)
        self.assertTrue(response.data["advice"])
        self.assertGreaterEqual(len(response.data["suggestions"]), 1)
        self.assertIn("lead", response.data["context_snapshot"])

    def test_follow_up_and_negotiation_types(self):
        for guidance_type in ("FOLLOW_UP", "NEGOTIATION"):
            response = self.client.post(
                reverse("coach-session-list"),
                {"guidance_type": guidance_type, "lead_id": self.lead.id},
                format="json",
            )
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertEqual(response.data["status"], CoachSession.Status.READY)

    def test_run_coach_generation_service(self):
        session = CoachSession.objects.create(
            user=self.user,
            lead=self.lead,
            guidance_type=CoachSession.GuidanceType.GENERAL,
            status=CoachSession.Status.PENDING,
            context_snapshot={"lead": {"title": "X", "status": "NEW"}},
        )
        run_coach_generation(session)
        session.refresh_from_db()
        self.assertEqual(session.status, CoachSession.Status.READY)
        self.assertTrue(session.advice)

    def test_user_scoped_list(self):
        other = User.objects.create_user(
            username="other", email="other@example.com", password="password123"
        )
        CoachSession.objects.create(
            user=other,
            guidance_type=CoachSession.GuidanceType.GENERAL,
            status=CoachSession.Status.READY,
            advice="secret",
        )
        response = self.client.get(reverse("coach-session-list"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 0)
