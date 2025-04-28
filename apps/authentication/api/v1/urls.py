from django.urls import path
from .views import RegisterView, LoginView, GoogleLoginView, RefreshTokenView, RevokeTokenView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('google/', GoogleLoginView.as_view(), name='google_login'),
    path('refresh/', RefreshTokenView.as_view(), name='refresh_token'),
    path('revoke/', RevokeTokenView.as_view(), name='revoke_token'),
]
