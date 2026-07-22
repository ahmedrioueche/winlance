from .base import *

DEBUG = True

# Run Celery tasks inline unless a real worker/broker is intentionally configured.
CELERY_TASK_ALWAYS_EAGER = env.bool("CELERY_TASK_ALWAYS_EAGER", default=True)
CELERY_TASK_EAGER_PROPAGATES = True

INSTALLED_APPS += [
    "django_extensions",
]

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
