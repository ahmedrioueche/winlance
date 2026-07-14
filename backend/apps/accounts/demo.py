from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

DEMO_ACCOUNTS = (
    {
        "username": "demo",
        "email": "demo@winlance.local",
        "password": "DemoPass123!",
        "first_name": "Demo",
        "last_name": "Freelancer",
    },
    {
        "username": "democlient",
        "email": "client@winlance.local",
        "password": "DemoPass123!",
        "first_name": "Demo",
        "last_name": "Client",
    },
)


def seed_demo_accounts():
    """Create or refresh demo users when DEMO_ACCOUNTS_ENABLED is True."""
    if not getattr(settings, "DEMO_ACCOUNTS_ENABLED", False):
        return []

    created_or_updated = []
    for account in DEMO_ACCOUNTS:
        user, created = User.objects.get_or_create(
            email=account["email"],
            defaults={
                "username": account["username"],
                "first_name": account["first_name"],
                "last_name": account["last_name"],
                "is_email_verified": True,
                "is_demo": True,
            },
        )
        if not created:
            user.username = account["username"]
            user.first_name = account["first_name"]
            user.last_name = account["last_name"]
            user.is_email_verified = True
            user.is_demo = True
        user.set_password(account["password"])
        user.save()
        created_or_updated.append(user)
    return created_or_updated


def remove_demo_accounts():
    """Remove demo users when the toggle is off (optional cleanup)."""
    return User.objects.filter(is_demo=True).delete()
