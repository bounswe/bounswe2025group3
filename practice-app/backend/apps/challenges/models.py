from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class ChallengeTemplate(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    goal = models.TextField()
    duration_days = models.PositiveIntegerField()
    entry_type = models.CharField(max_length=20, choices=[
        ('individual', 'Individual'),
        ('team', 'Team'),
        ('open', 'Open')
    ])
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Challenge(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_challenges')
    name = models.CharField(max_length=255)
    description = models.TextField()
    goal = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    entry_type = models.CharField(max_length=20, choices=[
        ('individual', 'Individual'),
        ('team', 'Team'),
        ('open', 'Open')
    ])
    template = models.ForeignKey(ChallengeTemplate, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Team(models.Model):
    name = models.CharField(max_length=255, unique=True)
    members = models.ManyToManyField(User, related_name='teams')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ChallengeParticipation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name='participants')
    team = models.ForeignKey(Team, null=True, blank=True, on_delete=models.SET_NULL)

    progress = models.FloatField(default=0.0)
    status = models.CharField(max_length=20, choices=[
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('exited', 'Exited')
    ], default='ongoing')

    joined_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    exited_at = models.DateTimeField(null=True, blank=True)
