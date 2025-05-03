from django.db import models
from apps.user.models import CustomUser

class WasteLog(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    waste_type = models.CharField(max_length=100)
    amount = models.FloatField()
    date_logged = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.waste_type} by {self.user.email}"