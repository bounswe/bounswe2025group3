from django.urls import path, include, re_path
from dj_rest_auth.views import PasswordResetView, PasswordResetConfirmView, PasswordChangeView
from rest_framework_simplejwt.views import TokenRefreshView

from .views import RegisterView, LoginView, ProtectedTestView, GoogleLoginView, GitHubLoginView

urlpatterns = [
    # Custom Views (already refactored)
    path('register/', RegisterView.as_view(), name='rest_register'), 
    path('login/', LoginView.as_view(), name='rest_login'),       
    path('test-protected/', ProtectedTestView.as_view(), name='test-protected'),

    # Manually added dj-rest-auth password URLs
    path('password/reset/', PasswordResetView.as_view(), name='rest_password_reset'),
    # Need re_path for the UID and token parameters in the URL
    re_path(r'^password/reset/confirm/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,32})/$',
            PasswordResetConfirmView.as_view(), name='rest_password_reset_confirm'),
    path('password/change/', PasswordChangeView.as_view(), name='rest_password_change'),

    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('google/', GoogleLoginView.as_view(), name='google_login'),
    path('github/', GitHubLoginView.as_view(), name='github_login'),

]
