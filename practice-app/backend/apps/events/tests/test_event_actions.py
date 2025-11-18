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
