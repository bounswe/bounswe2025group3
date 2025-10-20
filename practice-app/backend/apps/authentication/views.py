from rest_framework_simplejwt.views import TokenObtainPairView
from apps.authentication.api.v1.serializers import CustomTokenObtainPairSerializer
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.conf import settings

class CustomTokenObtainPairView(TokenObtainPairView):
    """Takes email and password, returns JWT access and refresh tokens."""
    serializer_class = CustomTokenObtainPairSerializer

def login_view(request):
    """Render the login page with Google OAuth credentials."""
    # Get Google client ID from settings
    GCP_CLIENT_ID = settings.SOCIALACCOUNT_PROVIDERS.get('google', {}).get('APP', {}).get('client_id', '')
    
    context = {
        'GCP_CLIENT_ID': GCP_CLIENT_ID
    }
    return render(request, 'auth/login.html', context)

def register_view(request):
    """Render the registration page."""
    return render(request, 'auth/register.html')

@login_required
def protected_view(request):
    """Render a protected page that requires authentication."""
    return render(request, 'auth/protected.html') 