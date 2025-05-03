from rest_framework import serializers
from apps.waste.models import (
    WasteLog, WasteCategory, SubCategory, CustomCategoryRequest, WasteSuggestion, SustainableAction
)

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
    sub_category = serializers.PrimaryKeyRelatedField(queryset=SubCategory.objects.filter(is_active=True))
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    score = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = WasteLog
        fields = [
            'id', 'sub_category', 'user', 'quantity', 'date_logged', 'disposal_date',
            'disposal_location', 'disposal_photo', 'score'
        ]
        read_only_fields = ['date_logged', 'score']

    def get_score(self, obj):
        return obj.get_score() if obj.sub_category else None

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be a positive number.")
        return value

    def validate_disposal_date(self, value):
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("Disposal date cannot be in the future.")
        return value

    def validate_sub_category(self, value):
        if not value.is_active:
            raise serializers.ValidationError("Selected subcategory is not active.")
        return value

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
