from rest_framework import status
from datetime import timedelta
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from .test_base import AuthenticationBaseTest
from rest_framework_simplejwt.settings import api_settings

class JWTAuthenticationTest(AuthenticationBaseTest):
    def test_token_refresh(self):
        # Login to get tokens
        response = self.client.post(
            self.api_urls['login'],
            {'email': 'existing@example.com', 'password': 'ExistingPass123'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        refresh_token = response.data['refresh']

        # Test token refresh
        response = self.client.post(
            self.api_urls['token_refresh'],
            {'refresh': refresh_token}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_invalid_token_refresh(self):
        # Test with invalid refresh token
        response = self.client.post(
            self.api_urls['token_refresh'],
            {'refresh': 'invalid_token'}
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_expiry(self):
        # Login to get tokens
        response = self.client.post(
            self.api_urls['login'],
            {'email': 'existing@example.com', 'password': 'ExistingPass123'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        access_token = response.data['access']

        # Verify token is initially valid
        response = self.client.post(
            self.api_urls['token_verify'],
            {'token': access_token}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Test protected route with valid token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(self.api_urls['test_protected'])
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Wait for token to expire (token lifetime is 1 second)
        import time
        time.sleep(2)  # Wait 2 seconds for the token to expire

        # Test with expired token
        response = self.client.get(self.api_urls['test_protected'])
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Verify expired token
        response = self.client.post(
            self.api_urls['token_verify'],
            {'token': access_token}
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED) 