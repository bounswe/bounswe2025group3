from rest_framework import serializers
from ...models import ChallengeTemplate, Challenge, ChallengeParticipation, Team
from django.contrib.auth import get_user_model
from apps.waste.models import WasteCategory, SubCategory

User = get_user_model()


class ChallengeTemplateSerializer(serializers.ModelSerializer):
    target_category = serializers.PrimaryKeyRelatedField(
        queryset=WasteCategory.objects.all(), required=False
    )
    target_subcategory = serializers.PrimaryKeyRelatedField(
        queryset=SubCategory.objects.all(), required=False
    )

    class Meta:
        model = ChallengeTemplate
        fields = [
            "id",
            "name",
            "description",
            "goal_quantity",
            "unit",
            "target_category",
            "target_subcategory",
            "start_date",
            "end_date",
            "entry_type",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs):
        category = attrs.get("target_category")
        subcategory = attrs.get("target_subcategory")

        if category and subcategory:
            raise serializers.ValidationError("Only one of target_category or target_subcategory should be set.")
        if not category and not subcategory:
            raise serializers.ValidationError("Either target_category or target_subcategory must be set.")

        return attrs



class ChallengeSerializer(serializers.ModelSerializer):
    creator = serializers.HiddenField(default=serializers.CurrentUserDefault())
    participants_count = serializers.SerializerMethodField()

    target_category = serializers.PrimaryKeyRelatedField(
        queryset=WasteCategory.objects.all(), required=False
    )
    target_subcategory = serializers.PrimaryKeyRelatedField(
        queryset=SubCategory.objects.all(), required=False
    )

    class Meta:
        model = Challenge
        fields = [
            "id",
            "name",
            "description",
            "goal_quantity",
            "unit",
            "target_category",
            "target_subcategory",
            "start_date",
            "end_date",
            "entry_type",
            "template",
            "creator",
            "created_at",
            "participants_count",
        ]
        read_only_fields = ["id", "creator", "created_at", "participants_count"]

    def get_participants_count(self, obj):
        return obj.participants.count()

    def validate(self, attrs):
        start = attrs.get("start_date")
        end = attrs.get("end_date")
        if start and end and start >= end:
            raise serializers.ValidationError("End date must be after start date.")

        category = attrs.get("target_category")
        subcategory = attrs.get("target_subcategory")

        if category and subcategory:
            raise serializers.ValidationError("Only one of target_category or target_subcategory should be set.")
        if not category and not subcategory:
            raise serializers.ValidationError("Either target_category or target_subcategory must be set.")

        return attrs


class ChallengeParticipationSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    challenge = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ChallengeParticipation
        fields = [
            "id",
            "user",
            "challenge",
            "team",
            "progress",
            "status",
            "joined_at",
            "completed_at",
            "exited_at",
        ]
        read_only_fields = fields

    def validate(self, attrs):
        user = self.context['request'].user
        challenge = attrs.get('challenge')
        team = attrs.get('team')

        # Ensure the user isn't already part of the challenge
        if ChallengeParticipation.objects.filter(user=user, challenge=challenge).exists():
            raise serializers.ValidationError("You have already joined this challenge.")

        # Prevent joining team-based challenges without a team
        if challenge.entry_type == 'team' and not team:
            raise serializers.ValidationError("You must be part of a team to join this challenge.")

        # Ensure the user is not already part of a team in the same challenge
        if team and ChallengeParticipation.objects.filter(user=user, challenge=challenge, team=team).exists():
            raise serializers.ValidationError("You are already part of this team for this challenge.")

        return attrs



class TeamSerializer(serializers.ModelSerializer):
    members = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Team
        fields = ["id", "name", "members", "created_at"]
        read_only_fields = ["id", "members", "created_at"]

    def validate(self, attrs):
        challenge = self.context['view'].kwargs.get('id')  # Assume challenge ID is passed in URL
        challenge_obj = Challenge.objects.get(id=challenge)

        # Ensure that teams can only be created for team-based challenges
        if challenge_obj.entry_type != 'team':
            raise serializers.ValidationError("Teams can only be created for team-based challenges.")

        # Ensure the team does not exceed a certain number of members (e.g., 5)
        if challenge_obj.entry_type == 'team':
            team_size = self.initial_data.get("members", [])
            if len(team_size) > 5:
                raise serializers.ValidationError("A team cannot have more than 5 members.")

        return attrs

