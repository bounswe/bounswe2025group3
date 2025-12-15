from rest_framework import serializers
from apps.events.models import Event
from django.conf import settings
from common.supabase_storage import upload_image, upload_base64_image, delete_image, extract_path_from_url


class EventSerializer(serializers.ModelSerializer):
    creator_username = serializers.ReadOnlyField(source='creator.username')
    participants_count = serializers.IntegerField(read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    i_am_participating = serializers.SerializerMethodField()
    i_liked = serializers.SerializerMethodField()
    
    # Image upload fields (write-only, not stored in model)
    image_file = serializers.ImageField(write_only=True, required=False)
    image_base64 = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'location', 'date', 'image',
            # 👇 NEW FIELDS ADDED HERE 👇
            'duration', 'equipment_needed', 'exact_location',
            'id', 'title', 'description', 'location', 'date', 'image_url',
            'image_file', 'image_base64',  # Upload fields
            'creator', 'creator_username',
            'participants_count', 'likes_count',
            'i_am_participating', 'i_liked',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['creator', 'creator_username', 'participants_count', 'likes_count', 'created_at', 'updated_at', 'image_url']

    ## BLACKLISTED WORDS VALIDATION ##
    def validate(self, data):
        # Get all text fields
        title = data.get("title", "")
        description = data.get("description", "")
        equipment = data.get("equipment_needed", "") # Check this too
        location_detail = data.get("exact_location", "") # Check this too

        banned = getattr(settings, "BLACKLISTED_WORDS", [])

        # Combine text for checking or check individually
        # Checking individually allows specific error messages
        fields_to_check = {
            "title": title,
            "description": description,
            "equipment_needed": equipment,
            "exact_location": location_detail
        }

        for field_name, value in fields_to_check.items():
            if not value: continue # Skip empty fields
            
            lower_value = str(value).lower()
            
            for word in banned:
                w = word.lower()
                if w in lower_value:
                    raise serializers.ValidationError({
                        field_name: f"{field_name.replace('_', ' ').capitalize()} contains banned word: '{word}'"
                    })

        return data

    def get_i_am_participating(self, obj):
        request = self.context.get('request')

        if not request or not request.user.is_authenticated:
            return False
            
        return request.user in obj.participants.all()

    def get_i_liked(self, obj):
        request = self.context.get('request')
        
        if not request or not request.user.is_authenticated:
            return False

        return request.user in obj.likes.all()

    def validate(self, data):
        """Validate that only one image upload method is used"""
        image_file = data.get('image_file')
        image_base64 = data.get('image_base64')
        
        if image_file and image_base64:
            raise serializers.ValidationError(
                "Cannot provide both image_file and image_base64. Use only one."
            )
        return data

    def create(self, validated_data):
        # Handle image uploads
        image_file = validated_data.pop('image_file', None)
        image_base64 = validated_data.pop('image_base64', None)
        
        # Upload image to Supabase if provided
        image_url = None
        if image_file:
            try:
                image_url = upload_image(
                    file_content=image_file,
                    folder_path='events',
                    content_type=image_file.content_type
                )
            except Exception as e:
                raise serializers.ValidationError(f"Failed to upload image: {str(e)}")
        elif image_base64:
            try:
                image_url = upload_base64_image(
                    base64_string=image_base64,
                    folder_path='events'
                )
            except Exception as e:
                raise serializers.ValidationError(f"Failed to upload image: {str(e)}")
        
        if image_url:
            validated_data['image_url'] = image_url
        
        # creator will be set by view's perform_create method
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Handle image uploads
        image_file = validated_data.pop('image_file', None)
        image_base64 = validated_data.pop('image_base64', None)
        
        # Upload image to Supabase if provided
        if image_file or image_base64:
            # Delete old image if exists
            if instance.image_url:
                old_path = extract_path_from_url(instance.image_url)
                if old_path:
                    delete_image(old_path)
            
            # Upload new image
            if image_file:
                try:
                    image_url = upload_image(
                        file_content=image_file,
                        folder_path='events',
                        content_type=image_file.content_type
                    )
                    validated_data['image_url'] = image_url
                except Exception as e:
                    raise serializers.ValidationError(f"Failed to upload image: {str(e)}")
            elif image_base64:
                try:
                    image_url = upload_base64_image(
                        base64_string=image_base64,
                        folder_path='events'
                    )
                    validated_data['image_url'] = image_url
                except Exception as e:
                    raise serializers.ValidationError(f"Failed to upload image: {str(e)}")
        
        return super().update(instance, validated_data)
