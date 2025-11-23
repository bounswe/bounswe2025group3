from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from apps.rewards.models import Badge, UserBadge
from apps.rewards.api.v1.serializers import UserBadgeSerializer
from apps.waste.models import WasteLog


class MyBadgesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Ensure badges exist (safe)
        first_step, _ = Badge.objects.get_or_create(
            code="first_step",
            defaults={"name": "First Step", "icon": ""}
        )

        plastic_buster, _ = Badge.objects.get_or_create(
            code="plastic_buster",
            defaults={"name": "Plastic Buster", "icon": ""}
        )

        zero_waste_legend, _ = Badge.objects.get_or_create(
            code="zero_waste_legend",
            defaults={"name": "Zero Waste Legend", "icon": ""}
        )

        # 1️⃣ FIRST STEP → first ever log
        if WasteLog.objects.filter(user=user).exists():
            UserBadge.objects.get_or_create(user=user, badge=first_step)

        # 2️⃣ PLASTIC BUSTER → 10+ units of plastic recycled
        plastic_logs = WasteLog.objects.filter(
            user=user,
            sub_category__name__icontains="plastic"
        ).values_list("quantity", flat=True)

        total_plastic = sum([q for q in plastic_logs if q is not None])

        if total_plastic >= 10:
            UserBadge.objects.get_or_create(user=user, badge=plastic_buster)

        # 3️⃣ ZERO WASTE LEGEND → user.total_score >= 5000
        if user.total_score >= 5000:
            UserBadge.objects.get_or_create(user=user, badge=zero_waste_legend)

        # Return earned badges
        earned = UserBadge.objects.filter(user=user)
        return Response(UserBadgeSerializer(earned, many=True).data)


