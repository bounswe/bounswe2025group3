from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from ...models import Challenge, ChallengeParticipation, Team
from .serializers import ChallengeSerializer, ChallengeParticipationSerializer, TeamSerializer
from apps.challenges.services import ChallengeService, TeamService

# Challenge Views

class ChallengeViewSet(viewsets.ModelViewSet):
    queryset = Challenge.objects.all()
    serializer_class = ChallengeSerializer

    def get_queryset(self):
        # Filter challenges by status (e.g., active or past)
        queryset = Challenge.objects.all()
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            if status_filter == 'active':
                queryset = queryset.filter(start_date__lte=timezone.now(), end_date__gte=timezone.now())
            elif status_filter == 'past':
                queryset = queryset.filter(end_date__lt=timezone.now())
        return queryset

    def perform_create(self, serializer):
        ChallengeService.create(user=self.request.user, data=serializer.validated_data)


# Challenge Participation Views

class ChallengeJoinView(generics.CreateAPIView):
    serializer_class = ChallengeParticipationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        ChallengeService.join(user=self.request.user, challenge_id=self.kwargs['id'])



class ChallengeLeaveView(generics.DestroyAPIView):
    queryset = ChallengeParticipation.objects.all()
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Ensure the user is trying to leave a challenge they are participating in
        challenge = Challenge.objects.get(id=self.kwargs['id'])
        return ChallengeParticipation.objects.get(user=self.request.user, challenge=challenge)


# Team Views

class TeamCreateView(generics.CreateAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        TeamService.create(
            user=self.request.user,
            challenge_id=self.kwargs['id'],
            team_data=serializer.validated_data
    )



class TeamJoinView(generics.CreateAPIView):
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        TeamService.join(user=self.request.user, team_id=self.kwargs['id'])



class TeamLeaveView(generics.DestroyAPIView):
    queryset = Team.objects.all()
    permission_classes = [IsAuthenticated]

    def get_object(self):
        team = Team.objects.get(id=self.kwargs['id'])
        if self.request.user not in team.members.all():
            raise ValidationError("You are not a member of this team.")
        return team

