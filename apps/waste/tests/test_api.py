from rest_framework.test import APITestCase, APIClient
from django.urls import reverse
from django.contrib.auth import get_user_model
from apps.waste.models import WasteCategory, SubCategory, WasteLog, CustomCategoryRequest

User = get_user_model()

class WasteAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass')
        self.client = APIClient()
        self.client.login(username='testuser', password='testpass')
        self.client.force_authenticate(user=self.user)
        self.category = WasteCategory.objects.create(name='Recyclable', is_active=True)
        self.subcategory = SubCategory.objects.create(
            name='Plastic Bottle', category=self.category, score_per_unit=2.0, unit='pcs', is_active=True
        )

    def test_list_categories(self):
        url = reverse('waste-category-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data), 1)

    def test_list_subcategories(self):
        url = reverse('subcategory-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.data), 1)

    def test_create_waste_log(self):
        url = reverse('waste-log-list-create')
        data = {
            'sub_category': self.subcategory.id,
            'quantity': 3,
            'disposal_date': '2024-06-01'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(WasteLog.objects.count(), 1)
        self.assertAlmostEqual(float(response.data['quantity']), 3.0)

    def test_create_custom_category_request(self):
        url = reverse('custom-category-request-create')
        data = {
            'name': 'Test Custom Subcategory',
            'description': 'A custom subcategory for testing.',
            'suggested_category': self.category.id,
            'unit': 'pcs'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(CustomCategoryRequest.objects.count(), 1)
        self.assertEqual(response.data['name'], 'Test Custom Subcategory') 