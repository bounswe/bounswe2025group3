import pytest
import responses
import json
from django.conf import settings
from unittest.mock import patch, MagicMock

from apps.waste.models import WasteLog
from apps.waste.tests.factories import UserFactory, SubCategoryFactory, WasteLogFactory


@pytest.mark.django_db
class TestWasteServices:
    
    @responses.activate
    def test_external_service_integration(self):
        """Test integration with a mocked external waste tracking service"""
        # Mock an external API that might track waste disposal
        responses.add(
            responses.POST,
            "https://api.example.com/waste-tracking",
            json={"status": "success", "tracking_id": "123456"},
            status=200
        )
        
        user = UserFactory()
        subcategory = SubCategoryFactory()
        waste_log = WasteLogFactory(user=user, sub_category=subcategory, quantity=5.0)
        
        # This would typically be in your service code
        import requests
        response = requests.post(
            "https://api.example.com/waste-tracking",
            json={
                "user_id": user.id,
                "waste_type": subcategory.name,
                "quantity": waste_log.quantity,
                "date": waste_log.disposal_date.isoformat()
            }
        )
        
        # Verify the request was made with correct data
        assert len(responses.calls) == 1
        request_data = json.loads(responses.calls[0].request.body)
        assert request_data["user_id"] == user.id
        assert request_data["waste_type"] == subcategory.name
        
        # Verify response handling
        assert response.status_code == 200
        assert response.json()["tracking_id"] == "123456"
    
    @patch('apps.waste.services.calculate_impact')
    def test_calculate_user_environmental_impact(self, mock_calculate):
        """Test calculating environmental impact with mocked function"""
        # Setup mock return value
        mock_calculate.return_value = {
            "co2_saved": 25.5,
            "trees_saved": 2.3,
            "water_saved_liters": 500
        }
        
        # Create test data
        user = UserFactory()
        for _ in range(3):
            WasteLogFactory(user=user)
        
        # Import here to avoid circular imports during tests
        from apps.waste.services import calculate_user_impact
        
        # Call the function that would use our mocked calculate_impact
        impact = calculate_user_impact(user.id)
        
        # Verify the mock was called once
        mock_calculate.assert_called_once()
        
        # Verify the results match our mock return
        assert impact["co2_saved"] == 25.5
        assert impact["trees_saved"] == 2.3
        assert impact["water_saved_liters"] == 500 