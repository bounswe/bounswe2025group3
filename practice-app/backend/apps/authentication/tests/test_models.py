import pytest
from django.utils import timezone
from datetime import timedelta
from apps.authentication.models import UserAuthToken, OAuth
from apps.authentication.tests.factories import UserFactory, UserAuthTokenFactory, OAuthFactory


@pytest.mark.django_db
class TestUserAuthToken:
    
    def test_token_creation(self):
        """Test creating a user auth token."""
        user = UserFactory()
        token = UserAuthTokenFactory(user=user)
        
        assert token.user == user
        assert token.token is not None
        assert token.expiry > timezone.now()
    
    def test_is_valid(self):
        """Test the is_valid method with a valid token."""
        token = UserAuthTokenFactory()
        assert token.is_valid() is True
    
    def test_is_valid_expired(self):
        """Test the is_valid method with an expired token."""
        token = UserAuthTokenFactory(expiry=timezone.now() - timedelta(days=1))
        assert token.is_valid() is False
    
    def test_refresh(self):
        """Test refreshing a token."""
        old_expiry = timezone.now() + timedelta(days=1)
        token = UserAuthTokenFactory(expiry=old_expiry)
        
        # Refresh the token
        token.refresh()
        
        # Token expiry should be extended
        assert token.expiry > old_expiry


@pytest.mark.django_db
class TestOAuth:
    
    def test_oauth_creation(self):
        """Test creating an OAuth record."""
        user = UserFactory()
        oauth = OAuthFactory(
            user=user,
            provider='google',
            provider_user_id='google_12345'
        )
        
        assert oauth.user == user
        assert oauth.provider == 'google'
        assert oauth.provider_user_id == 'google_12345'
        assert oauth.created is not None
    
    def test_oauth_provider_choices(self):
        """Test the OAuth provider choices."""
        # Verify that 'google' is a valid provider choice
        assert 'google' in dict(OAuth.PROVIDERS) 