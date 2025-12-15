# Views for the user app (v1)

from rest_framework import generics, viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserProfileSerializer, AdminUserSerializer
from apps.authentication.permissions import IsAdminUser, IsAdminOrModerator

User = get_user_model()

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update the profile of the currently authenticated user.
    Allows GET, PUT, PATCH requests.
    Supports multipart form data for profile picture uploads.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, JSONParser]

    def get_object(self):
        # Returns the user associated with the current request
        return self.request.user


class UserViewSet(viewsets.ModelViewSet):
    """
    Admin endpoint for managing users.
    Provides list, retrieve, create, update, partial_update, destroy actions.
    Restricted to Admin users only.
    Includes action for Admins/Moderators to activate/deactivate users.
    """
    queryset = User.objects.all().order_by('id')
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser] # Base permissions for CRUD

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOrModerator])
    def set_active_status(self, request, pk=None):
        """
        Activate or deactivate a user account.
        Accessible only by Admins or Moderators.
        Expects {'is_active': true/false} in the request body.
        """
        user = self.get_object() # Get the user instance based on pk
        is_active_status = request.data.get('is_active')

        if is_active_status is None:
            return Response({'detail': 'Missing "is_active" parameter (true/false).'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        if not isinstance(is_active_status, bool):
             return Response({'detail': '"is_active" parameter must be a boolean (true/false).'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        user.is_active = is_active_status
        user.save(update_fields=['is_active'])

        status_text = "activated" if is_active_status else "deactivated"
        return Response({'detail': f'User {user.username} successfully {status_text}.'})
