from rest_framework import permissions

from .services import user_can_manage_project, user_is_project_client


class IsProjectFreelancer(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        project = getattr(obj, "project", obj)
        return user_can_manage_project(request.user, project)


class IsProjectParticipant(permissions.BasePermission):
    """Freelancer owner or linked client user."""

    def has_object_permission(self, request, view, obj):
        project = getattr(obj, "project", obj)
        return user_can_manage_project(request.user, project) or user_is_project_client(
            request.user, project
        )
