import os
import django
from django.db import IntegrityError

# Use production settings if on Render, otherwise use default settings
if os.environ.get('RENDER'):
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings_production')
else:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.goals.models import GoalTemplate
from apps.waste.models import WasteCategory

templates_to_create = [
    {
        "name": "Reduce Plastic Waste - Monthly",
        "description": "Keep your plastic waste under 2kg this month.",
        "category_name": "Plastic",
        "target": 2.0,
        "timeframe": "monthly"
    },
    {
        "name": "Cut Food Waste - Weekly",
        "description": "Limit food waste to less than 1kg per week.",
        "category_name": "Food",
        "target": 1.0,
        "timeframe": "weekly"
    },
]

for template_data in templates_to_create:
    name = template_data["name"]
    category_name = template_data["category_name"]

    try:
        category = WasteCategory.objects.get(name=category_name)
    except WasteCategory.DoesNotExist:
        print(f"⚠️ WasteCategory '{category_name}' not found. Skipping template '{name}'.")
        continue

    if GoalTemplate.objects.filter(name=name).exists():
        print(f"GoalTemplate '{name}' already exists. Skipping.")
        continue

    try:
        GoalTemplate.objects.create(
            name=name,
            description=template_data["description"],
            category=category,
            target=template_data["target"],
            timeframe=template_data["timeframe"]
        )
        print(f"✅ GoalTemplate '{name}' created successfully.")
    except IntegrityError as e:
        print(f"❌ Error creating GoalTemplate '{name}': {e}")
    except Exception as e:
        print(f"❌ Unexpected error for template '{name}': {e}")

print("\n🏁 Goal template creation process finished.")
