from rest_framework.permissions import BasePermission, IsAuthenticated
from apps.user.models import CustomUser

class IsAdminUser(BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == CustomUser.Role.ADMIN)

class IsModeratorUser(BasePermission):
    """
    Allows access only to moderator users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == CustomUser.Role.MODERATOR)

class IsRegularUser(BasePermission):
    """
    Allows access only to regular (non-admin, non-moderator) users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == CustomUser.Role.USER)

class IsAdminOrModerator(BasePermission):
    """
    Allows access only to admin or moderator users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role in [CustomUser.Role.ADMIN, CustomUser.Role.MODERATOR]
        )

# We can re-export IsAuthenticated for convenience if needed
# from rest_framework.permissions import IsAuthenticated
