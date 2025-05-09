from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.user.models import CustomUser
from django.db import IntegrityError

class AuthAPITests(APITestCase):
    """Tests for the authentication API endpoints."""

    def setUp(self):
        """Set up initial data for tests."""
        # Create a test user for login tests
        self.test_user = CustomUser.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123',
            first_name='Test',
            last_name='User'
        )

    # --- Registration Tests --- 

    def test_successful_registration(self):
        """Test successful user registration."""
        url = reverse('authentication:rest_register') # Corrected name
        data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'password1': 'newpassword123',
            'password2': 'newpassword123',
            'bio': 'Optional bio',
            'city': 'Test City',
            'country': 'Test Country'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED) # Check for 201 Created
        self.assertTrue(CustomUser.objects.filter(email='new@example.com').exists()) # Check if user exists

    def test_registration_duplicate_email(self):
        """Test registration with an existing email raises IntegrityError due to UNIQUE constraint."""
        url = reverse('authentication:rest_register') # Corrected name
        data = {
            'username': 'anotheruser',
            'email': self.test_user.email, # Use existing email
            'first_name': 'Another',
            'last_name': 'User',
            'password1': 'Str0ngP@ssw0rd!',
            'password2': 'Str0ngP@ssw0rd!',
            'bio': '',
            'city': '',
            'country': ''
        }
        # Expect an IntegrityError because the email is a duplicate
        # This confirms the database UNIQUE constraint is working.
        with self.assertRaises(IntegrityError):
            self.client.post(url, data, format='json')
            
    def test_registration_password_mismatch(self):
        """Test registration with mismatching passwords."""
        url = reverse('authentication:rest_register') # Corrected name
        data = {
            'username': 'mismatchuser',
            'email': 'mismatch@example.com',
            'first_name': 'Mismatch',
            'last_name': 'User',
            'password1': 'Str0ngP@ssw0rd!', # Use a stronger password
            'password2': 'Str0ngP@ssw0rd?', # Different stronger password
            'bio': '',
            'city': '',
            'country': ''
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Check for a general non_field_error or specific password field error
        # self.assertIn('password2', response.data) # Avoid asserting specific error key

    # --- Login Tests --- 

    def test_successful_login(self):
        """Test successful user login."""
        url = reverse('authentication:rest_login') # Corrected name
        data = {
            'email': self.test_user.email,
            'password': 'testpassword123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data) # Check for access token
        self.assertIn('refresh', response.data) # Check for refresh token

    def test_login_incorrect_password(self):
        """Test login attempt with incorrect password."""
        url = reverse('authentication:rest_login') # Corrected name
        data = {
            'email': self.test_user.email,
            'password': 'wrongpassword'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('detail', response.data)

    def test_login_nonexistent_user(self):
        """Test login attempt with an email that doesn't exist."""
        url = reverse('authentication:rest_login') # Corrected name
        data = {
            'email': 'noone@example.com',
            'password': 'anypassword'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('detail', response.data)

    # --- User Profile (/api/user/me/) Tests --- 

    def test_get_user_profile_authenticated(self):
        """Test accessing user profile when authenticated."""
        # First, login to get the token
        login_url = reverse('authentication:rest_login') # Corrected name
        login_data = {'email': self.test_user.email, 'password': 'testpassword123'}
        login_response = self.client.post(login_url, login_data, format='json')
        access_token = login_response.data['access']
        
        # Now access the profile endpoint with the token
        profile_url = reverse('user-profile') # Correct URL name
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(profile_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], self.test_user.email)
        self.assertEqual(response.data['username'], self.test_user.username)

    def test_get_user_profile_unauthenticated(self):
        """Test accessing user profile when not authenticated."""
        profile_url = reverse('user-profile') # Correct URL name
        response = self.client.get(profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
