from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.outreach.models import Checklist, Sequence, Tag, Template

User = get_user_model()


class OutreachAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="freelancer",
            email="freelancer@example.com",
            password="password123",
            first_name="Free",
        )
        self.other = User.objects.create_user(
            username="other",
            email="other@example.com",
            password="password123",
        )
        self.client.force_authenticate(user=self.user)

    def test_create_template_with_tags_and_render(self):
        response = self.client.post(
            reverse("outreach-template-list"),
            {
                "title": "Cold email",
                "content": "Hi {{client_name}} at {{company}}, I'm {{freelancer_name}}.",
                "type": "EMAIL",
                "tag_names": ["cold-outreach", "email"],
                "is_playbook": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data["tags"]), 2)
        self.assertTrue(response.data["is_playbook"])

        rendered = self.client.post(
            reverse("outreach-template-render", args=[response.data["id"]]),
            {"client_name": "Ada", "company": "Acme"},
            format="json",
        )
        self.assertEqual(rendered.status_code, status.HTTP_200_OK)
        self.assertIn("Hi Ada at Acme", rendered.data["rendered"])
        self.assertIn("Free", rendered.data["rendered"])

    def test_sequence_with_steps(self):
        template = Template.objects.create(
            user=self.user,
            title="Intro",
            content="Hello",
            type=Template.TypeChoices.EMAIL,
        )
        sequence = self.client.post(
            reverse("outreach-sequence-list"),
            {
                "title": "3-touch sequence",
                "description": "Follow-up playbook",
                "tag_names": ["sequence"],
                "is_playbook": True,
            },
            format="json",
        )
        self.assertEqual(sequence.status_code, status.HTTP_201_CREATED)

        step = self.client.post(
            reverse("outreach-sequence-add-step", args=[sequence.data["id"]]),
            {"template_id": template.id, "delay_days": 2},
            format="json",
        )
        self.assertEqual(step.status_code, status.HTTP_201_CREATED)
        self.assertEqual(step.data["step_number"], 1)
        self.assertEqual(step.data["delay_days"], 2)

        detail = self.client.get(reverse("outreach-sequence-detail", args=[sequence.data["id"]]))
        self.assertEqual(len(detail.data["steps"]), 1)

    def test_checklist_and_playbook_summary(self):
        checklist = self.client.post(
            reverse("outreach-checklist-list"),
            {
                "title": "Discovery call prep",
                "tag_names": ["discovery"],
                "is_playbook": True,
            },
            format="json",
        )
        self.assertEqual(checklist.status_code, status.HTTP_201_CREATED)

        item = self.client.post(
            reverse("outreach-checklist-add-item", args=[checklist.data["id"]]),
            {"content": "Review LinkedIn", "order": 1},
            format="json",
        )
        self.assertEqual(item.status_code, status.HTTP_201_CREATED)

        playbook = self.client.get(reverse("outreach-playbook-list"))
        self.assertEqual(playbook.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(playbook.data["checklists"], 1)
        self.assertGreaterEqual(playbook.data["playbook_sequences"] + playbook.data["playbook_templates"], 0)

    def test_filter_templates_by_type_and_tag(self):
        Template.objects.create(
            user=self.user,
            title="LinkedIn note",
            content="Hey",
            type=Template.TypeChoices.LINKEDIN,
        )
        tagged = Template.objects.create(
            user=self.user,
            title="Pitch email",
            content="Pitch",
            type=Template.TypeChoices.EMAIL,
        )
        tag = Tag.objects.create(user=self.user, name="pitch", slug="pitch")
        tagged.tags.add(tag)

        by_type = self.client.get(reverse("outreach-template-list"), {"type": "LINKEDIN"})
        self.assertEqual(by_type.status_code, status.HTTP_200_OK)
        self.assertEqual(len(by_type.data["results"]), 1)

        by_tag = self.client.get(reverse("outreach-template-list"), {"tag": "pitch"})
        self.assertEqual(len(by_tag.data["results"]), 1)
        self.assertEqual(by_tag.data["results"][0]["title"], "Pitch email")

    def test_user_cannot_edit_others_template(self):
        template = Template.objects.create(
            user=self.other,
            title="Secret",
            content="Nope",
            type=Template.TypeChoices.EMAIL,
        )
        response = self.client.patch(
            reverse("outreach-template-detail", args=[template.id]),
            {"title": "Hacked"},
            format="json",
        )
        # Visible as shared? only own or null user - other user's templates not in queryset
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_duplicate_template(self):
        template = Template.objects.create(
            user=self.user,
            title="Original",
            content="Body {{client_name}}",
            type=Template.TypeChoices.SCRIPT,
        )
        response = self.client.post(
            reverse("outreach-template-duplicate", args=[template.id])
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Original (copy)")
        self.assertEqual(Template.objects.filter(user=self.user).count(), 2)
