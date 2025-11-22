from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from apps.events.models import Event
from apps.notifications.models import Notification  # Import the new model
import unicodedata

# Get the actual User Model class
User = get_user_model()


@receiver(post_save, sender=Event)
def create_event_notifications(sender, instance, created, **kwargs):
    """
    Creates a notification for every user in the event's city
    when a new event is created.
    """
    if created:

        # Clean the event location for comparison
        event_city_clean = instance.location.lower().strip()


        # 1. Get all eligible users (exclude creator, check notification setting)
        all_potential_users = User.objects.exclude(
            pk=instance.creator.pk
        ).filter(
            notifications_enabled=True,
        ).exclude(
            city__isnull=True  # Exclude users with no city set
        ).exclude(
            city__exact=''  # Exclude users with empty city string
        )

        notifications = []
        matched_user_ids = []


        for user in all_potential_users:
            # --- ROBUST STRING CLEANUP ---
            user_city = user.city
            # Normalize Unicode characters and replace non-breaking spaces
            user_city_lower = unicodedata.normalize('NFKC', user_city).replace('\xa0', ' ').lower().strip()
            # ------------------------------

            # Check if the user's cleaned city contains the event city
            if event_city_clean in user_city_lower:
                notifications.append(
                    Notification(
                        recipient=user,
                        notification_type='EVENT_CREATED',
                        event=instance
                    )
                )
                matched_user_ids.append(user.id)

        # 3. Bulk create all notifications for performance
        if notifications:
            Notification.objects.bulk_create(notifications)