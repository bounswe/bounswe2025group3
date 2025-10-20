import pytest
import json
from unittest.mock import patch, MagicMock
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from apps.authentication.tests.factories import UserFactory, OAuthFactory


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
class TestGoogleOAuth:
    
    @patch('apps.authentication.services.OAuthService.verify_provider_token')
    def test_google_login_new_user(self, mock_verify_token, api_client):
        """Test Google OAuth login for a new user."""
        # Mock Google token verification
        mock_verify_token.return_value = {
            'email': 'google_user@example.com',
            'provider_user_id': 'google_123456',
            'first_name': 'Google',
            'last_name': 'User'
        }
        
        url = reverse('authentication:google_login')
        data = {'googleToken': 'fake_google_token'}
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert 'user_id' in response.data
        assert response.data['email'] == 'google_user@example.com'
        
    @patch('apps.authentication.services.OAuthService.verify_provider_token')
    def test_google_login_existing_user(self, mock_verify_token, api_client):
        """Test Google OAuth login for an existing user."""
        # Create a user that will match the OAuth profile
        user = UserFactory(email='existing_google@example.com')
        oauth = OAuthFactory(
            user=user,
            provider='google',
            provider_user_id='google_existing_123'
        )
        
        # Mock Google token verification to return the existing user's info
        mock_verify_token.return_value = {
            'email': 'existing_google@example.com',
            'provider_user_id': 'google_existing_123'
        }
        
        url = reverse('authentication:google_login')
        data = {'googleToken': 'fake_google_token'}
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert 'user_id' in response.data
        assert response.data['user_id'] == user.id
        assert response.data['email'] == user.email
        
    @patch('apps.authentication.services.OAuthService.verify_provider_token')
    def test_google_login_invalid_token(self, mock_verify_token, api_client):
        """Test Google OAuth login with an invalid token."""
        # Mock failed token verification
        mock_verify_token.return_value = None
        
        url = reverse('authentication:google_login')
        data = {'googleToken': 'invalid_token'}
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'detail' in response.data
        
    def test_google_login_missing_token(self, api_client):
        """Test Google OAuth login without providing a token."""
        url = reverse('authentication:google_login')
        data = {}  # No token provided
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED 