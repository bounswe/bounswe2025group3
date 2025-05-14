from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Recommendation(models.Model):
    CATEGORY_CHOICES = (
        ('waste_reduction', 'Waste Reduction'),
        ('energy_saving', 'Energy Saving'),
        ('eco_friendly_products', 'Eco-Friendly Products'),
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
