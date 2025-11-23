from rest_framework import serializers
from apps.notifications.models import Notification
from apps.events.api.v1.serializers import EventSerializer  # Assuming EventSerializer is defined


class EventTitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification.event.field.related_model
        fields = ['id', 'title']


class NotificationSerializer(serializers.ModelSerializer):
    # Nested representation of the related event (only title and ID)
    event_details = EventTitleSerializer(source='event', read_only=True)

    # Custom message for the frontend
    message = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'event', 'event_details',
            'is_read', 'created_at', 'message'
        ]
        read_only_fields = [
            'notification_type', 'event', 'event_details', 'created_at', 'message'
        ]

    def get_message(self, obj):
        if obj.notification_type == 'EVENT_CREATED':
            event_name = obj.event.title if obj.event else 'a new event'
            return f"A new event '{event_name}' was created in your city!"
        return "You have a new update."