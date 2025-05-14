from apps.community.models import Recommendation  # Import the model
from rest_framework import serializers

class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        fields = ['id', 'title', 'description', 'category', 'created_by', 'created_at']