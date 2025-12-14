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




class BadgeGallerySerializer(serializers.ModelSerializer):
    earned = serializers.SerializerMethodField()

    class Meta:
        model = Badge
        fields = ["id", "code", "name", "icon", "description", "earned"]

    def get_earned(self, badge):
        user = self.context["request"].user
        return UserBadge.objects.filter(user=user, badge=badge).exists()