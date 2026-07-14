from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.analytics.models import FunnelSnapshot
from apps.leads.models import Lead
from apps.projects.models import Milestone, Project, ProjectReport

User = get_user_model()


class AnalyticsAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="freelancer",
            email="freelancer@example.com",
            password="password123",
        )
        Lead.objects.create(
            user=self.user, title="A", status=Lead.Status.NEW, estimated_value=1000
        )
        Lead.objects.create(
            user=self.user,
            title="B",
            status=Lead.Status.PROPOSAL_SENT,
            estimated_value=5000,
        )
        Lead.objects.create(
            user=self.user, title="C", status=Lead.Status.WON, estimated_value=8000
        )
        Lead.objects.create(
            user=self.user, title="D", status=Lead.Status.LOST, estimated_value=2000
        )
        self.project = Project.objects.create(
            freelancer=self.user,
            title="Client App",
            status=Project.Status.ACTIVE,
        )
        Milestone.objects.create(
            project=self.project,
            title="Discovery",
            status=Milestone.Status.DONE,
            progress_percent=100,
        )
        Milestone.objects.create(
            project=self.project,
            title="Build",
            status=Milestone.Status.IN_PROGRESS,
            progress_percent=40,
        )
        ProjectReport.objects.create(
            project=self.project,
            title="Week 1",
            body="Started build",
            is_visible_to_client=True,
        )
        self.client.force_authenticate(user=self.user)

    def test_funnel_metrics(self):
        response = self.client.get(reverse("analytics-funnel"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_leads"], 4)
        self.assertEqual(response.data["won_leads"], 1)
        self.assertEqual(response.data["lost_leads"], 1)
        self.assertEqual(response.data["open_leads"], 2)
        self.assertEqual(response.data["win_rate"], 50.0)
        self.assertEqual(len(response.data["stages"]), 8)

    def test_summary_and_snapshot(self):
        summary = self.client.get(reverse("analytics-summary"))
        self.assertEqual(summary.status_code, status.HTTP_200_OK)
        self.assertIn("kpis", summary.data)
        self.assertEqual(summary.data["kpis"]["open_leads"], 2)

        create = self.client.post(reverse("analytics-snapshots"))
        self.assertEqual(create.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FunnelSnapshot.objects.filter(user=self.user).count(), 1)

    def test_project_progress_report(self):
        response = self.client.get(
            reverse(
                "analytics-project-progress",
                kwargs={"project_id": self.project.id},
            )
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["progress_percent"], 50)
        self.assertEqual(response.data["milestone_summary"]["done"], 1)
        self.assertEqual(len(response.data["recent_reports"]), 1)
