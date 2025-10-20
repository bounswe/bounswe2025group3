from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.exceptions import ImmediateHttpResponse
from allauth.socialaccount.signals import pre_social_login
from allauth.socialaccount.models import SocialAccount
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.shortcuts import redirect

User = get_user_model()

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    Custom social account adapter that automatically connects social accounts 
    to existing users with the same email address.
    """
    def pre_social_login(self, request, sociallogin):
        """
        Called before the social login is attempted.
        """
        # If social account already connected to a user, continue normally
        if sociallogin.is_existing:
            return
        
        # Get email from social account
        email = sociallogin.account.extra_data.get('email')
        if not email:
            return
        
        # Try to find a user with this email
        try:
            user = User.objects.get(email=email)
            
            # If found, connect this social account to the existing user
            sociallogin.connect(request, user)
            
        except User.DoesNotExist:
            # No existing user found with this email, let allauth handle signup
            pass

@receiver(pre_social_login)
def auto_associate_social_account(sender, request, sociallogin, **kwargs):
    """
    Signal handler to automatically associate social accounts with 
    existing users that have the same email address.
    """
    # If social account already connected to a user, continue normally
    if sociallogin.is_existing:
        return
    
    # Get email from social account
    email = sociallogin.account.extra_data.get('email')
    if not email:
        return
        
    # Try to find a user with this email
    try:
        user = User.objects.get(email=email)
        
        # If found, connect this social account to the existing user
        sociallogin.connect(request, user)
        
    except User.DoesNotExist:
        # No existing user found with this email, let allauth handle signup
        pass 