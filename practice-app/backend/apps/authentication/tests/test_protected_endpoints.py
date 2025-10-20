import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from apps.authentication.tests.factories import UserFactory, UserAuthTokenFactory


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def authenticated_user():
    return UserFactory()


@pytest.fixture
def authenticated_client(api_client, authenticated_user):
    refresh = RefreshToken.for_user(authenticated_user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')
    return api_client, authenticated_user


@pytest.mark.django_db
class TestProtectedEndpoints:
    
    def test_protected_endpoint_authenticated(self, authenticated_client):
        """Test accessing a protected endpoint when authenticated."""
        client, user = authenticated_client
        url = reverse('authentication:test-protected')
        
        response = client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['user_id'] == user.id
        assert response.data['username'] == user.username
        assert response.data['email'] == user.email
        
    def test_protected_endpoint_unauthenticated(self, api_client):
        """Test accessing a protected endpoint when not authenticated."""
        url = reverse('authentication:test-protected')
        
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        
    def test_protected_endpoint_invalid_token(self, api_client):
        """Test accessing a protected endpoint with an invalid token."""
        url = reverse('authentication:test-protected')
        api_client.credentials(HTTP_AUTHORIZATION='Bearer invalidtoken')
        
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        
    def test_user_profile_authenticated(self, authenticated_client):
        """Test accessing user profile when authenticated."""
        client, user = authenticated_client
        url = reverse('user-profile')
        
        response = client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == user.email
        assert response.data['username'] == user.username
        
    def test_user_profile_unauthenticated(self, api_client):
        """Test accessing user profile when not authenticated."""
        url = reverse('user-profile')
        
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestTokenAuthentication:
    
    def test_refresh_token(self, api_client, authenticated_user):
        """Test refreshing a JWT token."""
        # First, get a token pair by authenticating
        login_url = reverse('authentication:rest_login')
        login_data = {
            'email': authenticated_user.email,
            'password': 'password123'
        }
        login_response = api_client.post(login_url, login_data, format='json')
        refresh_token = login_response.data['refresh']
        
        # Now try to refresh the token
        refresh_url = reverse('token_refresh')
        refresh_data = {'refresh': refresh_token}
        refresh_response = api_client.post(refresh_url, refresh_data, format='json')
        
        assert refresh_response.status_code == status.HTTP_200_OK
        assert 'access' in refresh_response.data
        
    def test_refresh_token_invalid(self, api_client):
        """Test refreshing with an invalid token."""
        refresh_url = reverse('token_refresh')
        refresh_data = {'refresh': 'invalidtoken'}
        refresh_response = api_client.post(refresh_url, refresh_data, format='json')
        
        assert refresh_response.status_code == status.HTTP_401_UNAUTHORIZED 