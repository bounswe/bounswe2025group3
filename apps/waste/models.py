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
    ('Recyclable', 'Recyclable'),
    ('Organic', 'Organic'),
    ('Electronic', 'Electronic'),
    ('Glass', 'Glass'),
    ('Cooking Oil', 'Cooking Oil'),
    ('Clothing', 'Clothing'),
    ('Other', 'Other'),
]

class WasteCategory(models.Model):
    name = models.CharField(max_length=100, choices=WASTE_CATEGORY_CHOICES)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    def __str__(self):
        return self.name

class SubCategory(models.Model):
    name = models.CharField(max_length=100)
    category = models.ForeignKey(WasteCategory, on_delete=models.CASCADE)
    description = models.TextField(blank=True, null=True)
    score_per_unit = models.DecimalField(max_digits=6, decimal_places=2)
    unit = models.CharField(max_length=100, choices=UNIT_CHOICES)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.category.name})"


class WasteLog(models.Model):
    sub_category = models.ForeignKey(SubCategory, on_delete=models.SET_NULL, null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    quantity = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    date_logged = models.DateTimeField(auto_now_add=True) # when the waste was logged
    disposal_date = models.DateField(auto_now_add=False, null=True, blank=True) # when the waste was disposed

    # optional 
    disposal_location = models.CharField(max_length=100, blank=True, null=True) 
    disposal_photo = models.ImageField(upload_to='disposal_photos/', blank=True, null=True) 

    def get_score(self):
        return self.quantity * self.sub_category.score_per_unit

class CustomCategoryRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    suggested_category = models.ForeignKey(WasteCategory, on_delete=models.SET_NULL, null=True, blank=True)
    unit = models.CharField(max_length=20)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True, null=True)



class WasteSuggestion(models.Model):
    text = models.TextField()
    related_category = models.ForeignKey(WasteCategory, on_delete=models.SET_NULL, null=True, blank=True)
    related_subcategory = models.ForeignKey(SubCategory, on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.CharField(max_length=100, default='system')
    created_at = models.DateTimeField(auto_now_add=True)


class SustainableAction(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    action_type = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    date = models.DateField()
    score = models.DecimalField(max_digits=6, decimal_places=2)