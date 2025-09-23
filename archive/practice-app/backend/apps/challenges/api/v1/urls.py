from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChallengeViewSet, ChallengeJoinView, ChallengeLeaveView, TeamCreateView, TeamJoinView, TeamLeaveView

# Create a router for the Challenge ViewSet
router = DefaultRouter()
router.register(r'challenges', ChallengeViewSet, basename='challenge')

urlpatterns = [
    # Challenge-related paths
    path('api/v1/', include(router.urls)),  # This includes all CRUD operations for ChallengeViewSet

    # Challenge Participation paths
    path('api/v1/challenges/<int:id>/join/', ChallengeJoinView.as_view(), name='challenge-join'),
    path('api/v1/challenges/<int:id>/leave/', ChallengeLeaveView.as_view(), name='challenge-leave'),

    # Team-related paths
    path('api/v1/challenges/<int:id>/teams/', TeamCreateView.as_view(), name='team-create'),
    path('api/v1/teams/<int:id>/join/', TeamJoinView.as_view(), name='team-join'),
    path('api/v1/teams/<int:id>/leave/', TeamLeaveView.as_view(), name='team-leave'),
]
