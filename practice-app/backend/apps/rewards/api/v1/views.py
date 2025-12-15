from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.rewards.models import Badge, UserBadge
from apps.rewards.api.v1.serializers import BadgeGallerySerializer
from django.db import models
from django.db.models.functions import TruncDate
from apps.waste.models import WasteLog
from apps.events.models import Event

class BadgesView(APIView):
    permission_classes = [IsAuthenticated]


    def get(self, request):
        user = request.user

        logs = self.get_logs(user)
        daily_stats = self.get_daily_stats(user)
        score = self.get_score(user)

        calculated = {
            b["id"]: b["earned"]
            for b in self.calculate_badges(logs, daily_stats, score, self.get_event_participation(user))
        }

        badges = Badge.objects.all().order_by("id")

        serializer = BadgeGallerySerializer(
            badges,
            many=True,
            context={"request": request}
        )

        data = serializer.data

        # override earned flag with calculated result
        for badge in data:
            badge["earned"] = calculated.get(badge["code"], False)

        return Response(data)

    def get_event_participation(self, user):
        """Checks if the user has participated in any event."""
        return Event.objects.filter(participants=user).exists()

    def get_logs(self, user):
        return list(
            WasteLog.objects
            .filter(user=user)
            .select_related("sub_category")
            .values(
                "quantity",
                "disposal_location",
                sub_category_name=models.F("sub_category__name"),
            )
        )

    def get_daily_stats(self, user):
        return (
            WasteLog.objects
            .filter(user=user)
            .annotate(day=TruncDate("date_logged"))
            .values("day")
            .distinct()
        )

    def get_score(self, user):
        return float(user.total_score)

    def calculate_badges(self, logs, daily_stats, score, has_participated):

        def get_logs_by_disposal_method(disposal_method):
            filtered_list = []
            for i in logs:
                if i["disposal_method"] == disposal_method:
                    filtered_list += [i]
            return filtered_list

        def count_items(keyword, field="sub_category_name", logs=logs):
            total = 0
            for log in logs:
                if log[field] is not None and log[field].lower() == keyword:
                    total += log["quantity"]
            return total
        
        def count_items_multi(keywords, field="sub_category_name", logs=logs):
            """Count items matching any of the keywords in the specified field"""
            total = 0
            for kw in keywords:
                total += count_items(kw, field, logs)
            return total

        def count_items_all():
            total = 0
            for log in logs:
                total += log["quantity"]
            return total

        def count_items_donated():
            total = 0
            for log in logs:
                if log["disposal_method"] is not None and log["disposal_method"] == "donated":
                    total += log["quantity"]
            return total

        # Count recyclable items - check category name
        recyclable_count = count_items_multi(
            ["recycl", "plastic", "paper", "glass", "metal", "cardboard", "aluminum", "can", "bottle", 
             "battery", "batteries", "electronic", "appliance", "phone", "oil", "cooking"],
            "sub_category_name"
        )
        
        # Count compost items - check category name
        compost_count = count_items_multi(
            ["organic", "food", "compost", "vegetable", "fruit", "coffee", "garden", "scrap"],
            "sub_category_name"
        )

        return [
            {
                "id": "first_step",
                "earned": len(logs) > 0
            },
            {
                "id": "event_joiner",
                "earned": has_participated
            },
            {
                "id": "plastic_buster",
                "earned": count_items("plastic bottles") >= 10
            },
            {
                "id": "sustainability_streak",
                "earned": len(daily_stats) >= 14
            },
            {
                "id": "zero_waste_legend",
                "earned": score >= 5000
            },
            {
                "id": "eco_warrior",
                "earned": count_items_all() >= 50
            },
            {
                "id": "tree_hugger",
                "earned": score >= 1000
            },
            {
                "id": "recycling_master",
                "earned": count_items("recycled", "disposal_method") >= 30
            },
            {
                "id": "compost_champion",
                "earned": count_items_multi(["food scraps", "garden waste", "coffee grounds"], logs=get_logs_by_disposal_method("composted")) >= 20
            },
            {
                "id": "milestone_100",
                "earned": count_items_all() >= 100
            },
            {
                "id": "score_1500",
                "earned": score >= 1500
            },
            {
                "id": "consistency_king",
                "earned": len(daily_stats) >= 30
            },
            {
                "id": "metal_maven",
                "earned": count_items("metal cans", logs=get_logs_by_disposal_method("recycled")) >= 15
            },
            {
                "id": "paper_pride",
                "earned": count_items("paper", logs=get_logs_by_disposal_method("recycled")) >= 25
            },
            {
                "id": "glass_guru",
                "earned": count_items_multi(["glass bottles", "broken glass"], logs=get_logs_by_disposal_method("recycled")) >= 10
            },
            {
                "id": "eco_score_500",
                "earned": score >= 500
            },
            {
                "id": "score_2000",
                "earned": score >= 2000
            },
            {
                "id": "score_3000",
                "earned": score >= 3000
            },
            {
                "id": "logs_200",
                "earned": count_items_all() >= 200
            },
            {
                "id": "logs_500",
                "earned": count_items_all() >= 500
            },
            {
                "id": "streak_60",
                "earned": len(daily_stats) >= 60
            },
            {
                "id": "plastic_50",
                "earned": count_items("plastic bottles") >= 50
            },
            {
                "id": "organic_50",
                "earned": count_items_multi(["food scraps", "garden waste", "coffee grounds"]) >= 50
            },
            {
                "id": "electronic_20",
                "earned": count_items_multi(["small appliances", "mobile phones"], logs=get_logs_by_disposal_method("recycled")) >= 20
            },
            {
                "id": "textile_30",
                "earned": count_items_multi(["used clothing", "shoes"]) >= 30
            },
            {
                "id": "donate_50",
                "earned": count_items_donated() >= 50  # Log 50 items total
            },
            {
                "id": "landfill_zero",
                "earned": (
                    # All logs are in recyclable/compostable categories
                    len(logs) > 0 and 
                    recyclable_count + compost_count >= len(logs)
                )
            },
            {
                "id": "streak_7",
                "earned": len(daily_stats) >= 7
            },
            {
                "id": "streak_21",
                "earned": len(daily_stats) >= 21
            },
        ]
    
    
class BadgeGalleryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # 1️⃣ Get earned badges for this user
        earned_user_badges = UserBadge.objects.filter(user=user).select_related("badge")
        earned_badges = [ub.badge for ub in earned_user_badges]

        earned_badge_ids = [badge.id for badge in earned_badges]

        # 2️⃣ Get locked badges (all badges user has NOT earned)
        locked_badges = Badge.objects.exclude(id__in=earned_badge_ids)

        # 3️⃣ Serialize manually (simple & explicit)
        earned_data = [
            {
                "id": badge.id,
                "name": badge.name,
                "code": badge.code,
                "icon": badge.icon,
                "description": badge.description,
                "earned": True,
            }
            for badge in earned_badges
        ]

        locked_data = [
            {
                "id": badge.id,
                "name": badge.name,
                "code": badge.code,
                "icon": badge.icon,
                "description": badge.description,
                "earned": False,
            }
            for badge in locked_badges
        ]

        return Response({
            "earned": earned_data,
            "locked": locked_data,
            "earned_count": len(earned_data),
            "total_count": len(earned_data) + len(locked_data),
        })