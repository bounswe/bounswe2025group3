"""
WSGI config for config project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os

# Use production settings if on Render, otherwise use default settings
if os.environ.get('RENDER'):
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings_production')
else:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Reset database on Render deployment before initializing Django
if os.environ.get('RENDER'):
    import django
    django.setup()
    from config.db_init import reset_db
    reset_db()

# Initialize Django WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
