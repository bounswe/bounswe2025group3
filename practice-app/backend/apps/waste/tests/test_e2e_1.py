import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from apps.user.models import CustomUser
from apps.waste.models import WasteCategory, SubCategory, WasteLog


@pytest.mark.django_db
def test_user_can_log_waste_and_see_daily_stats():
    client = APIClient()

    # ----------- setup user -----------
    user = CustomUser.objects.create_user(
        email="testuser@example.com",
        username="testuser",
        password="testpassword123"
    )

    client.force_authenticate(user=user)

    # ----------- setup waste taxonomy -----------
    category = WasteCategory.objects.create(
        name="Recyclable",
        description="Recyclable waste"
    )

    subcategory = SubCategory.objects.create(
        name="Plastic Bottles",
        category=category,
        score_per_unit=2.5,
        unit="pcs"
    )

    # ----------- user logs waste -----------
    WasteLog.objects.create(
        user=user,
        sub_category=subcategory,
        quantity=2,
        date_logged=timezone.now()
    )

    # ----------- call stats endpoint -----------
    url = reverse("waste:user-waste-stats")
    response = client.get(url, {"period": "daily"})

    # ----------- assertions -----------
    assert response.status_code == 200

    data = response.data
    assert data["period"] == "daily"
    assert len(data["data"]) == 7  # last 7 days

    last_day = data["data"][-1]

    assert last_day["total_log"] == 1
    assert last_day["total_score"] == 5.0  # 2 * 2.5

    # per-subcategory breakdown
    assert last_day[f"subcategory_{subcategory.id}_log"] == 1
    assert last_day[f"subcategory_{subcategory.id}_score"] == 5.0
