from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from apps.waste.models import WasteLog
from .models import Goal

@receiver(post_save, sender=WasteLog)
@receiver(post_delete, sender=WasteLog)
def update_related_goals(sender, instance, **kwargs):
    """Update goal progress when a relevant WasteLog is created or deleted."""
    # Ensure sub_category exists before proceeding
    if not instance.sub_category:
        return
        
    # Find active goals for the same user and category
    related_goals = Goal.objects.filter(
        user=instance.user,
        category=instance.sub_category, # Access category via sub_category
        is_complete=False
    )
    
    for goal in related_goals:
        goal.update_progress()


