from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GoalTemplateListView, GoalViewSet

router = DefaultRouter()
router.register(r'goals', GoalViewSet, basename='goal')

urlpatterns = [
    path('templates/', GoalTemplateListView.as_view(), name='goal-templates'),
    path('', include(router.urls)),
]
