from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from dj_rest_auth.registration.views import RegisterView as DjRestAuthRegisterView
from django.contrib.auth import get_user_model
from .serializers import CustomTokenObtainPairSerializer, RegisterSerializer
from apps.authentication.services import AuthenticationService, OAuthService
from rest_framework.permissions import IsAuthenticated, AllowAny

# Import direct schema tools
from drf_spectacular.utils import extend_schema, OpenApiExample
from drf_spectacular.types import OpenApiTypes
# Correct Google Auth imports
try:
    from google.auth.transport import requests as google_requests
    from google.oauth2 import id_token as google_id_token
except ImportError:
    # Fallback to direct requests
    import requests
import os

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    @extend_schema(
        tags=['Authentication'],
        summary='User Registration',
        description='Register a new user account',
        responses={
            201: OpenApiTypes.OBJECT,  # Created
            400: OpenApiTypes.OBJECT,  # Bad request - validation errors
        },
        examples=[
            OpenApiExample(
                'Registration Request',
                value={
                    'email': 'newuser@example.com',
                    'password1': 'secure_password',
                    'password2': 'secure_password',
                },
                request_only=True,
            )
        ]
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer
    
    @extend_schema(
        tags=['Authentication'],
        summary='User Login',
        description='Authenticate a user with email/password and receive JWT tokens',
        responses={
            200: OpenApiTypes.OBJECT,
            400: OpenApiTypes.OBJECT,  # Bad request
            401: OpenApiTypes.OBJECT,  # Unauthorized
        },
        examples=[
            OpenApiExample(
                'Login Request',
                value={'email': 'user@example.com', 'password': 'secure_password'},
                request_only=True,
            )
        ]
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

@extend_schema(
    tags=['Authentication'],
    summary='Protected Resource Test',
    description='Test API endpoint that requires authentication. Returns user information when authorized.',
    responses={
        200: OpenApiTypes.OBJECT,
        401: OpenApiTypes.OBJECT,
    }
)
class ProtectedTestView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            'message': 'You have access to this protected resource',
            'user_id': request.user.id,
            'username': request.user.username,
            'email': request.user.email, 
            'role': request.user.role   
        })

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            # Get token from request
            id_token_str = request.data.get('id_token')
            if not id_token_str:
                return Response({'error': 'No token provided'}, status=status.HTTP_400_BAD_REQUEST)

            # Verify the Google ID token
            google_data = OAuthService.verify_provider_token('google', id_token_str)
            
            if not google_data:
                return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
            
            email = google_data.get('email')
            if not email:
                return Response({'error': 'Email not provided by Google'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Get or create user
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                # Create a new user
                first_name = google_data.get('first_name', '')
                last_name = google_data.get('last_name', '')
                username = AuthenticationService.generate_unique_username(email.split('@')[0])
                
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=None,  # No password for social auth users
                    first_name=first_name,
                    last_name=last_name,
                )
            
            # Create or update OAuth record
            OAuthService.get_or_create(
                user=user,
                provider='google',
                provider_user_id=google_data.get('provider_user_id')
            )
            
            # Generate JWT token
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user_id': user.id,
                'email': user.email,
                'role': getattr(user, 'role', 'user')  # Default to 'user' if no role field
            })
            
        except Exception as e:
            print(f"Google auth error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class GitHubLoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Authentication'],
        summary='GitHub OAuth Login',
        description='Authenticate a user using GitHub OAuth access token and receive JWT tokens',
        responses={
            200: OpenApiTypes.OBJECT,
            400: OpenApiTypes.OBJECT,
        },
        examples=[
            OpenApiExample(
                'GitHub OAuth Login Request',
                value={'access_token': 'github_oauth_access_token'},
                request_only=True,
            )
        ]
    )
    def post(self, request):
        try:

            access_token = request.data.get('access_token')
            code = request.data.get('code')
            # If code is provided, exchange it for an access token
            if not access_token and code:
                # Exchange code for access token
                import requests
                client_id = os.environ.get('GITHUB_CLIENT_ID')
                client_secret = os.environ.get('GITHUB_CLIENT_SECRET')
                print('GITHUB_CLIENT_ID:', client_id)
                print('GITHUB_CLIENT_SECRET:', client_secret)
                if not client_id or not client_secret:
                    return Response({'error': 'GitHub client ID/secret not configured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                token_resp = requests.post(
                    'https://github.com/login/oauth/access_token',
                    headers={'Accept': 'application/json'},
                    data={
                        'client_id': client_id,
                        'client_secret': client_secret,
                        'code': code,
                    }
                )
                if not token_resp.ok:
                    return Response({'error': 'Failed to exchange code for access token', 'details': token_resp.text}, status=status.HTTP_400_BAD_REQUEST)
                token_data = token_resp.json()
                access_token = token_data.get('access_token')
                if not access_token:
                    return Response({'error': 'No access token received from GitHub', 'details': token_data}, status=status.HTTP_400_BAD_REQUEST)


            if not access_token:
                return Response({'error': 'No access token or code provided'}, status=status.HTTP_400_BAD_REQUEST)

            github_data = OAuthService.verify_provider_token('github', access_token)
            if not github_data:
                return Response({'error': 'Invalid GitHub token'}, status=status.HTTP_400_BAD_REQUEST)

            email = github_data.get('email')
            if not email:
                return Response({'error': 'Email not provided by GitHub'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                first_name = github_data.get('first_name', '')
                last_name = github_data.get('last_name', '')
                username = AuthenticationService.generate_unique_username(email.split('@')[0])
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=None,  # No password for social auth users
                    first_name=first_name,
                    last_name=last_name,
                )

            OAuthService.get_or_create(
                user=user,
                provider='github',
                provider_user_id=github_data.get('provider_user_id')
            )

            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user_id': user.id,
                'email': user.email,
                'role': getattr(user, 'role', 'user')
            })
        except Exception as e:
            print(f"GitHub auth error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
