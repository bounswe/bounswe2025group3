from django.urls import path
from .views import MyBadgesView

urlpatterns = [
    path('badges/me/', MyBadgesView.as_view(), name='my_badges'),
]
