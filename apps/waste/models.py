from django.db import models
from django.conf import settings


UNIT_CHOICES = [
    ('kg', 'Kilogram'),
    ('g', 'Gram'),
    ('mg', 'Milligram'),
    ('l', 'Liter'), # liquid, like waste oil
    ('ml', 'Milliliter'), 
    ('pcs', 'Piece'), # like plastic bottle or an AA battery
]

WASTE_CATEGORY_CHOICES = [
    'Recyclable',
    'Organic',
    'Electronic',
    'Glass',
    'Cooking Oil',
    'Clothing',
    'Other',
]

class WasteCategory(models.Model):
    name = models.CharField(max_length=100, choices=WASTE_CATEGORY_CHOICES)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class SubCategory(models.Model):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(WasteCategory, on_delete=models.CASCADE)
    description = models.TextField(blank=True, null=True)
    score_per_unit = models.DecimalField(max_digits=6, decimal_places=2)
    unit = models.CharField(max_length=100, choices=UNIT_CHOICES)

    def __str__(self):
        return f"{self.name} ({self.category.name})"


class WasteLog(models.Model):
    sub_category = models.ForeignKey(SubCategory, on_delete=models.SET_NULL, null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    quantity = models.DecimalField(max_digits=6, decimal_places=2)

    date_logged = models.DateTimeField(auto_now_add=True) # when the waste was logged
    disposal_date = models.DateField(auto_now_add=False) # when the waste was disposed

    # optional 
    disposal_location = models.CharField(max_length=100, blank=True, null=True) 
    disposal_photo = models.ImageField(upload_to='disposal_photos/', blank=True, null=True) 

    def get_score(self):
        return self.quantity * self.sub_category.score_per_unit


