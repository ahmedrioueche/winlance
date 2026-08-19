import logging
import os

from django.core.exceptions import ImproperlyConfigured

from .base import *

DEBUG = False

SECRET_KEY = os.environ.get("SECRET_KEY") or SECRET_KEY
if not SECRET_KEY or SECRET_KEY.startswith("django-insecure"):
    raise ImproperlyConfigured(
        "Production SECRET_KEY must be set to a strong non-default value."
    )

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["winlance.onrender.com", ".onrender.com", "localhost", "127.0.0.1"])
render_host = env("RENDER_EXTERNAL_HOSTNAME", default="")
if render_host and render_host not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(render_host)
if not ALLOWED_HOSTS:
    raise ImproperlyConfigured("ALLOWED_HOSTS must be set in production.")

CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])
if not CORS_ALLOWED_ORIGINS:
    raise ImproperlyConfigured(
        "CORS_ALLOWED_ORIGINS must be set in production to the SPA origin(s)."
    )

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)
# Keep liveness/readiness on HTTP so Render port / health probes succeed.
SECURE_REDIRECT_EXEMPT = [r"^api/v1/health/"]
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = env.int("SECURE_HSTS_SECONDS", default=31536000)
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "same-origin"
X_FRAME_OPTIONS = "DENY"

# Prefer Redis cache in prod when REDIS_CACHE_URL is set; otherwise locmem.
_redis_cache_url = env("REDIS_CACHE_URL", default="")
if _redis_cache_url:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.redis.RedisCache",
            "LOCATION": _redis_cache_url,
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "winlance-prod",
        }
    }

EMAIL_BACKEND = env(
    "EMAIL_BACKEND",
    default="django.core.mail.backends.smtp.EmailBackend",
)

SENTRY_DSN = env("SENTRY_DSN", default="")
if SENTRY_DSN:
    try:
        import sentry_sdk
        from sentry_sdk.integrations.celery import CeleryIntegration
        from sentry_sdk.integrations.django import DjangoIntegration

        sentry_sdk.init(
            dsn=SENTRY_DSN,
            integrations=[DjangoIntegration(), CeleryIntegration()],
            traces_sample_rate=env.float("SENTRY_TRACES_SAMPLE_RATE", default=0.0),
            send_default_pii=False,
        )
    except ImportError:
        logging.getLogger(__name__).warning(
            "SENTRY_DSN is set but sentry-sdk is not installed."
        )
