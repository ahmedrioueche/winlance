import uuid
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.core.mail import send_mail
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=64, blank=True, null=True)
    password_reset_token = models.CharField(max_length=64, blank=True, null=True)
    password_reset_sent_at = models.DateTimeField(blank=True, null=True)
    is_demo = models.BooleanField(default=False)

    def generate_email_verification_token(self):
        token = uuid.uuid4().hex
        self.email_verification_token = token
        self.save(update_fields=["email_verification_token"])
        send_mail(
            "Verify your Winlance account",
            (
                "Hello,\n\nPlease verify your email by visiting the verification endpoint "
                f"with this token: {token}\n"
            ),
            settings.DEFAULT_FROM_EMAIL,
            [self.email],
            fail_silently=True,
        )
        return token

    def verify_email(self, token):
        if self.email_verification_token and self.email_verification_token == token:
            self.is_email_verified = True
            self.email_verification_token = None
            self.save(update_fields=["is_email_verified", "email_verification_token"])
            return True
        return False

    def generate_password_reset_token(self):
        token = uuid.uuid4().hex
        self.password_reset_token = token
        self.password_reset_sent_at = timezone.now()
        self.save(update_fields=["password_reset_token", "password_reset_sent_at"])
        send_mail(
            "Reset your Winlance password",
            (
                "Hello,\n\nUse this token to reset your password: "
                f"{token}\n"
            ),
            settings.DEFAULT_FROM_EMAIL,
            [self.email],
            fail_silently=True,
        )
        return token

    def reset_password(self, token, new_password):
        if not self.password_reset_token or self.password_reset_token != token:
            return False

        if self.password_reset_sent_at and timezone.now() - self.password_reset_sent_at > timedelta(hours=1):
            self.password_reset_token = None
            self.password_reset_sent_at = None
            self.save(update_fields=["password_reset_token", "password_reset_sent_at"])
            return False

        self.set_password(new_password)
        self.password_reset_token = None
        self.password_reset_sent_at = None
        self.save(update_fields=["password", "password_reset_token", "password_reset_sent_at"])
        return True


class SocialAccount(models.Model):
    PROVIDER_GOOGLE = "google"
    PROVIDER_GITHUB = "github"
    PROVIDER_CHOICES = (
        (PROVIDER_GOOGLE, "Google"),
        (PROVIDER_GITHUB, "GitHub"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="social_accounts",
    )
    provider = models.CharField(max_length=32, choices=PROVIDER_CHOICES, db_index=True)
    uid = models.CharField(max_length=255, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["provider", "uid"],
                name="accounts_socialaccount_provider_uid_uniq",
            )
        ]

    def __str__(self):
        return f"{self.provider}:{self.uid}"
