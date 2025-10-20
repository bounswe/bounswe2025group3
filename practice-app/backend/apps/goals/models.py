from django.db import models
from django.conf import settings
from apps.waste.models import SubCategory
from apps.waste.models import WasteLog
from django.utils import timezone
from django.db.models import Sum
import sys
from datetime import datetime, timedelta
from django.utils import timezone

class Goal(models.Model):

    TIMEFRAME_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    category = models.ForeignKey(SubCategory, on_delete=models.CASCADE)
    timeframe = models.CharField(max_length=20, choices=TIMEFRAME_CHOICES)
    target = models.FloatField()
    progress = models.FloatField(default=0.0)
    is_complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='active', help_text="Status of the goal (e.g., active, achieved, failed)")
    start_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.category.name}"

    def get_timeframe_dates(self):
        """Helper function to determine the start and end datetimes based on the timeframe."""
        s_datetime = self.created_at  # already timezone-aware datetime

        if self.timeframe == 'daily':
            e_datetime = s_datetime + timedelta(days=1)
        elif self.timeframe == 'weekly':
            e_datetime = s_datetime + timedelta(days=7)
        elif self.timeframe == 'monthly':
            # Find first day of next month
            next_month = (s_datetime.replace(day=1) + timedelta(days=32)).replace(day=1)
            e_datetime = next_month
        else:
            return None, None

        return s_datetime, e_datetime

    def calculate_current_progress(self):
        """Calculates and returns the current progress without saving the model."""
        now = timezone.now()
        effective_start, effective_end = self.get_timeframe_dates()

        if not effective_start or not effective_end:
            return 0.0

        # Ensure we don't include logs from the future
        query_end = min(now, effective_end)

        # ✅ Correct datetime range filtering
        logs_query = WasteLog.objects.filter(
            user=self.user,
            sub_category_id=self.category_id,
            date_logged__gte=effective_start,
            date_logged__lte=query_end
        )

        # --- DEBUGGING ---
        # print(f"--- Goal Progress Debug ---", file=sys.stderr)
        # print(f"Goal ID: {self.id}, User: {self.user.id}, Cat: {self.category_id}", file=sys.stderr)
        # print(f"Timeframe: {self.timeframe}, Start: {effective_start}, End: {query_end}", file=sys.stderr)
        # print(f"Found {logs_query.count()} logs", file=sys.stderr)
        # print(f"---------------------------", file=sys.stderr)

        total = logs_query.aggregate(total=Sum('quantity'))['total'] or 0.0
        return total

    def update_progress(self):
        """Updates the goal's progress, completion, and status fields in the database."""
        now = timezone.now()
        self.progress = self.calculate_current_progress()
        
        _, effective_end_date = self.get_timeframe_dates()

        if self.progress >= self.target:
            self.is_complete = True
            self.status = 'achieved'
        else:
            self.is_complete = False
            # Check if the timeframe has passed without achieving the goal
            if effective_end_date and now > effective_end_date:
                self.status = 'failed'
            else:
                self.status = 'active'

        self.save(update_fields=['progress', 'is_complete', 'status'])


class GoalTemplate(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(SubCategory, on_delete=models.CASCADE, related_name="goal_templates")
    target = models.FloatField(help_text="Target value the user should aim to reach")
    timeframe = models.CharField(max_length=50, help_text="Timeframe description (e.g., 'weekly', 'monthly')")
    created_at = models.DateTimeField(auto_now_add=True)
    start_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name