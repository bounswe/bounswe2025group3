from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from apps.user.models import CustomUser

class AuthenticationBaseTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.api_urls = {
            'register': reverse('authentication:register'),
            'login': reverse('authentication:login'),
            'test_protected': reverse('authentication:test-protected'),
            'token_refresh': reverse('token_refresh'),
            'token_verify': reverse('token_verify')
        }
        
        # Create a test user
        self.test_user = CustomUser.objects.create_user(
            email='existing@example.com',
            username='existing_user',
            password='ExistingPass123'
        )
        
        self.test_user_data = {
            'email': 'test@example.com',
            'username': 'testuser',
            'password': 'TestPass123'
        }
        
    def tearDown(self):
        CustomUser.objects.all().delete() 