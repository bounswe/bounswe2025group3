import pytest
from apps.waste.models import WasteLog
from apps.waste.tests.factories import UserFactory, SubCategoryFactory, WasteLogFactory

@pytest.mark.django_db
class TestTotalWasteCalculation:
    
    def test_total_waste_calculation_for_user(self):
        """Test that the total waste quantity for a user is calculated correctly."""
        user = UserFactory()
        subcategory1 = SubCategoryFactory()
        subcategory2 = SubCategoryFactory()

        # Create waste logs for the user
        WasteLogFactory(user=user, sub_category=subcategory1, quantity=2.5)
        WasteLogFactory(user=user, sub_category=subcategory1, quantity=3.0)
        WasteLogFactory(user=user, sub_category=subcategory2, quantity=1.5)

        # Calculate total waste quantity
        total_waste = WasteLog.objects.filter(user=user).aggregate(total_quantity=sum([log.quantity for log in WasteLog.objects.filter(user=user)]))["total_quantity"]

        # Expected total is 2.5 + 3.0 + 1.5 = 7.0
        assert total_waste == 7.0