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

# DANGEROUS: Only reset database if explicitly requested via RESET_DB=true
# This will DELETE ALL DATA in your database!
# To reset: Set environment variable RESET_DB=true in Render dashboard
if os.environ.get('RENDER') and os.environ.get('RESET_DB', '').lower() == 'true':
    import django
    django.setup()
    from config.db_init import reset_db
    print("⚠️  WARNING: Resetting database as RESET_DB=true")
    reset_db()
    print("✅ Database reset complete")

# Initialize Django WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
