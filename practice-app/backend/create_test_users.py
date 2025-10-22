import os
import django
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.db import IntegrityError

# Use production settings if on Render, otherwise use default settings
if os.environ.get('RENDER'):
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings_production')
else:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

User = get_user_model()

users_to_create = [
    {
        'email': 'admin@example.com',
        'password': 'adminpass',
        'username': 'admin',
        'first_name': 'Admin',
        'last_name': 'User',
        'role': User.Role.ADMIN,
        'is_superuser': True,
        'is_staff': True
    },
    {
        'email': 'moderator@example.com',
        'password': 'modpass',
        'username': 'moderator',
        'first_name': 'Moderator',
        'last_name': 'User',
        'role': User.Role.MODERATOR
    },
    {
        'email': 'regularuser@example.com',
        'password': 'userpass',
        'username': 'regular1',
        'first_name': 'Regular1',
        'last_name': 'One',
        'role': User.Role.USER
    },
    {
        'email': 'regularuser2@example.com',
        'password': 'userpass',
        'username': 'regular2',
        'first_name': 'Regular2',
        'last_name': 'Two',
        'role': User.Role.USER
    },
]

for user_data in users_to_create:
    email = user_data['email']
    password = user_data['password']
    username = user_data['username']
    role = user_data['role']
    is_superuser = user_data.get('is_superuser', False)
    is_staff = user_data.get('is_staff', False)
    first_name = user_data['first_name']
    last_name = user_data['last_name']

    if User.objects.filter(email=email).exists():
        print(f"User '{email}' already exists. Skipping.")
        continue

    try:
        User.objects.create(
            email=email,
            username=username,
            password=make_password(password),
            role=role,
            is_superuser=is_superuser,
            is_staff=is_staff,
            first_name=first_name,
            last_name=last_name,
            is_active=True
        )
        print(f"User '{email}' created successfully.")
    except IntegrityError as e:
        print(f"Error creating user '{email}': {e}")
    except Exception as e:
        print(f"An unexpected error occurred while creating user '{email}': {e}")

print("\nUser creation process finished.")