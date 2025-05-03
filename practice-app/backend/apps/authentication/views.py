from rest_framework_simplejwt.views import TokenObtainPairView
from apps.authentication.api.v1.serializers import CustomTokenObtainPairSerializer
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required

class CustomTokenObtainPairView(TokenObtainPairView):
    """Takes email and password, returns JWT access and refresh tokens."""
    serializer_class = CustomTokenObtainPairSerializer 

def login_view(request):
    return render(request, 'auth/login.html')

def register_view(request):
    return render(request, 'auth/register.html')

def protected_view(request):
    # Just render the template, the client-side JS will handle authentication
    return render(request, 'auth/protected.html') 