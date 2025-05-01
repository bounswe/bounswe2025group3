# create_test_users.py

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.db import IntegrityError

User = get_user_model()

# --- User Definitions ---
users_to_create = [
    {'email': 'admin@example.com', 'password': 'adminpass', 'role': User.Role.ADMIN, 'is_superuser': True, 'is_staff': True},
    {'email': 'moderator@example.com', 'password': 'modpass', 'role': User.Role.MODERATOR},
    {'email': 'user1@example.com', 'password': 'userpass', 'role': User.Role.USER},
    {'email': 'user2@example.com', 'password': 'userpass', 'role': User.Role.USER},
]
# ------------------------

for user_data in users_to_create:
    email = user_data['email']
    password = user_data['password']
    role = user_data['role']
    is_superuser = user_data.get('is_superuser', False)
    is_staff = user_data.get('is_staff', False)

    if User.objects.filter(email=email).exists():
        print(f"User '{email}' already exists. Skipping.")
        continue

    try:
        User.objects.create(
            email=email,
            password=make_password(password),
            role=role,
            is_superuser=is_superuser,
            is_staff=is_staff,
            is_active=True # Activate users by default
        )
        print(f"User '{email}' created successfully.")
    except IntegrityError as e:
        print(f"Error creating user '{email}': {e}")
    except Exception as e:
        print(f"An unexpected error occurred while creating user '{email}': {e}")

print("\nUser creation process finished.")
