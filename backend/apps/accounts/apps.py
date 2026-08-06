from django.apps import AppConfig
from django.conf import settings
from django.db.models.signals import post_migrate

def _seed_demo_accounts(sender, **kwargs):
    if not getattr(settings, "DEMO_ACCOUNTS_ENABLED", False):
        return
    from .demo import seed_demo_accounts
    seed_demo_accounts()

class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.accounts"

    def ready(self):
        # Seed demo accounts after migrations
        post_migrate.connect(_seed_demo_accounts, sender=self)

        # Ensure demo accounts exist on startup (e.g., when running dev server without migrations)
        if getattr(settings, "DEMO_ACCOUNTS_ENABLED", False):
            from .demo import seed_demo_accounts
            from django.contrib.auth import get_user_model
            User = get_user_model()
            if not User.objects.filter(is_demo=True).exists():
                seed_demo_accounts()
