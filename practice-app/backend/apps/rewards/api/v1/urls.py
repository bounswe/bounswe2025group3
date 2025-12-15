from django.urls import path
from .views import BadgesView
from .views import BadgeGalleryView

urlpatterns = [
    path('badges/me/', BadgesView.as_view(), name='my_badges'),
    path("badges/", BadgeGalleryView.as_view(), name="badge_gallery"),
]
