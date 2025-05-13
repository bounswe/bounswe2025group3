from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta
import uuid
from apps.user.models import CustomUser

class UserAuthToken(models.Model):
    token = models.CharField(max_length=255, unique=True, default=uuid.uuid4)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='auth_tokens')
    expiry = models.DateTimeField()

    def is_valid(self):
        return timezone.now() < self.expiry

    def refresh(self):
        self.expiry = timezone.now() + timedelta(days=7)
        self.save()
        return self

class OAuth(models.Model):
    PROVIDERS = (
        ('google', 'Google'),
        # Add more if needed
    )
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='oauth_accounts')
    provider = models.CharField(max_length=50, choices=PROVIDERS)
    provider_user_id = models.CharField(max_length=255)
    created = models.DateTimeField(auto_now_add=True)
