"""
Custom middleware for handling Cloud Run dynamic hostnames
"""
from django.core.exceptions import DisallowedHost


class CloudRunHostMiddleware:
    """
    Middleware to allow Cloud Run dynamic hostnames.
    Cloud Run uses hostnames like *.run.app which Django's ALLOWED_HOSTS doesn't support well.
    This middleware dynamically adds .run.app domains to ALLOWED_HOSTS.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Check if host ends with .run.app (Cloud Run domain)
        host = request.get_host().split(':')[0]  # Remove port if present
        
        # Allow all .run.app domains for Cloud Run
        if host.endswith('.run.app') or host.endswith('.a.run.app'):
            from django.conf import settings
            # Dynamically add to ALLOWED_HOSTS if not already there
            if host not in settings.ALLOWED_HOSTS:
                settings.ALLOWED_HOSTS.append(host)
        
        return self.get_response(request)

