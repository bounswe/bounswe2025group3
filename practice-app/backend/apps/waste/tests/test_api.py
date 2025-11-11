import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta
from apps.waste.models import (
    WasteCategory, SubCategory, WasteLog,
    CustomCategoryRequest, WasteSuggestion, SustainableAction
)
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(username='user1', password='pass123')


@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(username='admin', password='admin123')


@pytest.fixture
def auth_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def admin_client(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    return api_client


@pytest.fixture
def waste_category(db):
    return WasteCategory.objects.create(name='Recyclable', description='Recyclable waste')


@pytest.fixture
def sub_category(waste_category):
    return SubCategory.objects.create(
        name='Plastic Bottle',
        category=waste_category,
        description='PET bottle',
        score_per_unit=1.5,
        unit='pcs'
    )


class BaseAPITest:
    """Helper mixin for safely extracting data from paginated/non-paginated responses."""
    def _get_data(self, response):
        return response.data.get('results', response.data)


@pytest.mark.django_db
class TestWasteCategoryAPI(BaseAPITest):
    def test_list_categories(self, api_client, waste_category):
        url = reverse('waste:waste-category-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        data = self._get_data(response)
        assert data[0]['name'] == 'Recyclable'

    def test_retrieve_category(self, api_client, waste_category):
        url = reverse('waste:waste-category-detail', args=[waste_category.id])
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'Recyclable'


@pytest.mark.django_db
class TestSubCategoryAPI(BaseAPITest):
    def test_list_subcategories(self, api_client, sub_category):
        url = reverse('waste:subcategory-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        data = self._get_data(response)
        assert data[0]['name'] == 'Plastic Bottle'

    def test_retrieve_subcategory(self, api_client, sub_category):
        url = reverse('waste:subcategory-detail', args=[sub_category.id])
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['category'] == sub_category.category.id


@pytest.mark.django_db
class TestWasteLogAPI(BaseAPITest):
    def test_create_waste_log(self, auth_client, user, sub_category):
        url = reverse('waste:waste-log-list-create')
        payload = {
            'sub_category': sub_category.id,
            'quantity': 2,
            'disposal_date': str(date.today()),
        }
        response = auth_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        log = WasteLog.objects.get(user=user)
        assert log.quantity == 2

    def test_list_waste_logs(self, auth_client, user, sub_category):
        WasteLog.objects.create(user=user, sub_category=sub_category, quantity=3)
        url = reverse('waste:waste-log-list-create')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        data = self._get_data(response)
        assert len(data) == 1

    def test_disallow_future_disposal_date(self, auth_client, sub_category):
        url = reverse('waste:waste-log-list-create')
        future_date = date.today() + timedelta(days=3)
        payload = {'sub_category': sub_category.id, 'quantity': 1, 'disposal_date': str(future_date)}
        response = auth_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
class TestCustomCategoryRequestAPI(BaseAPITest):
    def test_create_custom_category_request(self, auth_client):
        url = reverse('waste:custom-category-request-create')
        payload = {
            'name': 'Metal cans',
            'description': 'Request to add metal recycling',
            'unit': 'pcs'
        }
        response = auth_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert CustomCategoryRequest.objects.count() == 1

    def test_admin_list_requests(self, admin_client):
        CustomCategoryRequest.objects.create(
            user=User.objects.create(username='req_user'),
            name='Test',
            description='Desc',
            unit='pcs'
        )
        url = reverse('waste:waste_admin:admin-custom-category-request-list')
        response = admin_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        data = self._get_data(response)
        assert len(data) == 1



@pytest.mark.django_db
class TestWasteSuggestionAPI(BaseAPITest):
    def test_list_waste_suggestions(self, api_client):
        WasteSuggestion.objects.create(text='Recycle bottles')
        url = reverse('waste:waste-suggestion-list')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        data = self._get_data(response)
        assert data[0]['text'] == 'Recycle bottles'


@pytest.mark.django_db
class TestSustainableActionAPI(BaseAPITest):
    def test_create_sustainable_action(self, auth_client, user):
        url = reverse('waste:sustainable-action-list-create')
        payload = {
            'action_type': 'Biking',
            'description': 'Biked instead of using car',
            'date': str(date.today()),
            'score': 5
        }
        response = auth_client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert SustainableAction.objects.filter(user=user).count() == 1


@pytest.mark.django_db
class TestUserStatsAPI(BaseAPITest):
    def test_user_score(self, auth_client, user):
        user.total_score = 42
        user.save()
        url = reverse('waste:user-waste-score')
        response = auth_client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['total_score'] == 42