from django.db import migrations

def create_badges(apps, schema_editor):
    Badge = apps.get_model("rewards", "Badge")

    badges = [
        {"code": "first_step", "name": "First Step", "icon": "🎖", "description": "Log your first waste item"},
        {"code": "plastic_buster", "name": "Plastic Buster", "icon": "🥤", "description": "Reduce 10 units of plastic waste"},
        {"code": "sustainability_streak", "name": "Sustainability Streak", "icon": "🔥", "description": "Log waste for 14 days"},
        {"code": "zero_waste_legend", "name": "Zero Waste Legend", "icon": "🌍", "description": "Earn 5000 eco score"},
        {"code": "eco_warrior", "name": "Eco Warrior", "icon": "⚔️", "description": "Log 50 waste items"},
        {"code": "tree_hugger", "name": "Tree Hugger", "icon": "🌿", "description": "Earn 1000 eco score"},
        {"code": "recycling_master", "name": "Recycling Master", "icon": "♻️", "description": "Recycle 30 items"},
        {"code": "compost_champion", "name": "Compost Champion", "icon": "🌱", "description": "Compost 20 organic items"},
        {"code": "milestone_100", "name": "Century Club", "icon": "💯", "description": "Log 100 waste items"},
        {"code": "score_1500", "name": "Green Achiever", "icon": "🏆", "description": "Earn 1500 eco score"},
        {"code": "consistency_king", "name": "Consistency King", "icon": "👑", "description": "Log waste 30 days in a row"},
        {"code": "metal_maven", "name": "Metal Maven", "icon": "🔧", "description": "Recycle 15 metal items"},
        {"code": "paper_pride", "name": "Paper Pride", "icon": "📄", "description": "Recycle 25 paper items"},
        {"code": "glass_guru", "name": "Glass Guru", "icon": "🥃", "description": "Recycle 10 glass items"},
        {"code": "eco_score_500", "name": "Rising Star", "icon": "⭐", "description": "Earn 500 eco score"},
        {"code": "score_2000", "name": "Eco Champion", "icon": "🥇", "description": "Earn 2000 eco score"},
        {"code": "score_3000", "name": "Eco Master", "icon": "🥈", "description": "Earn 3000 eco score"},
        {"code": "logs_200", "name": "Waste Logger Pro", "icon": "📋", "description": "Log 200 waste items"},
        {"code": "logs_500", "name": "Waste Tracking Expert", "icon": "🎯", "description": "Log 500 waste items"},
        {"code": "streak_60", "name": "Unstoppable", "icon": "🚀", "description": "Log waste 60 days in a row"},
        {"code": "plastic_50", "name": "Plastic Warrior", "icon": "💪", "description": "Reduce 50 units of plastic"},
        {"code": "organic_50", "name": "Organic Advocate", "icon": "🍃", "description": "Log 50 organic waste items"},
        {"code": "electronic_20", "name": "E-Waste Expert", "icon": "🔌", "description": "Recycle 20 electronic items"},
        {"code": "textile_30", "name": "Fashion Friend", "icon": "👕", "description": "Recycle 30 textile items"},
        {"code": "donate_50", "name": "Donation Champion", "icon": "🎁", "description": "Donate or reuse 50 items"},
        {"code": "landfill_zero", "name": "Zero Landfill", "icon": "✨", "description": "Send 0 items to landfill"},
        {"code": "streak_7", "name": "Week Warrior", "icon": "📅", "description": "Log waste 7 days in a row"},
        {"code": "streak_21", "name": "Monthly Hero", "icon": "🎖️", "description": "Log waste 21 days in a row"},
        {"code": "event_joiner", "name": "Event Joiner", "icon": "🎖", "description": "Join your first event"},
    ]

    for badge in badges:
        Badge.objects.update_or_create(
            code=badge["code"],
            defaults={
                "name": badge["name"],
                "icon": badge["icon"],
                "description": badge["description"],
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
        "milestone_100",
        "score_1500",
        "consistency_king",
        "metal_maven",
        "paper_pride",
        "glass_guru",
        "eco_score_500",
        "score_2000",
        "score_3000",
        "logs_200",
        "logs_500",
        "streak_60",
        "plastic_50",
        "organic_50",
        "electronic_20",
        "textile_30",
        "donate_50",
        "landfill_zero",
        "streak_7",
        "streak_21",
    ]).delete()

class Migration(migrations.Migration):

    dependencies = [
        ("rewards", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_badges, reverse_badges),
    ]
