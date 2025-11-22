from rest_framework import serializers
from apps.rewards.models import Badge, UserBadge

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'code', 'icon', 'description']


class UserBadgeSerializer(serializers.ModelSerializer):
    badge = BadgeSerializer()
    
    class Meta:
        model = UserBadge
        fields = ['badge', 'earned_at']
