from rest_framework import serializers
from .models import WasteLog, WasteCategory

class WasteLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteLog
        fields = ['id', 'date', 'quantity', 'category']

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be a positive number.")
        return value

    def validate_date(self, value):
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("Date cannot be in the future.")
        return value

    def validate_category(self, value):
        if not WasteCategory.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Category does not exist.")
        return value

class WasteCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteCategory
        fields = ['id', 'name', 'score']  # Add other fields if you have them
