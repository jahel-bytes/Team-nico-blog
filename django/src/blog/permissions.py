from rest_framework.permissions import BasePermission, SAFE_METHODS


class PostReadPermission(BasePermission):
    """Allow access only if user can read the post."""

    def has_object_permission(self, request, view, obj):
        return obj.can_read(request.user)


class PostWritePermission(BasePermission):
    """Allow write access only if user can write the post."""

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return obj.can_read(request.user)
        return obj.can_write(request.user)
