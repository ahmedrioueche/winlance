import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger("apps.core")


def _message_from_data(data):
    if data is None:
        return "An error occurred."
    if isinstance(data, str):
        return data
    if isinstance(data, list) and data:
        return str(data[0])
    if isinstance(data, dict):
        if "detail" in data:
            detail = data["detail"]
            return detail if isinstance(detail, str) else str(detail)
        for value in data.values():
            if isinstance(value, list) and value:
                return str(value[0])
            if isinstance(value, str):
                return value
    return "An error occurred."


def custom_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    if response is None:
        logger.exception("Unhandled API exception", exc_info=exc)
        return Response(
            {
                "error": {
                    "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                    "message": "Internal server error.",
                    "details": {"detail": "Internal server error."},
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    details = response.data
    response.data = {
        "error": {
            "status_code": response.status_code,
            "message": _message_from_data(details),
            "details": details,
        }
    }
    return response


def error_response(message, status_code=status.HTTP_400_BAD_REQUEST, details=None):
    return Response(
        {
            "error": {
                "status_code": status_code,
                "message": message,
                "details": details or {"detail": message},
            }
        },
        status=status_code,
    )
