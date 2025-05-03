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
from .serializers import ProfileSerializer

User = get_user_model()

class RegisterView(DjRestAuthRegisterView):
    pass

class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

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
    
class ProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = ProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
