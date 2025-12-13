from rest_framework import serializers
from apps.events.models import Event
from django.conf import settings

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
            # 👇 NEW FIELDS ADDED HERE 👇
            'duration', 'equipment_needed', 'exact_location',
            'creator', 'creator_username',
            'participants_count', 'likes_count',
            'i_am_participating', 'i_liked',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['creator', 'creator_username', 'participants_count', 'likes_count', 'created_at', 'updated_at']

    ## BLACKLISTED WORDS VALIDATION ##
    def validate(self, data):
        # Get all text fields
        title = data.get("title", "")
        description = data.get("description", "")
        equipment = data.get("equipment_needed", "") # Check this too
        location_detail = data.get("exact_location", "") # Check this too

        banned = getattr(settings, "BLACKLISTED_WORDS", [])

        # Combine text for checking or check individually
        # Checking individually allows specific error messages
        fields_to_check = {
            "title": title,
            "description": description,
            "equipment_needed": equipment,
            "exact_location": location_detail
        }

        for field_name, value in fields_to_check.items():
            if not value: continue # Skip empty fields
            
            lower_value = str(value).lower()
            
            for word in banned:
                w = word.lower()
                if w in lower_value:
                    raise serializers.ValidationError({
                        field_name: f"{field_name.replace('_', ' ').capitalize()} contains banned word: '{word}'"
                    })

            if w in lower_equip:
                raise serializers.ValidationError({
                    "equipment_needed": f"Equipment list contains banned word: '{word}'"
                })
            
            if w in lower_loc:
                 raise serializers.ValidationError({
                    "exact_location": f"District/Location contains banned word: '{word}'"
                })

        return data

    def get_i_am_participating(self, obj):
        request = self.context.get('request')

        if not request or not request.user.is_authenticated:
            return False
            
        return request.user in obj.participants.all()

    def get_i_liked(self, obj):
        request = self.context.get('request')
        
        if not request or not request.user.is_authenticated:
            return False

        return request.user in obj.likes.all()

    def create(self, validated_data):
        # creator will be attached in view (or you can set here if available in context)
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['creator'] = request.user
        return super().create(validated_data)