from django.db import connection
from django.core.cache import cache
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def health_check(request):
    return Response({"status": "ok"})


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
@throttle_classes([AnonRateThrottle])
def ready_check(request):
    """Readiness probe: verifies database (and optionally cache) connectivity."""
    checks = {"database": False, "cache": False}
    try:
        connection.ensure_connection()
        checks["database"] = True
    except Exception:
        checks["database"] = False

    try:
        cache.set("healthcheck", "1", timeout=5)
        checks["cache"] = cache.get("healthcheck") == "1"
    except Exception:
        checks["cache"] = False

    ok = all(checks.values())
    return Response(
        {"status": "ok" if ok else "degraded", "checks": checks},
        status=status.HTTP_200_OK if ok else status.HTTP_503_SERVICE_UNAVAILABLE,
    )
