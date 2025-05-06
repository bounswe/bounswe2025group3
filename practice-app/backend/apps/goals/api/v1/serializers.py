from apps.goals.models import Goal
from django.utils import timezone
from rest_framework import serializers
from apps.goals.models import GoalTemplate
from apps.waste.models import WasteCategory
from apps.waste.api.v1.serializers import WasteCategorySerializer

class GoalTemplateSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = GoalTemplate
        fields = ['id', 'name', 'description', 'category', 'category_name', 'target', 'timeframe']
        read_only_fields = ['id']


class GoalSerializer(serializers.ModelSerializer):
    progress = serializers.FloatField(read_only=True)
    status = serializers.CharField(read_only=True)
    category = WasteCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        source='category', queryset=WasteCategory.objects.all(), write_only=True
    )

    class Meta:
        model = Goal
        fields = [
            'id', 'user', 'category', 'goal_type', 'timeframe',
            'target', 'progress', 'is_complete', 'start_date', 'end_date', 'status'
        ]
        read_only_fields = ['id', 'progress', 'is_complete', 'status']
        extra_kwargs = {'user': {'write_only': True}}

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

    def validate(self, attrs):
        start = attrs.get("start_date")
        end = attrs.get("end_date")
        if start and end and start >= end:
            raise serializers.ValidationError("start_date must be earlier than end_date.")
        return attrs
