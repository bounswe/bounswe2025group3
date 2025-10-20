import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.authentication.tests.factories import UserFactory


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def test_user():
    return UserFactory(
        username='loginuser',
        email='loginuser@example.com',
        password='password123'
    )


@pytest.mark.django_db
class TestLogin:
    
    def test_successful_login(self, api_client, test_user):
        """Test successful user login with correct credentials."""
        url = reverse('authentication:rest_login')
        data = {
            'email': test_user.email,
            'password': 'password123'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert 'user_id' in response.data
        assert 'email' in response.data
        
    def test_login_incorrect_password(self, api_client, test_user):
        """Test login with incorrect password."""
        url = reverse('authentication:rest_login')
        data = {
            'email': test_user.email,
            'password': 'wrongpassword'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'detail' in response.data
        
    def test_login_nonexistent_user(self, api_client):
        """Test login with an email that doesn't exist."""
        url = reverse('authentication:rest_login')
        data = {
            'email': 'nonexistent@example.com',
            'password': 'anypassword'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'detail' in response.data
        
    def test_login_inactive_user(self, api_client):
        """Test login with an inactive user account."""
        inactive_user = UserFactory(
            username='inactiveuser',
            email='inactive@example.com',
            password='password123',
            is_active=False
        )
        
        url = reverse('authentication:rest_login')
        data = {
            'email': inactive_user.email,
            'password': 'password123'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED 