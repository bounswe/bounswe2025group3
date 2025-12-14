from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.rewards.models import Badge, UserBadge
from apps.rewards.api.v1.serializers import UserBadgeSerializer
from apps.waste.models import WasteLog

from apps.events.models import Event  # adjust if needed


class MyBadgesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # ---- Ensure all badges exist ----
        badges = {
            "first_step": Badge.objects.get_or_create(
                code="first_step",
                defaults={
                    "name": "First Step",
                    "icon": "🎖",
                    "description": "Log your first waste item"
                }
            )[0],

            "plastic_buster": Badge.objects.get_or_create(
                code="plastic_buster",
                defaults={
                    "name": "Plastic Buster",
                    "icon": "🥤",
                    "description": "Recycle 10 plastic items"
                }
            )[0],

            "zero_waste_legend": Badge.objects.get_or_create(
                code="zero_waste_legend",
                defaults={
                    "name": "Zero Waste Legend",
                    "icon": "🌍",
                    "description": "Reach 5000 eco score"
                }
            )[0],

            "first_event_created": Badge.objects.get_or_create(
                code="first_event_created",
                defaults={
                    "name": "Event Pioneer",
                    "icon": "🎉",
                    "description": "Create your first event"
                }
            )[0],

            "battery_hero": Badge.objects.get_or_create(
                code="battery_hero",
                defaults={
                    "name": "Battery Hero",
                    "icon": "🔋",
                    "description": "Properly recycle a battery"
                }
            )[0],
        }

        # ---- Badge Conditions ----

        # 1️⃣ First Step
        if WasteLog.objects.filter(user=user).exists():
            UserBadge.objects.get_or_create(user=user, badge=badges["first_step"])

        # 2️⃣ Plastic Buster
        total_plastic = sum(
            WasteLog.objects.filter(
                user=user,
                sub_category__name__icontains="plastic"
            ).values_list("quantity", flat=True)
        )
        if total_plastic >= 10:
            UserBadge.objects.get_or_create(user=user, badge=badges["plastic_buster"])

        # 3️⃣ Zero Waste Legend
        if user.total_score >= 5000:
            UserBadge.objects.get_or_create(user=user, badge=badges["zero_waste_legend"])

        # 4️⃣ First Event Created
        if Event.objects.filter(created_by=user).exists():
            UserBadge.objects.get_or_create(user=user, badge=badges["first_event_created"])

        # 5️⃣ Battery Hero
        if WasteLog.objects.filter(
            user=user,
            sub_category__name__icontains="battery"
        ).exists():
            UserBadge.objects.get_or_create(user=user, badge=badges["battery_hero"])

        earned = UserBadge.objects.filter(user=user)
        return Response(UserBadgeSerializer(earned, many=True).data)


class BadgeGalleryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        badges = Badge.objects.all().order_by("id")
        serializer = BadgeGallerySerializer(
            badges,
            many=True,
            context={"request": request}
        )
        return Response(serializer.data)
