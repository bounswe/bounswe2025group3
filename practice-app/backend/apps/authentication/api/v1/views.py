from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from dj_rest_auth.registration.views import RegisterView as DjRestAuthRegisterView
from django.contrib.auth import get_user_model
from .serializers import CustomTokenObtainPairSerializer
from apps.authentication.services import AuthenticationService, OAuthService
from rest_framework.permissions import IsAuthenticated
# Import direct schema tools
from drf_spectacular.utils import extend_schema, OpenApiExample
from drf_spectacular.types import OpenApiTypes

User = get_user_model()

class RegisterView(DjRestAuthRegisterView):
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
    summary='Google OAuth Login',
    description='Authenticate using a Google OAuth token and return JWT tokens',
    request={'application/json': {'googleToken': 'string'}},
    responses={
        200: OpenApiTypes.OBJECT,
        401: OpenApiTypes.OBJECT,
    },
    examples=[
        OpenApiExample(
            'Google Login Request',
            value={'googleToken': 'google_oauth_token_value'},
            request_only=True,
        )
    ]
)
class GoogleLoginView(APIView):
    def post(self, request):
        google_token = request.data.get('googleToken')
        google_data = OAuthService.verify_provider_token('google', google_token)
        
        if not google_data:
            return Response({'detail': 'Invalid Google token'}, 
                          status=status.HTTP_401_UNAUTHORIZED)
        
        username = google_data['email'].split('@')[0]  
        user, created = User.objects.get_or_create(
            email=google_data['email'],
            defaults={
                'username': AuthenticationService.generate_unique_username(username)
            }
        )
        
        OAuthService.get_or_create(user, 'google', google_data['provider_user_id'])
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role 
        }, status=status.HTTP_200_OK)

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
