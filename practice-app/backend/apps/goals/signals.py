from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.waste.models import WasteLog
from .models import Goal

@receiver(post_save, sender=WasteLog)
def update_related_goals(sender, instance, **kwargs):
    active_goals = Goal.objects.filter(
        user=instance.user,
        category=instance.category,
        status='active',
        start_date__lte=instance.date,
        end_date__gte=instance.date
    )

    for goal in active_goals:
        goal.update_progress()
