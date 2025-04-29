from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.authentication.services import AuthenticationService, OAuthService
from .test_base import AuthenticationBaseTest
from apps.user.models import CustomUser

User = CustomUser

class AuthenticationViewsTest(AuthenticationBaseTest):
    def test_user_registration(self):
        response = self.client.post(
            self.api_urls['register'],
            self.test_user_data,
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['username'], self.test_user_data['username'])
        self.assertEqual(response.data['email'], self.test_user_data['email'])

    def test_user_login(self):
        # First register a user
        self.client.post(
            self.api_urls['register'],
            self.test_user_data,
            format='json'
        )
        
        # Then try to login
        response = self.client.post(
            self.api_urls['login'],
            {
                'email': self.test_user_data['email'],
                'password': self.test_user_data['password']
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_protected_route(self):
        # Try accessing protected route without authentication
        response = self.client.get(self.api_urls['test_protected'])
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Login and get token
        response = self.client.post(
            self.api_urls['login'],
            {
                'email': 'existing@example.com',
                'password': 'ExistingPass123'
            },
            format='json'
        )
        access_token = response.data['access']

        # Try accessing protected route with authentication
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(self.api_urls['test_protected'])
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'existing_user')

class AuthenticationTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/auth/register/'
        self.login_url = '/api/auth/login/'
        self.google_login_url = '/api/auth/google/'
        self.token_refresh_url = '/api/token/refresh/'
        
        # Test user data
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'TestPass123'
        }
        
        # Create a test user for login tests
        self.test_user = CustomUser.objects.create_user(
            username='existinguser',
            email='existing@example.com',
            password='ExistingPass123'
        )

    def test_user_registration_success(self):
        """Test successful user registration"""
        response = self.client.post(self.register_url, self.user_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('refresh', response.data)
        self.assertIn('access', response.data)
        self.assertIn('user_id', response.data)
        self.assertIn('username', response.data)
        self.assertIn('email', response.data)
        
        # Verify user was created in database
        self.assertTrue(
            CustomUser.objects.filter(email=self.user_data['email']).exists()
        )

    def test_user_registration_duplicate_email(self):
        """Test registration with existing email"""
        # First registration
        self.client.post(self.register_url, self.user_data, format='json')
        
        # Second registration with same email
        duplicate_data = self.user_data.copy()
        duplicate_data['username'] = 'different_user'
        response = self.client.post(self.register_url, duplicate_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_duplicate_username(self):
        """Test registration with existing username"""
        # First registration
        self.client.post(self.register_url, self.user_data, format='json')
        
        # Second registration with same username
        duplicate_data = self.user_data.copy()
        duplicate_data['email'] = 'different@example.com'
        response = self.client.post(self.register_url, duplicate_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_registration_invalid_password(self):
        """Test registration with invalid password"""
        invalid_data = self.user_data.copy()
        invalid_data['password'] = 'weak'  # Too short, no numbers, no uppercase
        response = self.client.post(self.register_url, invalid_data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_success(self):
        """Test successful login"""
        response = self.client.post(self.login_url, {
            'email': 'existing@example.com',
            'password': 'ExistingPass123'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('refresh', response.data)
        self.assertIn('access', response.data)
        self.assertIn('user_id', response.data)
        self.assertIn('username', response.data)
        self.assertIn('email', response.data)

    def test_user_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = self.client.post(self.login_url, {
            'email': 'existing@example.com',
            'password': 'WrongPassword123'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_google_login(self):
        """Test Google OAuth login"""
        response = self.client.post(self.google_login_url, {
            'googleToken': 'valid_google_token'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('refresh', response.data)
        self.assertIn('access', response.data)
        self.assertIn('user_id', response.data)
        self.assertIn('username', response.data)
        self.assertIn('email', response.data)

    def test_google_login_invalid_token(self):
        """Test Google OAuth login with invalid token"""
        response = self.client.post(self.google_login_url, {
            'googleToken': 'invalid_token'
        })
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_token_refresh(self):
        """Test refreshing access token"""
        # First, login to get tokens
        login_response = self.client.post(self.login_url, {
            'email': 'existing@example.com',
            'password': 'ExistingPass123'
        }, format='json')
        
        # Then try to refresh the token
        refresh_response = self.client.post(
            self.token_refresh_url,
            {'refresh': login_response.data['refresh']},
            format='json'
        )
        
        self.assertEqual(refresh_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', refresh_response.data)

    def test_username_generation(self):
        """Test unique username generation"""
        base_username = "testuser"
        
        # Create first user
        username1 = AuthenticationService.generate_unique_username(base_username)
        CustomUser.objects.create_user(username=username1, email="test1@example.com", password="Test123!")
        
        # Try to generate username again
        username2 = AuthenticationService.generate_unique_username(base_username)
        
        self.assertNotEqual(username1, username2)
        self.assertTrue(username2.startswith(base_username)) 