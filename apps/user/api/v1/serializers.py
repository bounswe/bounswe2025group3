# Serializers for the user app (v1)

from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model() # This should get CustomUser

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Fields that the user can view and potentially update
        fields = [
            'id', 
            'username', 
            'email', 
            'first_name', 
            'last_name', 
            'bio',
            # 'profile_picture', # Handle ImageField separately if needed (e.g., requires multipart form)
            'city', 
            'country',
            'role', # Display role
            'date_joined',
            'notifications_enabled' # Added from CustomUser
        ]
        # Fields that should not be directly editable by the user via this endpoint
        read_only_fields = [
            'id', 
            'username', # Usually not changed, or needs special handling
            'email',    # Email change usually requires verification
            'role',     # Role changes should be admin-only
            'date_joined'
        ]

class AdminUserSerializer(serializers.ModelSerializer):
    """
    Serializer for Admin users to manage other user accounts.
    Allows viewing/editing most fields, including role and active status.
    Handles password setting securely.
    """
    # Make password write-only and not required on updates
    password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'bio',
            'city',
            'country',
            'is_active',
            'is_staff',       # Admins might manage staff status
            'is_superuser',   # Admins might manage superuser status
            'notifications_enabled',
            'date_joined',
            'last_login',
            'password',       # Include for creation/update
        ]
        read_only_fields = ['date_joined', 'last_login']

    def create(self, validated_data):
        # Use the create_user method to handle password hashing
        user = User.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        # Handle password update separately if provided
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)

        if password:
            user.set_password(password)
            user.save()

        return user
