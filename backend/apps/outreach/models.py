from django.conf import settings
from django.db import models
from django.utils.text import slugify

from apps.core.models import TimeStampedModel


class Tag(TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="outreach_tags",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, db_index=True)

    class Meta(TimeStampedModel.Meta):
        constraints = [
            models.UniqueConstraint(
                fields=["user", "slug"],
                name="outreach_tag_user_slug_uniq",
            )
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)[:255] or "tag"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Template(TimeStampedModel):
    class TypeChoices(models.TextChoices):
        EMAIL = "EMAIL", "Email"
        LINKEDIN = "LINKEDIN", "LinkedIn"
        SCRIPT = "SCRIPT", "Script"
        OTHER = "OTHER", "Other"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="outreach_templates",
    )
    title = models.CharField(max_length=255)
    content = models.TextField(
        help_text="Supports placeholders: {{client_name}}, {{company}}, {{title}}, {{freelancer_name}}."
    )
    type = models.CharField(
        max_length=20,
        choices=TypeChoices.choices,
        default=TypeChoices.EMAIL,
        db_index=True,
    )
    tags = models.ManyToManyField(Tag, blank=True, related_name="templates")
    is_playbook = models.BooleanField(
        default=False,
        help_text="Mark as a reusable marketing playbook asset.",
    )

    class Meta(TimeStampedModel.Meta):
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Sequence(TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="outreach_sequences",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    tags = models.ManyToManyField(Tag, blank=True, related_name="sequences")
    is_playbook = models.BooleanField(default=False)

    class Meta(TimeStampedModel.Meta):
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class SequenceStep(TimeStampedModel):
    sequence = models.ForeignKey(Sequence, on_delete=models.CASCADE, related_name="steps")
    template = models.ForeignKey(Template, on_delete=models.PROTECT, related_name="sequence_steps")
    step_number = models.PositiveIntegerField(db_index=True)
    delay_days = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True, default="")

    class Meta(TimeStampedModel.Meta):
        ordering = ["step_number"]
        constraints = [
            models.UniqueConstraint(
                fields=["sequence", "step_number"],
                name="outreach_sequencestep_sequence_step_uniq",
            )
        ]

    def __str__(self):
        return f"Step {self.step_number} of {self.sequence.title}"


class Checklist(TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="outreach_checklists",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    tags = models.ManyToManyField(Tag, blank=True, related_name="checklists")
    is_playbook = models.BooleanField(default=False)

    class Meta(TimeStampedModel.Meta):
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class ChecklistItem(TimeStampedModel):
    checklist = models.ForeignKey(Checklist, on_delete=models.CASCADE, related_name="items")
    content = models.CharField(max_length=500)
    order = models.PositiveIntegerField(default=0, db_index=True)
    is_done_default = models.BooleanField(default=False)

    class Meta(TimeStampedModel.Meta):
        ordering = ["order", "created_at"]

    def __str__(self):
        return self.content
