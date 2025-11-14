from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django.shortcuts import get_object_or_404

from apps.events.models import Event
from apps.events.api.v1.serializers import EventSerializer
from apps.events.api.v1.permissions import IsCreatorOrAdmin, IsAdminForDelete

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.select_related('creator').prefetch_related('participants', 'likes').all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsCreatorOrAdmin, IsAdminForDelete]

    def perform_create(self, serializer):
        # Attach creator from request.user
        serializer.save(creator=self.request.user)

    # Optional: only allow updates by creator or admin (handled by IsCreatorOrAdmin)
    # Deletion is enforced to admin by IsAdminForDelete

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def participate(self, request, pk=None):
        """
        Toggle participation (I'm coming).
        POST to /events/{id}/participate/ toggles current user's participation.
        Returns the new participants_count and i_am_participating.
        """
        event = get_object_or_404(Event, pk=pk)
        user = request.user

        if event.participants.filter(pk=user.pk).exists():
            event.participants.remove(user)
            participating = False
        else:
            event.participants.add(user)
            participating = True

        return Response({
            'participants_count': event.participants.count(),
            'i_am_participating': participating
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        """
        Toggle like for current user.
        POST to /events/{id}/like/ toggles like.
        """
        event = get_object_or_404(Event, pk=pk)
        user = request.user

        if event.likes.filter(pk=user.pk).exists():
            event.likes.remove(user)
            liked = False
        else:
            event.likes.add(user)
            liked = True

        return Response({
            'likes_count': event.likes.count(),
            'i_liked': liked
        }, status=status.HTTP_200_OK)
