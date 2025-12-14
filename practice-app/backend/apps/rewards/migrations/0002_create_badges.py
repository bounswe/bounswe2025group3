from django.db import migrations

def create_badges(apps, schema_editor):
    Badge = apps.get_model("rewards", "Badge")

    badges = [
        {"code": "first_step", "name": "First Step"},
        {"code": "plastic_buster", "name": "Plastic Buster"},
        {"code": "sustainability_streak", "name": "Sustainability Streak"},
        {"code": "zero_waste_legend", "name": "Zero Waste Legend"},
        {"code": "eco_warrior", "name": "Eco Warrior"},
        {"code": "tree_hugger", "name": "Tree Hugger"},
        {"code": "recycling_master", "name": "Recycling Master"},
        {"code": "compost_champion", "name": "Compost Champion"},
        {"code": "metal_maven", "name": "Metal Maven"},
        {"code": "paper_pride", "name": "Paper Pride"},
        {"code": "glass_guru", "name": "Glass Guru"},
        {"code": "electronic_20", "name": "E-Waste Expert"},
        {"code": "organic_50", "name": "Organic Hero"},
        {"code": "donate_50", "name": "Donation Champion"},
        {"code": "landfill_zero", "name": "Landfill Zero"},
    ]

    for badge in badges:
        Badge.objects.get_or_create(
            code=badge["code"],
            defaults={
                "name": badge["name"],
                "icon": "",
                "description": "",
            },
        )

def reverse_badges(apps, schema_editor):
    Badge = apps.get_model("rewards", "Badge")
    Badge.objects.filter(code__in=[
        "first_step",
        "plastic_buster",
        "sustainability_streak",
        "zero_waste_legend",
        "eco_warrior",
        "tree_hugger",
        "recycling_master",
        "compost_champion",
        "metal_maven",
        "paper_pride",
        "glass_guru",
        "electronic_20",
        "organic_50",
        "donate_50",
        "landfill_zero",
    ]).delete()

class Migration(migrations.Migration):

    dependencies = [
        ("rewards", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_badges, reverse_badges),
    ]
