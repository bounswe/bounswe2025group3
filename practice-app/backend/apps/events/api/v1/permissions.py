from rest_framework import permissions

class IsCreatorOrAdmin(permissions.BasePermission):
    """
    Allow modifications only if user is the creator or admin.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and (request.user.is_staff or obj.creator_id == request.user.id)

class IsCreatorOrAdminForDelete(permissions.BasePermission):
    """
    Allow event deletion only if user is the creator or admin.
    """

    def has_object_permission(self, request, view, obj):
        if request.method == 'DELETE':
            return request.user and (request.user.is_staff or obj.creator_id == request.user.id)
        return True
