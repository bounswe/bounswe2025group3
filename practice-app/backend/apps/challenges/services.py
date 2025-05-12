from django.utils import timezone
from django.db.models import Sum
from rest_framework.exceptions import ValidationError
from .models import Challenge, ChallengeParticipation, WasteLog, Team


class ChallengeService:

    @staticmethod
    def create(user, data):
        if not user.is_staff:
            raise ValidationError("You don't have permission to create a challenge.")
        
        challenge = Challenge.objects.create(
            name=data['name'],
            description=data['description'],
            goal=data['goal'],
            start_date=data['start_date'],
            end_date=data['end_date'],
            entry_type=data['entry_type'],
            creator=user,
        )
        return challenge

    @staticmethod
    def join(user, challenge_id):
        challenge = Challenge.objects.get(id=challenge_id)

        if challenge.start_date <= timezone.now():
            raise ValidationError("This challenge has already started.")

        if ChallengeParticipation.objects.filter(user=user, challenge=challenge).exists():
            raise ValidationError("You are already participating in this challenge.")

        participation = ChallengeParticipation.objects.create(
            user=user,
            challenge=challenge,
            score=0
        )
        return participation

    @staticmethod
    def track_progress():
        """
        Recalculate scores for all participants based on WasteLogs.
        Assumes that each WasteLog has a get_score() method.
        """
        participations = ChallengeParticipation.objects.select_related('user', 'challenge').all()

        for participation in participations:
            logs = WasteLog.objects.filter(
                user=participation.user,
                date_logged__range=(participation.challenge.start_date, participation.challenge.end_date)
            )

            total_score = 0
            for log in logs:
                if log.quantity and log.sub_category:
                    try:
                        total_score += log.get_score()
                    except:
                        continue  # handle logs with missing data or invalid sub_category
            
            participation.score = total_score
            participation.save()


class TeamService:

    @staticmethod
    def create(user, challenge_id, team_data):
        challenge = Challenge.objects.get(id=challenge_id)

        if challenge.entry_type != 'team':
            raise ValidationError("Teams can only be created for team-based challenges.")

        team = Team.objects.create(
            name=team_data['name'],
            challenge=challenge
        )
        return team

    @staticmethod
    def join(user, team_id):
        team = Team.objects.get(id=team_id)
        challenge = team.challenge

        if challenge.entry_type != 'team':
            raise ValidationError("This challenge does not support team entries.")

        if team.members.count() >= 5:
            raise ValidationError("This team is already full.")

        if ChallengeParticipation.objects.filter(user=user, challenge=challenge).exists():
            raise ValidationError("You are already participating in this challenge.")

        team.members.add(user)
        ChallengeParticipation.objects.create(user=user, challenge=challenge, team=team, score=0)
        return team
