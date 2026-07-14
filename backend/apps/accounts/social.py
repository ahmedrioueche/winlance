import json
import urllib.error
import urllib.request

from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
GITHUB_USER_URL = "https://api.github.com/user"
GITHUB_EMAILS_URL = "https://api.github.com/user/emails"

SUPPORTED_PROVIDERS = ("google", "github")


class SocialAuthError(Exception):
    """Raised when a provider token cannot be verified."""


def social_login_enabled(provider):
    return provider in settings.SOCIAL_AUTH_ENABLED_PROVIDERS


def _http_get_json(url, headers):
    request = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(request, timeout=10) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        raise SocialAuthError("Invalid or expired access token.") from exc
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, ValueError) as exc:
        raise SocialAuthError("Unable to verify access token with provider.") from exc


def verify_google_token(access_token):
    data = _http_get_json(
        GOOGLE_USERINFO_URL,
        {"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
    )
    uid = data.get("sub")
    email = (data.get("email") or "").strip().lower()
    if not uid or not email:
        raise SocialAuthError("Google account is missing required profile fields.")
    if data.get("email_verified") is False:
        raise SocialAuthError("Google email is not verified.")

    username = (data.get("name") or email.split("@")[0]).replace(" ", "").lower()[:30]
    return {
        "provider": "google",
        "uid": str(uid),
        "email": email,
        "username": username,
        "first_name": data.get("given_name") or "",
        "last_name": data.get("family_name") or "",
    }


def verify_github_token(access_token):
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github+json",
        "User-Agent": "winlance",
    }
    data = _http_get_json(GITHUB_USER_URL, headers)
    uid = data.get("id")
    if not uid:
        raise SocialAuthError("GitHub account is missing a user id.")

    email = (data.get("email") or "").strip().lower()
    if not email:
        emails = _http_get_json(GITHUB_EMAILS_URL, headers)
        primary = next(
            (item for item in emails if item.get("primary") and item.get("verified")),
            None,
        )
        if primary:
            email = (primary.get("email") or "").strip().lower()
        elif emails:
            verified = next((item for item in emails if item.get("verified")), None)
            if verified:
                email = (verified.get("email") or "").strip().lower()

    if not email:
        raise SocialAuthError("GitHub account has no verified email.")

    login = (data.get("login") or email.split("@")[0]).lower()[:30]
    name = (data.get("name") or "").strip()
    first_name, last_name = "", ""
    if name:
        parts = name.split(" ", 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ""

    return {
        "provider": "github",
        "uid": str(uid),
        "email": email,
        "username": login,
        "first_name": first_name,
        "last_name": last_name,
    }


def verify_provider_token(provider, access_token):
    if provider not in SUPPORTED_PROVIDERS:
        raise SocialAuthError(f"Unsupported provider: {provider}")
    if provider == "google":
        return verify_google_token(access_token)
    return verify_github_token(access_token)


def create_or_get_social_user(provider, uid, email, username, first_name="", last_name=""):
    from .models import SocialAccount

    social = (
        SocialAccount.objects.select_related("user")
        .filter(provider=provider, uid=uid)
        .first()
    )
    if social:
        return social.user

    user = User.objects.filter(email__iexact=email).first() if email else None
    if not user:
        base_username = username or f"{provider}-{uid}"
        candidate = base_username
        suffix = 1
        while User.objects.filter(username=candidate).exists():
            candidate = f"{base_username[:25]}{suffix}"
            suffix += 1
        user = User.objects.create_user(
            username=candidate,
            email=email or "",
            first_name=first_name or "",
            last_name=last_name or "",
        )
        user.set_unusable_password()
        user.is_email_verified = True
        user.save(update_fields=["password", "is_email_verified", "first_name", "last_name"])
    else:
        updates = []
        if not user.is_email_verified:
            user.is_email_verified = True
            updates.append("is_email_verified")
        if first_name and not user.first_name:
            user.first_name = first_name
            updates.append("first_name")
        if last_name and not user.last_name:
            user.last_name = last_name
            updates.append("last_name")
        if updates:
            user.save(update_fields=updates)

    SocialAccount.objects.get_or_create(user=user, provider=provider, uid=uid)
    return user
