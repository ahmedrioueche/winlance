from datetime import timedelta

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Company, Contact, FollowUp, Lead
from .services import calculate_lead_score, transition_lead

User = get_user_model()


class LeadsAPITests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(
            username="user1", email="user1@example.com", password="password123"
        )
        self.user2 = User.objects.create_user(
            username="user2", email="user2@example.com", password="password123"
        )

        self.company = Company.objects.create(user=self.user1, name="Acme Corp")
        self.lead1 = Lead.objects.create(
            user=self.user1,
            company=self.company,
            title="Website Redesign",
            status=Lead.Status.NEW,
            estimated_value=12000,
        )
        self.lead2 = Lead.objects.create(
            user=self.user2,
            title="SEO Optimization",
            status=Lead.Status.CONTACTED,
        )

        self.url = reverse("lead-list")

    def test_unauthenticated_cannot_access(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_can_only_see_their_leads(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["title"], "Website Redesign")

    def test_create_lead(self):
        self.client.force_authenticate(user=self.user1)
        data = {
            "title": "New Project",
            "status": Lead.Status.INTERESTED,
            "company": self.company.id,
        }
        response = self.client.post(self.url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Lead.objects.filter(user=self.user1).count(), 2)
        self.assertGreater(response.data["score"], 0)

    def test_cannot_update_other_user_lead(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse("lead-detail", args=[self.lead2.id])
        data = {"title": "Hacked Project"}
        response = self.client.patch(url, data)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_search_and_filter_leads(self):
        Lead.objects.create(
            user=self.user1,
            company=self.company,
            title="Mobile App Build",
            status=Lead.Status.INTERESTED,
            score=40,
        )
        self.client.force_authenticate(user=self.user1)

        search = self.client.get(self.url, {"q": "Acme"})
        self.assertEqual(search.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(search.data["results"]), 1)

        filtered = self.client.get(
            self.url, {"status": Lead.Status.NEW, "min_score": 0, "ordering": "-score"}
        )
        self.assertEqual(filtered.status_code, status.HTTP_200_OK)
        self.assertTrue(
            all(item["status"] == Lead.Status.NEW for item in filtered.data["results"])
        )

    def test_pipeline_summary(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(reverse("lead-pipeline"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total"], 1)
        new_stage = next(
            stage for stage in response.data["stages"] if stage["status"] == Lead.Status.NEW
        )
        self.assertEqual(new_stage["count"], 1)

    def test_valid_status_transition(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse("lead-transition", args=[self.lead1.id])
        response = self.client.post(url, {"status": Lead.Status.CONTACTED}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], Lead.Status.CONTACTED)
        self.assertEqual(response.data["probability"], 15)
        self.lead1.refresh_from_db()
        self.assertEqual(self.lead1.status, Lead.Status.CONTACTED)

    def test_invalid_status_transition_rejected(self):
        self.client.force_authenticate(user=self.user1)
        url = reverse("lead-transition", args=[self.lead1.id])
        response = self.client.post(url, {"status": Lead.Status.WON}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.lead1.refresh_from_db()
        self.assertEqual(self.lead1.status, Lead.Status.NEW)

    def test_cannot_attach_related_record_to_other_users_lead(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(
            reverse("contact-list"),
            {
                "lead": self.lead2.id,
                "first_name": "Eve",
                "email": "eve@example.com",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(Contact.objects.filter(email="eve@example.com").exists())

    def test_follow_up_complete_and_overdue_filter(self):
        self.client.force_authenticate(user=self.user1)
        past = timezone.now() - timedelta(days=1)
        follow_up = FollowUp.objects.create(
            lead=self.lead1,
            scheduled_at=past,
            completed=False,
            notes="Call back",
        )

        overdue = self.client.get(reverse("follow-up-list"), {"overdue": "true"})
        self.assertEqual(overdue.status_code, status.HTTP_200_OK)
        self.assertEqual(len(overdue.data["results"]), 1)

        complete = self.client.post(
            reverse("follow-up-complete", args=[follow_up.id]),
            {"notes": "Done"},
            format="json",
        )
        self.assertEqual(complete.status_code, status.HTTP_200_OK)
        self.assertTrue(complete.data["completed"])
        follow_up.refresh_from_db()
        self.assertTrue(follow_up.completed)

    def test_schedule_follow_up_via_lead_action(self):
        self.client.force_authenticate(user=self.user1)
        when = (timezone.now() + timedelta(days=2)).isoformat()
        response = self.client.post(
            reverse("lead-create-follow-up", args=[self.lead1.id]),
            {"scheduled_at": when, "notes": "Discovery prep"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FollowUp.objects.filter(lead=self.lead1).count(), 1)

    def test_rescore_action(self):
        self.client.force_authenticate(user=self.user1)
        Contact.objects.create(lead=self.lead1, first_name="Ada", email="ada@acme.com")
        response = self.client.post(reverse("lead-rescore", args=[self.lead1.id]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.lead1.refresh_from_db()
        self.assertEqual(self.lead1.score, calculate_lead_score(self.lead1))

    def test_transition_service_updates_score(self):
        lead = transition_lead(self.lead1, Lead.Status.CONTACTED)
        self.assertEqual(lead.status, Lead.Status.CONTACTED)
        self.assertGreater(lead.score, 0)
