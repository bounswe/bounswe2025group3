import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture(scope='session')
def django_db_setup(django_db_setup):
    """Ensure DB is set up for all tests"""
    pass


@pytest.fixture
def api_client():
    """Return an unauthenticated API client"""
    return APIClient()


@pytest.fixture
def authenticated_client(api_client, django_user_model):
    """Return an authenticated API client"""
    user = django_user_model.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )
    api_client.force_authenticate(user=user)
    return api_client, user


@pytest.fixture
def admin_client(api_client, django_user_model):
    """Return an API client authenticated as admin"""
    admin = django_user_model.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='adminpass123'
    )
    api_client.force_authenticate(user=admin)
    return api_client, admin 