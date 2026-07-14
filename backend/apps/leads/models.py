from django.db import models
from django.conf import settings
from apps.core.models import TimeStampedModel

class Company(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='companies')
    name = models.CharField(max_length=255)
    website = models.URLField(blank=True, default='')
    industry = models.CharField(max_length=255, blank=True, default='')

    def __str__(self):
        return self.name

class Lead(TimeStampedModel):
    class Status(models.TextChoices):
        NEW = 'NEW', 'New'
        CONTACTED = 'CONTACTED', 'Contacted'
        INTERESTED = 'INTERESTED', 'Interested'
        DISCOVERY_CALL = 'DISCOVERY_CALL', 'Discovery Call'
        PROPOSAL_SENT = 'PROPOSAL_SENT', 'Proposal Sent'
        NEGOTIATION = 'NEGOTIATION', 'Negotiation'
        WON = 'WON', 'Won'
        LOST = 'LOST', 'Lost'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='leads')
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True, related_name='leads')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NEW,
        db_index=True,
    )
    probability = models.IntegerField(default=0)  # 0 to 100
    score = models.IntegerField(default=0, db_index=True)
    estimated_value = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    def __str__(self):
        return self.title

class Contact(TimeStampedModel):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='contacts')
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    phone = models.CharField(max_length=50, blank=True, default='')
    linkedin_url = models.URLField(blank=True, default='')

    def __str__(self):
        return f"{self.first_name} {self.last_name}".strip()

class Note(TimeStampedModel):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='notes')
    content = models.TextField()

    def __str__(self):
        return f"Note on {self.lead.title} at {self.created_at}"

class FollowUp(TimeStampedModel):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="follow_ups")
    scheduled_at = models.DateTimeField(db_index=True)
    completed = models.BooleanField(default=False, db_index=True)
    notes = models.TextField(blank=True, default="")

    def __str__(self):
        return f"FollowUp for {self.lead.title} on {self.scheduled_at}"
