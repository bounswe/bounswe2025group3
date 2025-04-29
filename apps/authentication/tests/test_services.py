from django.test import TestCase
from apps.authentication.services import AuthenticationService, OAuthService
from django.contrib.auth import get_user_model
from django.test.utils import override_settings

User = get_user_model()

@override_settings(AUTH_USER_MODEL='user.CustomUser')  # Make sure to use your custom user model
class AuthenticationServiceTest(TestCase):
    def setUp(self):
        self.valid_password = "TestPass123"
        self.base_username = "testuser"
        self.test_email = "test@example.com"

    def test_password_validation_success(self):
        """Test password validation with valid password"""
        is_valid, message = AuthenticationService.validate_password(self.valid_password)
        self.assertTrue(is_valid)
        self.assertEqual(message, "")

    def test_password_validation_too_short(self):
        """Test password validation with too short password"""
        short_password = "Test123"
        is_valid, message = AuthenticationService.validate_password(short_password)
        self.assertFalse(is_valid)
        self.assertIn("8 characters", message)

    def test_password_validation_no_uppercase(self):
        """Test password validation with no uppercase letters"""
        no_upper_password = "testpass123"
        is_valid, message = AuthenticationService.validate_password(no_upper_password)
        self.assertFalse(is_valid)
        self.assertIn("uppercase", message)

    def test_password_validation_no_lowercase(self):
        """Test password validation with no lowercase letters"""
        no_lower_password = "TESTPASS123"
        is_valid, message = AuthenticationService.validate_password(no_lower_password)
        self.assertFalse(is_valid)
        self.assertIn("lowercase", message)

    def test_password_validation_no_numbers(self):
        """Test password validation with no numbers"""
        no_numbers_password = "TestPassWord"
        is_valid, message = AuthenticationService.validate_password(no_numbers_password)
        self.assertFalse(is_valid)
        self.assertIn("number", message)

    def test_unique_username_generation(self):
        """Test unique username generation"""
        # Create initial user
        User.objects.create_user(
            username=self.base_username,
            email=self.test_email,
            password=self.valid_password
        )

        # Generate new username
        new_username = AuthenticationService.generate_unique_username(self.base_username)
        self.assertNotEqual(new_username, self.base_username)
        self.assertTrue(new_username.startswith(self.base_username))
        self.assertTrue(new_username.replace(self.base_username, "").isdigit())

    def test_unique_username_with_special_chars(self):
        """Test username generation with special characters"""
        special_username = "test@user!"
        clean_username = AuthenticationService.generate_unique_username(special_username)
        self.assertFalse(any(not c.isalnum() for c in clean_username))

@override_settings(AUTH_USER_MODEL='user.CustomUser')
class OAuthServiceTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="TestPass123"
        )

    def test_verify_provider_token_valid(self):
        """Test verification of valid Google token"""
        result = OAuthService.verify_provider_token('google', 'valid_google_token')
        self.assertIsNotNone(result)
        self.assertIn('provider_user_id', result)
        self.assertIn('email', result)

    def test_verify_provider_token_invalid(self):
        """Test verification of invalid Google token"""
        result = OAuthService.verify_provider_token('google', 'invalid_token')
        self.assertIsNone(result)

    def test_get_or_create_oauth_record(self):
        """Test creating and retrieving OAuth record"""
        # Create new OAuth record
        oauth1 = OAuthService.get_or_create(
            self.user,
            'google',
            'google123'
        )
        
        # Try to get the same record
        oauth2 = OAuthService.get_or_create(
            self.user,
            'google',
            'google123'
        )
        
        self.assertEqual(oauth1, oauth2)  # Should return the same record 