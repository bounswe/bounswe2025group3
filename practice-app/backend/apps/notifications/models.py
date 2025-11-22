from django.db import models
from django.conf import settings
from apps.events.models import Event  # Assuming Event is accessible from apps.events.models

User = settings.AUTH_USER_MODEL


class Notification(models.Model):
    """
    Represents an actionable notification, typically tied to an Event.
    """
    # Type of content this notification relates to
    NOTIFICATION_TYPES = [
        ('EVENT_CREATED', 'New Event in Your City'),
        # Add other types here later (e.g., 'GOAL_ACHIEVED', 'CHALLENGE_COMPLETED')
    ]

    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications_received',
        verbose_name='Recipient'
    )

    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES,
        default='EVENT_CREATED'
    )

    # Generic foreign key (optional, but good practice) or specific relationship
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='notifications_sent',
        null=True,
        blank=True
    )

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Indexing on recipient and read status for fast lookup
        ordering = ['-created_at']
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'

    def __str__(self):
        return f"Notif for {self.recipient.username}: {self.get_notification_type_display()}"

# The Many-to-Many approach you suggested is best managed through the
# is_read field on this dedicated Notification model, which simplifies querying.
# We create a new Notification object for each user who should see it.