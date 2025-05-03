from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from django.http import JsonResponse

def root_view(request):
    return JsonResponse({'message': 'API root. Use the frontend at http://localhost:3000/'}, status=200)

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', root_view, name='root'),
    path('admin/', admin.site.urls),
    path('api/auth/', include(('apps.authentication.api.v1.urls', 'authentication'), namespace='authentication')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('api/user/', include('apps.user.api.v1.urls')),
    path('api/', include('apps.waste.urls')),
    path('accounts/', include('allauth.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)