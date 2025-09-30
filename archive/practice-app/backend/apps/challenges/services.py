from django.utils import timezone
from django.db.models import Sum
from rest_framework.exceptions import ValidationError
from .models import Challenge, ChallengeParticipation, Team
from apps.waste.models import WasteLog


class ChallengeService:

    @staticmethod
    def create(user, data):
        
        challenge = Challenge.objects.create(
            name=data['name'],
            description=data['description'],
            goal_quantity=data['goal_quantity'],
            unit=data['unit'],
            target_category=data['target_category'],
            target_subcategory=data.get('target_subcategory'),  # optional
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
    def track_progress(user=None, waste_log=None):
        if waste_log:
            # Only update relevant participations for the given waste_log
            participations = ChallengeParticipation.objects.filter(
                user=waste_log.user,
                challenge__start_date__lte=waste_log.disposal_date,
                challenge__end_date__gte=waste_log.disposal_date
            )
        elif user:
            participations = ChallengeParticipation.objects.filter(user=user)
        else:
            participations = ChallengeParticipation.objects.all()

        for participation in participations:
            challenge = participation.challenge
            waste_logs = WasteLog.objects.filter(
                user=participation.user,
                disposal_date__range=[challenge.start_date, challenge.end_date]
            )

            total_score = sum([log.quantity for log in waste_logs])
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
