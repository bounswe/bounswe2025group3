from rest_framework import serializers
from apps.waste.models import (
    WasteLog, WasteCategory, SubCategory, CustomCategoryRequest, WasteSuggestion, SustainableAction
)
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes
from common.supabase_storage import upload_image, upload_base64_image

class WasteCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteCategory
        fields = ['id', 'name', 'description', 'is_active']

class SubCategorySerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=WasteCategory.objects.all())
    class Meta:
        model = SubCategory
        fields = ['id', 'name', 'category', 'description', 'score_per_unit', 'unit', 'is_active']

    def validate_category(self, value):
        if not WasteCategory.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Category does not exist.")
        return value

class WasteLogSerializer(serializers.ModelSerializer):
    sub_category = serializers.PrimaryKeyRelatedField(queryset=SubCategory.objects.filter(is_active=True), allow_null=True)
    sub_category_name = serializers.CharField(source='sub_category.name', read_only=True)
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    score = serializers.SerializerMethodField(read_only=True)
    
    # Image upload fields (write-only, not stored in model)
    disposal_photo_file = serializers.ImageField(write_only=True, required=False)
    disposal_photo_base64 = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = WasteLog
        fields = [
            'id', 'sub_category', 'sub_category_name', 'user', 'quantity', 'date_logged', 'disposal_date',
            'disposal_location', 'disposal_photo_url',
            'disposal_photo_file', 'disposal_photo_base64',  # Upload fields
            'score'
        ]
        read_only_fields = ['date_logged', 'score', 'sub_category_name', 'disposal_photo_url']

    @extend_schema_field(OpenApiTypes.FLOAT)
    def get_score(self, obj):
        return obj.get_score() if obj.sub_category else None

    def validate_quantity(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Quantity must be a positive number.")
        return value

    def validate_disposal_date(self, value):
        from datetime import date
        if value and value > date.today():
            raise serializers.ValidationError("Disposal date cannot be in the future.")
        return value

    def validate_sub_category(self, value):
        if value and not value.is_active:
            raise serializers.ValidationError("Selected subcategory is not active.")
        return value

    def validate(self, data):
        """Validate that only one image upload method is used"""
        photo_file = data.get('disposal_photo_file')
        photo_base64 = data.get('disposal_photo_base64')
        
        if photo_file and photo_base64:
            raise serializers.ValidationError(
                "Cannot provide both disposal_photo_file and disposal_photo_base64. Use only one."
            )
        return data

    def create(self, validated_data):
        # Handle image uploads
        photo_file = validated_data.pop('disposal_photo_file', None)
        photo_base64 = validated_data.pop('disposal_photo_base64', None)
        
        # Upload image to Supabase if provided
        photo_url = None
        if photo_file:
            try:
                photo_url = upload_image(
                    file_content=photo_file,
                    folder_path='waste',
                    content_type=photo_file.content_type
                )
            except Exception as e:
                raise serializers.ValidationError(f"Failed to upload image: {str(e)}")
        elif photo_base64:
            try:
                photo_url = upload_base64_image(
                    base64_string=photo_base64,
                    folder_path='waste'
                )
            except Exception as e:
                raise serializers.ValidationError(f"Failed to upload image: {str(e)}")
        
        if photo_url:
            validated_data['disposal_photo_url'] = photo_url
        
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Handle image uploads
        photo_file = validated_data.pop('disposal_photo_file', None)
        photo_base64 = validated_data.pop('disposal_photo_base64', None)
        
        # Upload image to Supabase if provided
        if photo_file:
            try:
                photo_url = upload_image(
                    file_content=photo_file,
                    folder_path='waste',
                    content_type=photo_file.content_type
                )
                validated_data['disposal_photo_url'] = photo_url
            except Exception as e:
                raise serializers.ValidationError(f"Failed to upload image: {str(e)}")
        elif photo_base64:
            try:
                photo_url = upload_base64_image(
                    base64_string=photo_base64,
                    folder_path='waste'
                )
                validated_data['disposal_photo_url'] = photo_url
            except Exception as e:
                raise serializers.ValidationError(f"Failed to upload image: {str(e)}")
        
        return super().update(instance, validated_data)

class CustomCategoryRequestSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    class Meta:
        model = CustomCategoryRequest
        fields = [
            'id', 'user', 'name', 'description', 'suggested_category', 'unit', 'status', 'admin_notes'
        ]
        read_only_fields = ['status', 'admin_notes']

class WasteSuggestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteSuggestion
        fields = [
            'id', 'text', 'related_category', 'related_subcategory', 'created_by', 'created_at'
        ]
        read_only_fields = ['created_by', 'created_at']

class SustainableActionSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    class Meta:
        model = SustainableAction
        fields = [
            'id', 'user', 'action_type', 'description', 'date', 'score'
        ]

class AdminActionResponseSerializer(serializers.Serializer):
    detail = serializers.CharField()

class UserScoreSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    total_score = serializers.FloatField()


class UserRankingSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField()
    total_score = serializers.IntegerField(read_only=True)


class WasteStatsItemSerializer(serializers.Serializer):
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    total_score = serializers.FloatField()
    total_log = serializers.IntegerField()