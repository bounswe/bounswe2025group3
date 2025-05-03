"""


The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from apps.authentication.views import login_view, protected_view, register_view
from django.views.generic import RedirectView

urlpatterns = [
    path('', RedirectView.as_view(url='/login/', permanent=True)), # Redirect root to login
    path('admin/', admin.site.urls),
<<<<<<< HEAD
    path('api/auth/', include(('apps.authentication.api.v1.urls', 'authentication'), namespace='authentication')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/user/', include('apps.user.api.v1.urls')),
    # Template views
    path('login/', login_view, name='login_view'), 
    path('register/', register_view, name='register_view'), 
    path('protected/', protected_view, name='protected_view'), 
    path('api/v1/waste/', include('apps.waste.api.v1.urls')),
    
    # Django allauth URLs
    path('accounts/', include('allauth.urls')),  
]
