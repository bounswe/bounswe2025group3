import pytest
from django.utils.timezone import now, timedelta
from rest_framework.exceptions import ValidationError
from apps.goals.api.v1.serializers import GoalSerializer
from apps.user.models import CustomUser
from apps.waste.models import WasteCategory

@pytest.mark.django_db
def test_goal_serializer_valid_data():
    # Create user
    user = CustomUser.objects.create_user(
        email="user@test.com",
        username="testuser",
        password="testpass"
    )
    # Valid category from choices
    category = WasteCategory.objects.create(name="Recyclable")

    data = {
        "user": user.id,  # ✅ we now use user.id instead of user"
        "category_id": category.id,  # ✅ we now use category_id instead of category
        "goal_type": "recycling",  # ✅ we now use goal_type instead of type
        "timeframe": "weekly",  
        "target": 15,
        "start_date": now().date(),
        "end_date": (now() + timedelta(days=20)).date(),
    }

    # Pass context with request.user
    serializer = GoalSerializer(data=data, context={"request": type('obj', (object,), {"user": user})})
    assert serializer.is_valid(), serializer.errors
    goal = serializer.save()

    assert goal.target == 15
    assert goal.progress == 0.0
    assert goal.goal_type == "recycling"
    assert goal.timeframe == "weekly"
    assert goal.category == category
    assert goal.user == user


@pytest.mark.django_db
def test_goal_serializer_invalid_date_range():
    user = CustomUser.objects.create_user(
        email="user@test.com",
        username="testuser",
        password="testpass"
    )
    category = WasteCategory.objects.create(name="Recyclable")

    data = {
        "user": user.id,
        "category_id": category.id,
        "goal_type": "reduction",
        "timeframe": "monthly",
        "target": 15,
        "start_date": (now() + timedelta(days=10)).date(),
        "end_date": now().date(),
    }

    serializer = GoalSerializer(data=data, context={"request": type('obj', (object,), {"user": user})})
    assert not serializer.is_valid()
    assert "non_field_errors" in serializer.errors
    assert serializer.errors["non_field_errors"][0] == "start_date must be earlier than end_date."
