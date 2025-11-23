from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes
from apps.notifications.models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """
    Lists notifications for the authenticated user, optionally filtered by read status.
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Notifications'],
        summary='List user notifications',
        description='Returns notifications for the current user, ordered by creation date.',
        parameters=[
            OpenApiParameter(
                name='is_read',
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
                description='Filter by read status (true/false).',
                required=False
            )
        ]
    )
    def get_queryset(self):
        queryset = Notification.objects.filter(recipient=self.request.user)
        is_read_param = self.request.query_params.get('is_read')

        if is_read_param is not None:
            # Convert string 'true'/'false' to boolean
            is_read = is_read_param.lower() in ['true', '1', 't']
            queryset = queryset.filter(is_read=is_read)

        return queryset.order_by('-created_at')


class MarkNotificationAsReadView(APIView):
    """
    Marks one or all notifications as read.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Notifications'],
        summary='Mark notifications as read',
        description='Marks one specific notification (if pk is provided) or all unread notifications for the user as read.',
        request=None,
        responses={200: {'detail': 'Notifications marked as read.'}}
    )
    def post(self, request, pk=None):
        user = request.user

        if pk:
            # Mark a specific notification as read
            count = Notification.objects.filter(pk=pk, recipient=user, is_read=False).update(is_read=True)
            if count == 0:
                return Response({'detail': 'Notification not found or already read.'}, status=status.HTTP_404_NOT_FOUND)
            return Response({'detail': 'Notification marked as read.'}, status=status.HTTP_200_OK)
        else:
            # Mark all unread notifications as read
            count = Notification.objects.filter(recipient=user, is_read=False).update(is_read=True)
            return Response({'detail': f'Marked {count} notifications as read.'}, status=status.HTTP_200_OK)