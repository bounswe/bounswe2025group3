from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from apps.waste.models import WasteLog
from .models import CustomUser

@receiver(post_save, sender=WasteLog)
@receiver(post_delete, sender=WasteLog)
def update_related_goals(sender, instance, **kwargs):

    user = instance.user
  
    user_logs = WasteLog.objects.filter(user=user)
    total_score = sum(log.get_score() for log in user_logs if log.sub_category and log.quantity)
    user.total_score = total_score
    user.save()
