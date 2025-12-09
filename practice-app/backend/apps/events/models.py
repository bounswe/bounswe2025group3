from django.db import models
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django.conf import settings
from django.utils import timezone

User = settings.AUTH_USER_MODEL

class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    date = models.DateTimeField()  # when the event happens
    image_url = models.URLField(blank=True, null=True, max_length=500)  # Supabase Storage URL
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_events')
    participants = models.ManyToManyField(
        User, related_name='participated_events', blank=True
    )
    likes = models.ManyToManyField(
        User, related_name='liked_events', blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.date.date()})"

    @property
    def participants_count(self):
        return self.participants.count()

    @property
    def likes_count(self):
        return self.likes.count()


@receiver(pre_delete, sender=Event)
def delete_event_image(sender, instance, **kwargs):
    """Delete associated image from Supabase storage when event is deleted"""
    if instance.image_url:
        from common.supabase_storage import delete_image, extract_path_from_url
        path = extract_path_from_url(instance.image_url)
        if path:
            delete_image(path)
