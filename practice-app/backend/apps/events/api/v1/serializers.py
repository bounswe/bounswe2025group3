from rest_framework import serializers
from apps.events.models import Event

class EventSerializer(serializers.ModelSerializer):
    creator_username = serializers.ReadOnlyField(source='creator.username')
    participants_count = serializers.IntegerField(read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    i_am_participating = serializers.SerializerMethodField()
    i_liked = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'location', 'date', 'image',
            'creator', 'creator_username',
            'participants_count', 'likes_count',
            'i_am_participating', 'i_liked',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['creator', 'creator_username', 'participants_count', 'likes_count', 'created_at', 'updated_at']

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

    def create(self, validated_data):
        # creator will be attached in view (or you can set here if available in context)
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['creator'] = request.user
        return super().create(validated_data)
