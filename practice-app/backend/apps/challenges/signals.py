from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.waste.models import WasteLog
from .services import ChallengeService

# @receiver(post_save, sender=WasteLog)
# def update_challenge_progress_on_wastelog(sender, instance, created, **kwargs):
#     if not created:
#         return  # Only act on new entries

#     ChallengeService.track_progress(user=instance.user)