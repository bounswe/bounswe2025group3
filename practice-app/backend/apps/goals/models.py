from django.db import models
from django.conf import settings
from apps.waste.models import WasteCategory
from apps.waste.models import WasteLog  # adjust if it's elsewhere
from django.utils import timezone
from django.db.models import Sum 

class Goal(models.Model):
    GOAL_TYPE_CHOICES = [
        ('reduction', 'Reduction'),
        ('recycling', 'Recycling'),
        # add more as needed
    ]

    TIMEFRAME_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    category = models.ForeignKey(WasteCategory, on_delete=models.CASCADE)
    goal_type = models.CharField(max_length=50, choices=GOAL_TYPE_CHOICES)
    timeframe = models.CharField(max_length=20, choices=TIMEFRAME_CHOICES)
    target = models.FloatField()
    progress = models.FloatField(default=0.0)
    is_complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.category.name} ({self.goal_type})"
    

    def update_progress(self):
        today = timezone.now().date()

        if self.end_date < self.start_date:
            return

        logs = WasteLog.objects.filter(
            user=self.user,
            category=self.category,
            date__range=(self.start_date, min(today, self.end_date))
        )

        total = logs.aggregate(total=Sum('amount'))['total'] or 0
        self.progress = total

        # Update status
        if today > self.end_date:
            if self.progress >= self.target:
                self.status = 'achieved'
            else:
                self.status = 'failed'
        elif self.progress >= self.target:
            self.status = 'achieved'
        else:
            self.status = 'active'

        self.save()
    


class GoalTemplate(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(WasteCategory, on_delete=models.CASCADE, related_name="goal_templates")
    target = models.FloatField(help_text="Target value the user should aim to reach")
    timeframe = models.CharField(max_length=50, help_text="Timeframe description (e.g., 'weekly', 'monthly')")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

