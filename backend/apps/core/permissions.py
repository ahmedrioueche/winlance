from rest_framework import permissions


class IsOwner(permissions.BasePermission):
    """Object-level permission: only the owning user may access the object."""

    owner_field = "user"

    def has_object_permission(self, request, view, obj):
        owner_field = getattr(view, "owner_field", self.owner_field)
        owner = getattr(obj, owner_field, None)
        return owner == request.user
