from django.db import models
from django.contrib.auth import get_user_model
from apps.waste.models import WasteCategory, SubCategory

User = get_user_model()


class ChallengeTemplate(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()

    goal_quantity = models.DecimalField(max_digits=6, decimal_places=2)  # e.g., 50.00
    unit = models.CharField(max_length=100, blank=True, null=True)

    # Only one of these should be set
    target_category = models.ForeignKey(WasteCategory, null=True, blank=True, on_delete=models.SET_NULL)
    target_subcategory = models.ForeignKey(SubCategory, null=True, blank=True, on_delete=models.SET_NULL)

    start_date = models.DateField()
    end_date = models.DateField()

    entry_type = models.CharField(max_length=20, choices=[
        ('individual', 'Individual'),
        ('team', 'Team'),
        ('open', 'Open')
    ])
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    def clean(self):
        """Ensure only one of category or subcategory is set."""
        from django.core.exceptions import ValidationError
        if self.target_category and self.target_subcategory:
            raise ValidationError("Only one of target_category or target_subcategory can be set.")
        if not self.target_category and not self.target_subcategory:
            raise ValidationError("You must set either target_category or target_subcategory.")



class Challenge(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_challenges')
    name = models.CharField(max_length=255)
    description = models.TextField()

    goal_quantity = models.DecimalField(max_digits=6, decimal_places=2)  # e.g., 50.00
    unit = models.CharField(max_length=100, blank=True, null=True)  # Optional (kg, items, etc.)

    # Challenge target - only one should be set
    target_category = models.ForeignKey(WasteCategory, null=True, blank=True, on_delete=models.SET_NULL)
    target_subcategory = models.ForeignKey(SubCategory, null=True, blank=True, on_delete=models.SET_NULL)

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

    def clean(self):
        """Ensure only one of category or subcategory is set."""
        from django.core.exceptions import ValidationError
        if self.target_category and self.target_subcategory:
            raise ValidationError("Only one of target_category or target_subcategory can be set.")
        if not self.target_category and not self.target_subcategory:
            raise ValidationError("You must set either target_category or target_subcategory.")


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
