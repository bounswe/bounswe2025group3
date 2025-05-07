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
# Import drf-spectacular views for API documentation
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)
from apps.authentication.views import login_view, protected_view, register_view
from django.views.generic import RedirectView
from apps.general_views import dashboard_view, goals_view, challenges_view, leaderboard_view, not_found_view
from django.conf import settings
from django.conf.urls.static import static

# Set custom 404 handler
handler404 = 'apps.general_views.not_found_view'

urlpatterns = [
    path('', RedirectView.as_view(url='/login/', permanent=True)), # Redirect root to login
    path('admin/', admin.site.urls),
    path('api/auth/', include(('apps.authentication.api.v1.urls', 'authentication'), namespace='authentication')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/user/', include('apps.user.api.v1.urls')),
    # Template views
    path('login/', login_view, name='login_view'), 
    path('register/', register_view, name='register_view'), 
    path('protected/', protected_view, name='protected_view'), 
    path('waste/', include('apps.waste.urls')),  # Frontend waste templates
    path('api/v1/waste/', include('apps.waste.api.v1.urls')),
    path('api/v1/goals/', include('apps.goals.api.v1.urls')),
    
    # Django allauth URLs
    path('accounts/', include('allauth.urls')),
    
    # Placeholder routes
    path('dashboard/', dashboard_view, name='dashboard_view'),
    path('goals/', goals_view, name='goals_view'),
    path('challenges/', challenges_view, name='challenges_view'),
    path('leaderboard/', leaderboard_view, name='leaderboard_view'),
    
    # API Documentation URLs
    # URL for the OpenAPI schema (used by Swagger and ReDoc)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    # URL for the Swagger UI documentation interface
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
