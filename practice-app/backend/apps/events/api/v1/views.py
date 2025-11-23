from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, JSONParser
from django.shortcuts import get_object_or_404
from apps.events.models import Event
from apps.events.api.v1.serializers import EventSerializer
from apps.events.api.v1.permissions import IsCreatorOrAdmin, IsAdminForDelete
from rest_framework.decorators import action


@extend_schema(
    tags=["Events"],
    summary="Event CRUD operations",
    description=(
        "This viewset handles event creation, listing, updating, and retrieving.\n"
        "Only authenticated users can create events.\n"
        "Updating is restricted to the creator or an admin.\n"
        "Deleting events is restricted to admins only."
    )
)
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.select_related('creator').prefetch_related('participants', 'likes').all()
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsCreatorOrAdmin, IsAdminForDelete]
    parser_classes = [MultiPartParser, JSONParser]  # Support both multipart and JSON

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    # ----------------------------------------
    # Participate Endpoint
    # ----------------------------------------
    @extend_schema(
        tags=["Events"],
        summary="Toggle participation",
        description=(
            "Allows an authenticated user to join or leave an event.\n"
            "Calling this endpoint toggles participation for the user.\n\n"
            "**Returns:**\n"
            "- participants_count: total number of users attending\n"
            "- i_am_participating: whether the current user is now participating"
        ),
        responses={
            200: OpenApiResponse(description="Participation toggled successfully.")
        }
    )
    @action(detail=True, methods=["post"], url_path="participate")
    def participate(self, request, pk=None):
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

    # ----------------------------------------
    # Like Endpoint
    # ----------------------------------------
    @extend_schema(
        tags=["Events"],
        summary="Toggle like",
        description=(
            "Allows an authenticated user to like or unlike an event.\n"
            "Calling this endpoint toggles the like state.\n\n"
            "**Returns:**\n"
            "- likes_count: total number of likes on the event\n"
            "- i_liked: whether the current user now likes the event"
        ),
        responses={
            200: OpenApiResponse(description="Like toggled successfully.")
        }
    )
    @action(detail=True, methods=["post"], url_path="like")
    def like(self, request, pk=None):
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
