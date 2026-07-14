from django.conf import settings
from django.core.management.base import BaseCommand

from apps.accounts.demo import remove_demo_accounts, seed_demo_accounts


class Command(BaseCommand):
    help = "Seed or remove demo accounts based on DEMO_ACCOUNTS_ENABLED."

    def add_arguments(self, parser):
        parser.add_argument(
            "--remove",
            action="store_true",
            help="Remove demo accounts regardless of the env toggle.",
        )

    def handle(self, *args, **options):
        if options["remove"]:
            deleted, _ = remove_demo_accounts()
            self.stdout.write(self.style.WARNING(f"Removed {deleted} demo account(s)."))
            return

        if not settings.DEMO_ACCOUNTS_ENABLED:
            self.stdout.write(
                self.style.WARNING(
                    "DEMO_ACCOUNTS_ENABLED is False. Pass --remove to clean up, "
                    "or enable the env var."
                )
            )
            return

        users = seed_demo_accounts()
        for user in users:
            self.stdout.write(self.style.SUCCESS(f"Demo account ready: {user.email}"))
