from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer, LoginSerializer, TokenSerializer
from apps.authentication.services import AuthenticationService

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token = AuthenticationService.get_or_create_token_for_user(user)
            token_serializer = TokenSerializer(token)
            return Response(token_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            token = AuthenticationService.log_in(
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password']
            )
            if token:
                token_serializer = TokenSerializer(token)
                return Response(token_serializer.data, status=status.HTTP_200_OK)
            return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GoogleLoginView(APIView):
    def post(self, request):
        google_token = request.data.get('googleToken')
        token = AuthenticationService.log_in_via_google(google_token)
        if token:
            token_serializer = TokenSerializer(token)
            return Response(token_serializer.data, status=status.HTTP_200_OK)
        return Response({'detail': 'Invalid Google token'}, status=status.HTTP_401_UNAUTHORIZED)

class RefreshTokenView(APIView):
    def post(self, request):
        old_token_str = request.data.get('token')
        token = AuthenticationService.refresh_token(old_token_str)
        if token:
            token_serializer = TokenSerializer(token)
            return Response(token_serializer.data, status=status.HTTP_200_OK)
        return Response({'detail': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)

class RevokeTokenView(APIView):
    def post(self, request):
        token_str = request.data.get('token')
        if AuthenticationService.revoke_token(token_str):
            return Response({'detail': 'Token revoked successfully'}, status=status.HTTP_200_OK)
        return Response({'detail': 'Token not found'}, status=status.HTTP_404_NOT_FOUND)
