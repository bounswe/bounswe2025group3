import pytest
import json
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.authentication.tests.factories import UserFactory
from rest_framework.test import APIClient

User = get_user_model()


@pytest.fixture
def registration_data():
    return {
        'username': 'newuser',
        'email': 'newuser@example.com',
        'password1': 'securepassword123',
        'password2': 'securepassword123',
        'bio': 'This is a test bio',
        'city': 'Test City',
        'country': 'Test Country'
        # first_name and last_name are now optional
    }


@pytest.mark.django_db
class TestRegistration:
    
    def test_successful_registration(self, client, registration_data):
        """Test successful user registration."""
        url = reverse('authentication:rest_register')
        response = client.post(url, registration_data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert User.objects.filter(email=registration_data['email']).exists()
        
        # Check that user properties are set correctly
        user = User.objects.get(email=registration_data['email'])
        assert user.username == registration_data['username']
        assert user.bio == registration_data['bio']
        assert user.city == registration_data['city']
        assert user.country == registration_data['country']
    
    def test_registration_password_mismatch(self, client, registration_data):
        """Test registration with mismatching passwords."""
        registration_data['password2'] = 'differentpassword123'
        url = reverse('authentication:rest_register')
        
        response = client.post(url, registration_data, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'non_field_errors' in response.data or 'password2' in response.data
    
    def test_registration_validation(self, client):
        """Test validation during registration."""
        # Test with missing email
        data = {
            'username': 'missingemail',
            'password1': 'securepassword123',
            'password2': 'securepassword123',
        }
        
        url = reverse('authentication:rest_register')
        response = client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'email' in response.data
        
        # Test with missing username
        data = {
            'email': 'missing@username.com',
            'password1': 'securepassword123',
            'password2': 'securepassword123',
        }
        
        response = client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'username' in response.data
    
    def test_registration_weak_password(self, client, registration_data):
        """Test registration with a weak password."""
        registration_data['password1'] = '12345'
        registration_data['password2'] = '12345'
        
        url = reverse('authentication:rest_register')
        response = client.post(url, registration_data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'password1' in response.data
    
    def test_registration_missing_required_fields(self, client):
        """Test registration with missing required fields."""
        incomplete_data = {
            'email': 'incomplete@example.com'
            # Missing username and passwords
        }
        
        url = reverse('authentication:rest_register')
        response = client.post(url, incomplete_data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST 