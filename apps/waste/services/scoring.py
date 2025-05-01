from datetime import timedelta
from django.utils import timezone
from .models import WasteLog
from django.db.models import Sum


## I am leaving this commented for now. 
# # BONUS_THRESHOLDS = {
#     'plastic': {'threshold': 10, 'multiplier': 1.2},  # 20% bonus
#     # Add other categories if needed
# }

def calculate_score(quantity, category):
    base_score = quantity * category.score_per_unit

    # # Apply bonus if threshold met
    # bonus_info = BONUS_THRESHOLDS.get(category.name.lower())
    # if bonus_info and quantity >= bonus_info['threshold']:
    #     base_score *= bonus_info['multiplier']

    return round(base_score, 2)


def update_user_aggregates(user):
    today = timezone.now().date()
    week_start = today - timedelta(days=today.weekday())  # Monday

    # Daily total
    daily_total = WasteLog.objects.filter(user=user, date=today).aggregate(
        total_score=Sum('computed_score')
    )['total_score'] or 0

    # Weekly total
    weekly_total = WasteLog.objects.filter(user=user, date__gte=week_start).aggregate(
        total_score=Sum('computed_score')
    )['total_score'] or 0

    return {
        'daily_score': daily_total,
        'weekly_score': weekly_total,
    }
