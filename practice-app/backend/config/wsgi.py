"""
WSGI config for config project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Initialize Django WSGI application
application = get_wsgi_application()

# Reset database on Render deployment
if os.environ.get('RENDER'):
    from config.db_init import reset_db
    reset_db()
