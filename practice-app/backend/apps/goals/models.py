from django.db import models
from django.conf import settings
from apps.waste.models import SubCategory
from apps.waste.models import WasteLog  # adjust if it's elsewhere
from django.utils import timezone
from django.db.models import Sum 

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
    start_date = models.DateField(null=True, blank=True, help_text="Start date for custom timeframe goals")
    status = models.CharField(max_length=20, default='active', help_text="Status of the goal (e.g., active, achieved, failed)") # Added status field

    def __str__(self):
        return f"{self.user.username} - {self.category.name}"
    

    def update_progress(self):
        today = timezone.now().date()
        
        # Determine start and end date based on timeframe or custom dates
        effective_start_date = self.start_date

        if self.timeframe == 'daily':
            effective_start_date = today
            effective_end_date = today
        elif self.timeframe == 'weekly':
            effective_start_date = today - timezone.timedelta(days=today.weekday())
            effective_end_date = effective_start_date + timezone.timedelta(days=6)
        elif self.timeframe == 'monthly':
            effective_start_date = today.replace(day=1)
            next_month = (today.replace(day=1) + timezone.timedelta(days=32)).replace(day=1)
            effective_end_date = next_month - timezone.timedelta(days=1)
        
        # Only proceed if we have a valid date range
        if not effective_start_date or not effective_end_date:
             # Maybe log a warning or handle goals without dates differently
             return 

        # Ensure dates are logical (though timeframe logic should handle this)
        if effective_end_date < effective_start_date:
            # Log error or handle invalid state
            return

        logs = WasteLog.objects.filter(
            user=self.user,
            sub_category__category=self.category, # Filter by category through sub_category
            disposal_date__range=(effective_start_date, min(today, effective_end_date))
        )

        total = logs.aggregate(total=Sum('quantity'))['total'] or 0 # Use quantity based on previous changes
        self.progress = total

        # Update completion status and overall status
        if self.progress >= self.target:
            self.is_complete = True
            self.status = 'achieved'
        else:
            self.is_complete = False
            # Check if the timeframe has passed
            if today > effective_end_date:
                self.status = 'failed'
            else:
                self.status = 'active'

        self.save(update_fields=['progress', 'is_complete', 'status']) # Save only updated fields
    


class GoalTemplate(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(SubCategory, on_delete=models.CASCADE, related_name="goal_templates")
    target = models.FloatField(help_text="Target value the user should aim to reach")
    timeframe = models.CharField(max_length=50, help_text="Timeframe description (e.g., 'weekly', 'monthly')")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

