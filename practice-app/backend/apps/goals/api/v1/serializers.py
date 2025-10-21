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
        fields = ['id', 'name', 'description', 'category', 'category_name', 'target', 'timeframe', 'start_date', 'created_at']
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'name': {'help_text': 'Name of the goal template'},
            'description': {'help_text': 'Detailed description of the goal template'},
            'category': {'help_text': 'Waste category ID associated with this template'},
            'target': {'help_text': 'Target value to reach (in kg)'},
            'timeframe': {'help_text': 'Time period for the goal (e.g., "weekly", "monthly")'},
            'start_date': {
                'required': False,
                'help_text': 'Date when the template starts (optional, defaults to creation date if not provided)'
            },
        }


class GoalSerializer(serializers.ModelSerializer):
    # Use SerializerMethodField to calculate progress dynamically
    progress = serializers.SerializerMethodField(
        help_text="Current progress towards the goal, calculated in real-time"
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
        # 'progress' is now calculated, so it should be read_only
        read_only_fields = ['id', 'progress', 'is_complete', 'status', 'created_at']
        extra_kwargs = {
            'user': {'write_only': True},
            'timeframe': {'help_text': 'Timeframe for the goal (daily, weekly, monthly)'},
            'target': {'help_text': 'Target amount in kg'},
            'start_date': {
                'required': False,
                'help_text': 'Date when the goal starts (optional, defaults to creation date if not provided)'
            },
        }

    def get_progress(self, obj):
        """
        This method is called by the SerializerMethodField to get the value for 'progress'.
        It calls the model's method to perform the calculation.
        """
        return obj.calculate_current_progress()

    def create(self, validated_data):
        # Assign user from the request context
        validated_data['user'] = self.context['request'].user
        goal = Goal.objects.create(**validated_data)
        # Optional: run update_progress to set the initial status in the DB
        goal.update_progress()
        return goal

    def update(self, instance, validated_data):
        # Default update behavior
        instance = super().update(instance, validated_data)
        instance.update_progress()
        return instance