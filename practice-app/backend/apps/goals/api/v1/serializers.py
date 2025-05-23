from apps.goals.models import Goal
from django.utils import timezone
from rest_framework import serializers
from apps.goals.models import GoalTemplate
from apps.waste.models import SubCategory
from apps.waste.api.v1.serializers import SubCategorySerializer
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes

class GoalTemplateSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source='category.name',
        read_only=True, 
        help_text="Name of the waste category associated with this template"
    )

    class Meta:
        model = GoalTemplate
        fields = ['id', 'name', 'description', 'category', 'category_name', 'target', 'timeframe']
        read_only_fields = ['id']
        extra_kwargs = {
            'name': {'help_text': 'Name of the goal template'},
            'description': {'help_text': 'Detailed description of the goal template'},
            'category': {'help_text': 'Waste category ID associated with this template'},
            'target': {'help_text': 'Target value to reach (in kg)'},
            'timeframe': {'help_text': 'Time period for the goal (e.g., "weekly", "monthly")'},
        }


class GoalSerializer(serializers.ModelSerializer):
    progress = serializers.FloatField(
        read_only=True,
        help_text="Current progress towards the goal"
    )
    
    status = serializers.CharField(
        read_only=True,
        help_text="Current status of the goal (active, achieved, failed)"
    )
    
    category = SubCategorySerializer(
        read_only=True,
        help_text="Waste category details"
    )
    
    category_id = serializers.PrimaryKeyRelatedField(
        source='category', 
        queryset=SubCategory.objects.all(), 
        write_only=True,
        help_text="ID of the waste category for this goal"
    )

    class Meta:
        model = Goal
        fields = [
            'id', 'user', 'category', 'category_id', 'timeframe',
            'target', 'progress', 'is_complete', 'created_at', 'start_date', 'status'
        ]
        read_only_fields = ['id', 'progress', 'is_complete', 'status', 'created_at']
        extra_kwargs = {
            'user': {'write_only': True},
            'timeframe': {'help_text': 'Timeframe for the goal (daily, weekly, monthly)'},
            'target': {'help_text': 'Target amount in kg'},
            'start_date': {'help_text': 'Date when the goal starts (YYYY-MM-DD)'},
        }

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        goal = Goal.objects.create(**validated_data)
        goal.update_progress()
        return goal

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        instance.update_progress()
        return instance

