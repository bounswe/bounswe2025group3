from rest_framework import serializers
from apps.events.models import Event
from common.supabase_storage import upload_image, upload_base64_image


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
            'id', 'title', 'description', 'location', 'date', 'image_url',
            'image_file', 'image_base64',  # Upload fields
            'creator', 'creator_username',
            'participants_count', 'likes_count',
            'i_am_participating', 'i_liked',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['creator', 'creator_username', 'participants_count', 'likes_count', 'created_at', 'updated_at', 'image_url']

    def get_i_am_participating(self, obj):
        user = self.context['request'].user
        if user.is_anonymous:
            return False
        return obj.participants.filter(pk=user.pk).exists()

    def get_i_liked(self, obj):
        user = self.context['request'].user
        if user.is_anonymous:
            return False
        return obj.likes.filter(pk=user.pk).exists()

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
        
        # creator will be attached in view (or you can set here if available in context)
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['creator'] = request.user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Handle image uploads
        image_file = validated_data.pop('image_file', None)
        image_base64 = validated_data.pop('image_base64', None)
        
        # Upload image to Supabase if provided
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
