from django.utils import timezone
from django.contrib.auth import authenticate, get_user_model
from .models import UserAuthToken, OAuth
from datetime import timedelta
import uuid
from django.utils.text import slugify
import re
import requests

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
        print(f"Verifying {provider} token: {token[:10]}...")
        
        if provider == 'google':
            try:
                # Google token verification endpoint
                google_verify_url = 'https://www.googleapis.com/oauth2/v3/tokeninfo'
                print(f"Making request to: {google_verify_url}?id_token={token[:10]}...")
                
                response = requests.get(f'{google_verify_url}?id_token={token}')
                
                print(f"Google API response: status={response.status_code}")
                
                if not response.ok:
                    print(f"Google API error: {response.text}")
                    return None
                
                google_data = response.json()
                print(f"Google data received: {google_data.keys()}")
                
                # Extract relevant user info
                result = {
                    'provider_user_id': google_data.get('sub'),
                    'email': google_data.get('email'),
                    'first_name': google_data.get('given_name', ''),
                    'last_name': google_data.get('family_name', '')
                }
                
                print(f"Extracted user data: {result}")
                return result
                
            except Exception as e:
                print(f"Google token verification error: {str(e)}")
                return None
        
        elif provider == 'github':
            try:
                # Get user info from GitHub
                user_resp = requests.get(
                    'https://api.github.com/user',
                    headers={'Authorization': f'token {token}'}
                )
                if not user_resp.ok:
                    print(f"GitHub API error: {user_resp.text}")
                    return None
                user_data = user_resp.json()
                # Get email (may need to fetch from /user/emails if not public)
                email = user_data.get('email')
                if not email:
                    emails_resp = requests.get(
                        'https://api.github.com/user/emails',
                        headers={'Authorization': f'token {token}'}
                    )
                    if emails_resp.ok:
                        emails = emails_resp.json()
                        # Find primary, verified email
                        for e in emails:
                            if e.get('primary') and e.get('verified'):
                                email = e.get('email')
                                break
                        if not email and emails:
                            email = emails[0].get('email')
                result = {
                    'provider_user_id': str(user_data.get('id')),
                    'email': email,
                    'first_name': user_data.get('name', '').split(' ')[0] if user_data.get('name') else '',
                    'last_name': ' '.join(user_data.get('name', '').split(' ')[1:]) if user_data.get('name') else ''
                }
                print(f"Extracted GitHub user data: {result}")
                return result
            except Exception as e:
                print(f"GitHub token verification error: {str(e)}")
                return None
        
        return None  # Unsupported provider or token verification failed

    @staticmethod
    def get_or_create(user, provider, provider_user_id):
        oauth, created = OAuth.objects.get_or_create(
            user=user,
            provider=provider,
            provider_user_id=provider_user_id
        )
        return oauth


class AuthenticationService:
    @staticmethod
    def authenticate_user(email, password):
        """
        Authenticate a user using email and password.
        Returns the user object if authentication is successful, None otherwise.
        """
        return authenticate(email=email, password=password)

    @staticmethod
    def generate_unique_username(base_username):
        """
        Generate a unique username based on the given base username.
        If the username exists, append a number to make it unique.
        """
        # Clean the username: remove special chars, convert to lowercase
        username = slugify(base_username)
        username = re.sub(r'[^a-z0-9]', '', username)
        
        if not User.objects.filter(username=username).exists():
            return username

        # If username exists, append numbers until we find a unique one
        counter = 1
        while User.objects.filter(username=f"{username}{counter}").exists():
            counter += 1
        return f"{username}{counter}"

    @staticmethod
    def create_user(username, email, password, **extra_fields):
        """
        Create a new user with the given username, email and password.
        """
        if not email or not password or not username:
            raise ValueError('Username, email and password are required')
            
        # Ensure username is unique
        username = AuthenticationService.generate_unique_username(username)
            
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            **extra_fields
        )
        return user

    @staticmethod
    def validate_password(password):
        """
        Validate password strength.
        Returns (is_valid, error_message)
        """
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"
        if not re.search(r'[A-Z]', password):
            return False, "Password must contain at least one uppercase letter"
        if not re.search(r'[a-z]', password):
            return False, "Password must contain at least one lowercase letter"
        if not re.search(r'[0-9]', password):
            return False, "Password must contain at least one number"
        return True, ""

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
