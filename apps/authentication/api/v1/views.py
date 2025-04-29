from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer
from apps.authentication.services import AuthenticationService, OAuthService
from rest_framework.permissions import IsAuthenticated

User = get_user_model()

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            # Create user with username, email and password
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user_id': user.id,
                'username': user.username,
                'email': user.email
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({'detail': 'Please provide both email and password'},
                          status=status.HTTP_400_BAD_REQUEST)
        
        user = AuthenticationService.authenticate_user(email, password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user_id': user.id,
                'username': user.username,
                'email': user.email
            }, status=status.HTTP_200_OK)
        return Response({'detail': 'Invalid credentials'}, 
                      status=status.HTTP_401_UNAUTHORIZED)

class GoogleLoginView(APIView):
    def post(self, request):
        google_token = request.data.get('googleToken')
        google_data = OAuthService.verify_provider_token('google', google_token)
        
        if not google_data:
            return Response({'detail': 'Invalid Google token'}, 
                          status=status.HTTP_401_UNAUTHORIZED)
        
        # Get or create user based on email
        username = google_data['email'].split('@')[0]  # Use email prefix as username
        user, created = User.objects.get_or_create(
            email=google_data['email'],
            defaults={
                'username': AuthenticationService.generate_unique_username(username)
            }
        )
        
        # Create OAuth record
        OAuthService.get_or_create(user, 'google', google_data['provider_user_id'])
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user_id': user.id,
            'username': user.username,
            'email': user.email
        }, status=status.HTTP_200_OK)

class ProtectedTestView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            'message': 'You have access to this protected resource',
            'user_id': request.user.id,
            'username': request.user.username
        })
