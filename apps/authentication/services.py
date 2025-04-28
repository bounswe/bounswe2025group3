from django.utils import timezone
from django.contrib.auth import authenticate, get_user_model
from .models import UserAuthToken, OAuth
from datetime import timedelta
import uuid

User = get_user_model()

class TokenService:
    @staticmethod
    def create(user):
        expiry = timezone.now() + timedelta(days=7)
        token_obj = UserAuthToken.objects.create(user=user, expiry=expiry)
        return token_obj

    @staticmethod
    def get(token_str):
        try:
            return UserAuthToken.objects.get(token=token_str)
        except UserAuthToken.DoesNotExist:
            return None

    @staticmethod
    def delete(token_str):
        token = TokenService.get(token_str)
        if token:
            token.delete()
            return True
        return False

    @staticmethod
    def validate(token_str):
        token = TokenService.get(token_str)
        return token and token.is_valid()

    @staticmethod
    def get_or_create(user):
        token = user.auth_tokens.filter(expiry__gt=timezone.now()).first()
        if not token:
            token = TokenService.create(user)
        return token


class OAuthService:
    @staticmethod
    def verify_provider_token(provider, token):
        # MOCK Google verification
        if provider == 'google' and token == "valid_google_token":
            return {'provider_user_id': 'google123', 'email': 'googleuser@example.com'}
        return None

    @staticmethod
    def get_or_create(user, provider, provider_user_id):
        oauth, created = OAuth.objects.get_or_create(
            user=user, provider=provider, provider_user_id=provider_user_id
        )
        return oauth


class AuthenticationService:
    @staticmethod
    def sign_up(username, email, password):
        user = User.objects.create_user(username=username, email=email, password=password)
        token = TokenService.create(user)
        return token

    @staticmethod
    def log_in(email, password):
        user = authenticate(email=email, password=password)
        if not user:
            return None
        token = TokenService.get_or_create(user)
        return token

    @staticmethod
    def log_in_via_google(google_token):
        google_data = OAuthService.verify_provider_token('google', google_token)
        if not google_data:
            return None
        user, _ = User.objects.get_or_create(email=google_data['email'], defaults={'username': google_data['email']})
        OAuthService.get_or_create(user, 'google', google_data['provider_user_id'])
        token = TokenService.create(user)
        return token

    @staticmethod
    def refresh_token(old_token_str):
        token = TokenService.get(old_token_str)
        if token and token.is_valid():
            token.refresh()
            return token
        return None

    @staticmethod
    def revoke_token(token_str):
        return TokenService.delete(token_str)
    
    @staticmethod
    def get_or_create_token_for_user(user):
        return TokenService.get_or_create(user)
