from rest_framework import generics, permissions
from apps.goals.models import GoalTemplate
from .serializers import GoalTemplateSerializer
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from apps.goals.models import Goal
from .serializers import GoalSerializer
from django.shortcuts import get_object_or_404

class GoalTemplateListView(generics.ListAPIView):
    queryset = GoalTemplate.objects.all()
    serializer_class = GoalTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]


class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        goal = self.get_object()
        if goal.start_date <= timezone.now().date():
            return Response(
                {"detail": "Cannot update a goal that has already started."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().update(request, *args, **kwargs)