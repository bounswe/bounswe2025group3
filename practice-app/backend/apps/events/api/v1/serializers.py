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
            'exact_location',    # Frontend: District
            'duration',          # Frontend: Duration
            'equipment_needed',  # Frontend: Equipment
            # ---------------------------------------------
            'creator', 'creator_username',
            'participants_count', 'likes_count',
            'i_am_participating', 'i_liked',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['creator', 'creator_username', 'participants_count', 'likes_count', 'created_at', 'updated_at']

    ## BLACKLISTED WORDS VALIDATION ##
    def validate(self, data):
        title = data.get("title", "")
        description = data.get("description", "")
        
        equipment = data.get("equipment_needed", "")
        exact_loc = data.get("exact_location", "")

        banned = getattr(settings, "BLACKLISTED_WORDS", [])

        lower_title = str(title).lower()
        lower_desc = str(description).lower()
        lower_equip = str(equipment).lower()
        lower_loc = str(exact_loc).lower()

        for word in banned:
            w = word.lower()

            if w in lower_title:
                raise serializers.ValidationError({
                    "title": f"Title contains banned word: '{word}'"
                })

            if w in lower_desc:
                raise serializers.ValidationError({
                    "description": f"Description contains banned word: '{word}'"
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