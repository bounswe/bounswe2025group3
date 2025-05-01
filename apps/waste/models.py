from django.db import models
from django.conf import settings

class WasteCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    score_per_kg = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return self.name

class WasteLog(models.Model):
    category = models.ForeignKey(WasteCategory, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    weight_kg = models.DecimalField(max_digits=6, decimal_places=2)
    date_logged = models.DateTimeField(auto_now_add=True)

    def get_score(self):
        return self.weight_kg * self.category.score_per_kg

# Create your models here.
