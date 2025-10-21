from .settings import *
import os
import dj_database_url

# Override the default SQLite database with PostgreSQL using DATABASE_URL
DATABASES = {
    'default': dj_database_url.config(
        default='postgresql://postgres:postgres@db:5432/ecochallenge',
        conn_max_age=60,
        conn_health_checks=True,
    )
}

# Allow all hosts in Docker environment
ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '*']

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# CORS settings
CORS_ALLOW_ALL_ORIGINS = True

# Debug settings
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

# CSRF and session settings
CSRF_TRUSTED_ORIGINS = ['http://localhost:8000', 'http://127.0.0.1:8000'] 