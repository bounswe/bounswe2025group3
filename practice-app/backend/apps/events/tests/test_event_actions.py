# events/tests/test_event_actions.py

import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.events.models import Event
from django.contrib.auth import get_user_model
from datetime import datetime, timedelta

User = get_user_model()


@pytest.mark.django_db
class TestEventActions:

    @pytest.fixture
    def user(self):
        return User.objects.create_user(
            email="testuser@example.com",
            username="testuser",
            password="123456"
        )

    @pytest.fixture
    def other_user(self):
        return User.objects.create_user(
            email="creator@example.com",
            username="creator",
            password="123456"
        )

    @pytest.fixture
    def event(self, other_user):
        return Event.objects.create(
            title="Test Event",
            description="Sample",
            creator=other_user,
            date=datetime.now() + timedelta(days=1)
        )

    @pytest.fixture
    def client(self, user):
        client = APIClient()
        client.force_authenticate(user=user)
        return client

    # -------------------------------
    # PARTICIPATION TESTS
    # -------------------------------

    def test_participate_adds_user(self, client, user, event):
        url = reverse("event-participate", args=[event.id])

        response = client.post(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["i_am_participating"] is True
        assert response.data["participants_count"] == 1
        assert event.participants.filter(id=user.id).exists()

    def test_participate_removes_user(self, client, user, event):
        event.participants.add(user)
        url = reverse("event-participate", args=[event.id])

        response = client.post(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["i_am_participating"] is False
        assert response.data["participants_count"] == 0
        assert not event.participants.filter(id=user.id).exists()

    # -------------------------------
    # LIKE TESTS
    # -------------------------------

    def test_like_adds_user(self, client, user, event):
        url = reverse("event-like", args=[event.id])

        response = client.post(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["i_liked"] is True
        assert response.data["likes_count"] == 1
        assert event.likes.filter(id=user.id).exists()

    def test_like_removes_user(self, client, user, event):
        event.likes.add(user)
        url = reverse("event-like", args=[event.id])

        response = client.post(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["i_liked"] is False
        assert response.data["likes_count"] == 0
        assert not event.likes.filter(id=user.id).exists()

    # -------------------------------
    # DELETE TESTS
    # -------------------------------

    def test_creator_can_delete_event(self, other_user):
        """Creator should be able to delete their event."""
        client = APIClient()
        client.force_authenticate(user=other_user)
        
        event = Event.objects.create(
            title="Test Event",
            description="Sample",
            creator=other_user,
            date=datetime.now() + timedelta(days=1)
        )
        
        url = reverse("event-detail", args=[event.id])
        response = client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Event.objects.filter(id=event.id).exists()

    def test_non_creator_cannot_delete_event(self, client, event):
        """Non-creator user should not be able to delete another user's event."""
        url = reverse("event-detail", args=[event.id])
        response = client.delete(url)

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert Event.objects.filter(id=event.id).exists()

    def test_admin_can_delete_any_event(self, event):
        """Admin should be able to delete any event."""
        admin_user = User.objects.create_user(
            email="admin@example.com",
            username="admin",
            password="123456",
            is_staff=True
        )
        
        client = APIClient()
        client.force_authenticate(user=admin_user)
        
        url = reverse("event-detail", args=[event.id])
        response = client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Event.objects.filter(id=event.id).exists()
