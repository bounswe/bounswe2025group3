from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Recommendation

# Create your tests here.

class RecommendationModelTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username='testuser', password='pass')
        self.rec = Recommendation.objects.create(
            title='New Carbon Reduction Recommendation',
            description='Reduce your carbon footprint by 50%',
            category='waste_reduction',
            created_by=self.user
        )

    def test_str(self):
        self.assertEqual(str(self.rec), 'New Carbon Reduction Recommendation')

    def test_category_choices(self):
        self.assertEqual(self.rec.category, 'waste_reduction')
