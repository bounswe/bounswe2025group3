import os
from .settings import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# Load environment variable for SECRET_KEY
SECRET_KEY = os.environ.get('SECRET_KEY', SECRET_KEY)

# Add Render.com and Cloud Run domains to allowed hosts
# Cloud Run uses dynamic hostnames - middleware will handle .run.app domains dynamically
ALLOWED_HOSTS = [
    'localhost', 
    '127.0.0.1', 
    '.onrender.com',
    'ecochallenge-backend-377411205810.us-central1.run.app',  # Cloud Run domain
]
# Note: Other .run.app domains will be handled by CloudRunHostMiddleware

# Database configuration - uses PostgreSQL (Supabase) on Render
import dj_database_url

# Get DATABASE_URL from environment variable
DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    raise ValueError(
        "DATABASE_URL environment variable is not set! "
        "Please set it in Render dashboard with your Supabase PostgreSQL URL."
    )

DATABASES = {
    'default': dj_database_url.config(
        default=DATABASE_URL,
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Static files configuration
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Simplified storage backend for static files
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# Media files configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Configure middleware to include whitenoise for static files
# Ensure CORS middleware is before WhiteNoise and other response-generating middleware
if 'corsheaders.middleware.CorsMiddleware' in MIDDLEWARE:
    MIDDLEWARE.remove('corsheaders.middleware.CorsMiddleware')

# Insert CORS middleware after SecurityMiddleware but before WhiteNoise
try:
    # Try to insert after SecurityMiddleware
    sec_index = MIDDLEWARE.index('django.middleware.security.SecurityMiddleware')
    MIDDLEWARE.insert(sec_index + 1, 'corsheaders.middleware.CorsMiddleware')
    cors_index = sec_index + 1
except ValueError:
    # If SecurityMiddleware not found, insert at top
    MIDDLEWARE.insert(0, 'corsheaders.middleware.CorsMiddleware')
    cors_index = 0

# Insert WhiteNoise after CORS middleware
MIDDLEWARE.insert(cors_index + 1, 'whitenoise.middleware.WhiteNoiseMiddleware')

# Insert Cloud Run host middleware at the beginning to handle dynamic hostnames
MIDDLEWARE.insert(0, 'common.middleware.CloudRunHostMiddleware')

# Security settings for production
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
CSRF_TRUSTED_ORIGINS = [
    'https://ecochallenge.onrender.com',
    'https://ecochallenge-backend.onrender.com',
    'https://ecochallenge-backend-377411205810.us-central1.run.app',
]

# Cross-Origin-Opener-Policy settings for OAuth compatibility
SECURE_CROSS_ORIGIN_OPENER_POLICY = 'same-origin-allow-popups'

# CORS Configuration - explicitly set for production
# IMPORTANT: When CORS_ALLOW_CREDENTIALS is True, we cannot use wildcards
CORS_ALLOW_ALL_ORIGINS = False  # Explicitly disable wildcard to use specific origins
CORS_ALLOWED_ORIGINS = [
    'https://ecochallenge.onrender.com',  # Production frontend
    'https://ecochallenge-backend.onrender.com',   # Production backend
    'https://ecochallenge-backend-377411205810.us-central1.run.app',  # GCP Cloud Run backend
    'http://localhost:3000',   # Local development frontend
    'http://127.0.0.1:3000',   # Local development frontend alternative
    'http://localhost:8000',   # Local development backend
    'http://127.0.0.1:8000',   # Local development backend alternative
    'http://10.0.2.2:8000',    # Android Emulator
]

# Allow credentials (cookies, authorization headers) to be sent with requests
CORS_ALLOW_CREDENTIALS = True

# CORS headers and methods
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Additional security headers
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Log settings
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',  # Increased for debugging
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
        },
    },
}
