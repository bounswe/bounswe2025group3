from django.db import models
from django.conf import settings
from django.utils import timezone

User = settings.AUTH_USER_MODEL

class Event(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    exact_location = models.CharField(max_length=255, null=True, blank=True)
    date = models.DateTimeField()  # when the event happens
    duration = models.IntegerField(help_text="Duration in minutes", null=True, blank=True) 
    image = models.ImageField(upload_to='events/images/', blank=True, null=True)
    equipment_needed = models.TextField(null=True, blank=True)
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
