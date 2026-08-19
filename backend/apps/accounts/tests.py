from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.demo import seed_demo_accounts
from apps.accounts.models import SocialAccount
from apps.accounts.social import SocialAuthError


class AuthFlowTests(APITestCase):
    def test_register_creates_unverified_user(self):
        response = self.client.post(
            reverse("auth-register"),
            {
                "username": "newuser",
                "email": "newuser@example.com",
                "password": "StrongPass123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("message", response.data)
        self.assertFalse(get_user_model().objects.get(username="newuser").is_email_verified)

    def test_email_verification_allows_login_and_profile_access(self):
        self.client.post(
            reverse("auth-register"),
            {
                "username": "verifieduser",
                "email": "verifieduser@example.com",
                "password": "StrongPass123!",
            },
            format="json",
        )

        user = get_user_model().objects.get(username="verifieduser")
        verify_response = self.client.post(
            reverse("auth-verify-email"),
            {"token": str(user.email_verification_token)},
            format="json",
        )

        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)

        login_response = self.client.post(
            reverse("auth-login"),
            {"email": "verifieduser@example.com", "password": "StrongPass123!"},
            format="json",
        )

        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", login_response.data)
        self.assertIn("refresh", login_response.data)

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login_response.data['access']}"
        )
        profile_response = self.client.get(reverse("auth-me"))

        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data["email"], "verifieduser@example.com")

    def test_profile_update_allows_name_and_username_changes(self):
        login_response = self._register_verify_and_login(
            username="profileuser",
            email="profileuser@example.com",
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login_response.data['access']}"
        )

        response = self.client.patch(
            reverse("auth-me"),
            {"first_name": "Ada", "last_name": "Lovelace", "username": "ada"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "Ada")
        self.assertEqual(response.data["last_name"], "Lovelace")
        self.assertEqual(response.data["username"], "ada")
        self.assertEqual(response.data["email"], "profileuser@example.com")

    def test_invalid_login_uses_shared_error_format(self):
        response = self.client.post(
            reverse("auth-login"),
            {"email": "missing@example.com", "password": "wrong"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
        self.assertEqual(response.data["error"]["status_code"], 400)
        self.assertIn("message", response.data["error"])
        self.assertIn("details", response.data["error"])

    def test_password_reset_flow(self):
        user = get_user_model().objects.create_user(
            username="resetuser",
            email="resetuser@example.com",
            password="StrongPass123!",
        )
        user.is_email_verified = True
        user.save(update_fields=["is_email_verified"])

        reset_request = self.client.post(
            reverse("auth-password-reset"),
            {"email": "resetuser@example.com"},
            format="json",
        )

        self.assertEqual(reset_request.status_code, status.HTTP_200_OK)

        user.refresh_from_db()
        self.assertIsNotNone(user.password_reset_token)

        reset_confirm = self.client.post(
            reverse("auth-password-reset-confirm"),
            {
                "token": user.password_reset_token,
                "password": "NewStrongPass123!",
            },
            format="json",
        )

        self.assertEqual(reset_confirm.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.check_password("NewStrongPass123!"))

    @override_settings(SOCIAL_AUTH_ENABLED_PROVIDERS=["google"])
    @patch("apps.accounts.views.verify_provider_token")
    def test_social_login_returns_tokens_when_provider_enabled(self, mock_verify):
        mock_verify.return_value = {
            "provider": "google",
            "uid": "google-uid-1",
            "email": "social@example.com",
            "username": "socialuser",
            "first_name": "Social",
            "last_name": "User",
        }
        response = self.client.post(
            reverse("auth-social-login", kwargs={"provider": "google"}),
            {"access_token": "valid-google-token"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertTrue(
            SocialAccount.objects.filter(provider="google", uid="google-uid-1").exists()
        )
        user = get_user_model().objects.get(email="social@example.com")
        self.assertTrue(user.is_email_verified)

    @override_settings(SOCIAL_AUTH_ENABLED_PROVIDERS=["google"])
    @patch("apps.accounts.views.verify_provider_token")
    def test_social_login_rejects_invalid_provider_token(self, mock_verify):
        mock_verify.side_effect = SocialAuthError("Invalid or expired access token.")
        response = self.client.post(
            reverse("auth-social-login", kwargs={"provider": "google"}),
            {"access_token": "bad-token"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(
            response.data["error"]["message"],
            "Invalid or expired access token.",
        )

    def _register_verify_and_login(self, username="tokenuser", email="tokenuser@example.com"):
        self.client.post(
            reverse("auth-register"),
            {
                "username": username,
                "email": email,
                "password": "StrongPass123!",
            },
            format="json",
        )
        user = get_user_model().objects.get(username=username)
        self.client.post(
            reverse("auth-verify-email"),
            {"token": str(user.email_verification_token)},
            format="json",
        )
        return self.client.post(
            reverse("auth-login"),
            {"email": email, "password": "StrongPass123!"},
            format="json",
        )

    def test_token_refresh_returns_new_access_token(self):
        login_response = self._register_verify_and_login()
        refresh = login_response.data["refresh"]

        refresh_response = self.client.post(
            reverse("auth-token-refresh"),
            {"refresh": refresh},
            format="json",
        )

        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh_response.data)
        self.assertIn("refresh", refresh_response.data)

    def test_logout_blacklists_refresh_token(self):
        login_response = self._register_verify_and_login(
            username="logoutuser",
            email="logoutuser@example.com",
        )
        access = login_response.data["access"]
        refresh = login_response.data["refresh"]

        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
        logout_response = self.client.post(
            reverse("auth-logout"),
            {"refresh": refresh},
            format="json",
        )

        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)

        refresh_response = self.client.post(
            reverse("auth-token-refresh"),
            {"refresh": refresh},
            format="json",
        )
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)


class DemoAccountTests(APITestCase):
    @override_settings(DEMO_ACCOUNTS_ENABLED=True)
    def test_seed_demo_accounts_creates_loginable_users(self):
        users = seed_demo_accounts()
        self.assertEqual(len(users), 2)

        login_response = self.client.post(
            reverse("auth-login"),
            {"email": "demo@winlance.local", "password": "DemoPass123!"},
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertTrue(get_user_model().objects.get(email="demo@winlance.local").is_demo)

    @override_settings(DEMO_ACCOUNTS_ENABLED=False)
    def test_management_command_skips_when_disabled(self):
        get_user_model().objects.filter(is_demo=True).delete()
        call_command("seed_demo_accounts")
        self.assertFalse(
            get_user_model().objects.filter(email="demo@winlance.local").exists()
        )

    @override_settings(DEMO_ACCOUNTS_ENABLED=True)
    def test_management_command_seeds_when_enabled(self):
        call_command("seed_demo_accounts")
        self.assertTrue(
            get_user_model().objects.filter(email="demo@winlance.local", is_demo=True).exists()
        )
