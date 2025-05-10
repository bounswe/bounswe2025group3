from django.core.management.base import BaseCommand
from django.db import IntegrityError
from apps.goals.models import GoalTemplate
from apps.waste.models import WasteCategory

class Command(BaseCommand):
    help = 'Create test goal templates for development and testing.'

    def handle(self, *args, **kwargs):
        templates_to_create = [
            {
                "name": "Reduce Plastic Waste - Monthly",
                "description": "Keep your plastic waste under 2kg this month.",
                "category_name": "Organic",
                "target": 2.0,
                "timeframe": "monthly"
            },
            {
                "name": "Cut Food Waste - Weekly",
                "description": "Limit food waste to less than 1kg per week.",
                "category_name": "Glass",
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
                self.stdout.write(self.style.WARNING(
                    f"⚠️ WasteCategory '{category_name}' not found. Skipping template '{name}'."
                ))
                continue

            if GoalTemplate.objects.filter(name=name).exists():
                self.stdout.write(f"GoalTemplate '{name}' already exists. Skipping.")
                continue

            try:
                GoalTemplate.objects.create(
                    name=name,
                    description=template_data["description"],
                    category=category,
                    target=template_data["target"],
                    timeframe=template_data["timeframe"]
                )
                self.stdout.write(self.style.SUCCESS(
                    f"✅ GoalTemplate '{name}' created successfully."
                ))
            except IntegrityError as e:
                self.stdout.write(self.style.ERROR(
                    f"❌ Error creating GoalTemplate '{name}': {e}"
                ))
            except Exception as e:
                self.stdout.write(self.style.ERROR(
                    f"❌ Unexpected error for template '{name}': {e}"
                ))

        self.stdout.write(self.style.SUCCESS("\n🏁 Goal template creation process finished."))
