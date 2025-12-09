# Serializers for the user app (v1)

from rest_framework import serializers
from django.contrib.auth import get_user_model
from common.supabase_storage import upload_image, upload_base64_image, delete_image, extract_path_from_url

User = get_user_model() # This should get CustomUser

class UserProfileSerializer(serializers.ModelSerializer):
    # Image upload fields (write-only, not stored in model)
    profile_picture_file = serializers.ImageField(write_only=True, required=False)
    profile_picture_base64 = serializers.CharField(write_only=True, required=False)
    
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
            'profile_picture_url',
            'profile_picture_file',
            'profile_picture_base64',
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
            'date_joined',
            'profile_picture_url'  # Read-only, set via upload fields
        ]

    def validate(self, data):
        """Validate that only one image upload method is used"""
        picture_file = data.get('profile_picture_file')
        picture_base64 = data.get('profile_picture_base64')
        
        if picture_file and picture_base64:
            raise serializers.ValidationError(
                "Cannot provide both profile_picture_file and profile_picture_base64. Use only one."
            )
        return data

    def update(self, instance, validated_data):
        # Handle image uploads
        picture_file = validated_data.pop('profile_picture_file', None)
        picture_base64 = validated_data.pop('profile_picture_base64', None)
        
        # Upload image to Supabase if provided
        if picture_file or picture_base64:
            # Delete old image if exists
            if instance.profile_picture_url:
                old_path = extract_path_from_url(instance.profile_picture_url)
                if old_path:
                    delete_image(old_path)
            
            # Upload new image
            if picture_file:
                try:
                    picture_url = upload_image(
                        file_content=picture_file,
                        folder_path='profiles',
                        content_type=picture_file.content_type
                    )
                    validated_data['profile_picture_url'] = picture_url
                except Exception as e:
                    raise serializers.ValidationError(f"Failed to upload image: {str(e)}")
            elif picture_base64:
                try:
                    picture_url = upload_base64_image(
                        base64_string=picture_base64,
                        folder_path='profiles'
                    )
                    validated_data['profile_picture_url'] = picture_url
                except Exception as e:
                    raise serializers.ValidationError(f"Failed to upload image: {str(e)}")
        
        return super().update(instance, validated_data)

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
            'profile_picture_url',
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
