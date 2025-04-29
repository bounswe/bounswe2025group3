from django.urls import path
from .views import RegisterView, LoginView, GoogleLoginView, ProtectedTestView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('google/', GoogleLoginView.as_view(), name='google_login'),
    path('test-protected/', ProtectedTestView.as_view(), name='test-protected'),
]
