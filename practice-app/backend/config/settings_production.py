import os
from .settings import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# Load environment variable for SECRET_KEY
SECRET_KEY = os.environ.get('SECRET_KEY', SECRET_KEY)

# Add Render.com domain to allowed hosts
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '.onrender.com']

# Database configuration - uses PostgreSQL on Render
import dj_database_url
DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///' + str(BASE_DIR / 'db.sqlite3'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# CORS settings for frontend
CORS_ALLOWED_ORIGINS = [
    'https://ecochallenge-frontend.onrender.com',
    'https://ecochallenge-backend.onrender.com',
    'http://localhost:3000',
    'http://localhost:10000',
]

# Ensure CSRF is properly configured
CSRF_TRUSTED_ORIGINS = [
    'https://ecochallenge-frontend.onrender.com',
    'https://ecochallenge-backend.onrender.com',
]

# Static files configuration
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Simplified storage backend for static files
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# Media files configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Configure middleware to include whitenoise for static files
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')

# Security settings for production
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

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
        'level': 'WARNING',
    },
}
