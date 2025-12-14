from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.rewards.models import Badge
from apps.rewards.api.v1.serializers import BadgeGallerySerializer
from django.db import models
from django.db.models.functions import TruncDate
from apps.waste.models import WasteLog

class BadgesView(APIView):
    permission_classes = [IsAuthenticated]


    def get(self, request):
        user = request.user

        logs = self.get_logs(user)
        daily_stats = self.get_daily_stats(user)
        score = self.get_score(user)

        calculated = {
            b["id"]: b["earned"]
            for b in self.calculate_badges(logs, daily_stats, score)
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

    def calculate_badges(self, logs, daily_stats, score):
        def count_quantity(keyword):
            return sum(
                float(l.get("quantity", 0))
                for l in logs
                if keyword in (l.get("sub_category_name") or "").lower()
            )

        def count_items(keyword, field="sub_category_name"):
            return len([
                l for l in logs
                if keyword in (l.get(field) or "").lower()
            ])

        return [
            {
                "id": "first_step",
                "earned": len(logs) > 0
            },
            {
                "id": "plastic_buster",
                "earned": count_quantity("plastic") >= 10
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
                "earned": len(logs) >= 50
            },
            {
                "id": "tree_hugger",
                "earned": score >= 1000
            },
            {
                "id": "recycling_master",
                "earned": count_items("recycled", "disposal_location") >= 30
            },
            {
                "id": "compost_champion",
                "earned": count_items("compost", "disposal_location") >= 20
            },
            {
                "id": "milestone_100",
                "earned": len(logs) >= 100
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
                "earned": count_items("metal") >= 15
            },
            {
                "id": "paper_pride",
                "earned": count_items("paper") >= 25
            },
            {
                "id": "glass_guru",
                "earned": count_items("glass") >= 10
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
                "earned": len(logs) >= 200
            },
            {
                "id": "logs_500",
                "earned": len(logs) >= 500
            },
            {
                "id": "streak_60",
                "earned": len(daily_stats) >= 60
            },
            {
                "id": "plastic_50",
                "earned": count_quantity("plastic") >= 50
            },
            {
                "id": "organic_50",
                "earned": count_items("organic") + count_items("food") >= 50
            },
            {
                "id": "electronic_20",
                "earned": count_items("electronic") + count_items("e-waste") >= 20
            },
            {
                "id": "textile_30",
                "earned": count_items("textile") + count_items("cloth") >= 30
            },
            {
                "id": "donate_50",
                "earned": count_items("donated", "disposal_location") +
                          count_items("reused", "disposal_location") >= 50
            },
            {
                "id": "landfill_zero",
                "earned": (
                    count_items("landfill", "disposal_location") == 0
                    and len(logs) > 0
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