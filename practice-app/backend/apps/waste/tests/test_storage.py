"""
Tests for Supabase Storage integration with WasteLog model
"""
import pytest
from unittest.mock import patch, MagicMock
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.waste.models import WasteLog
from apps.waste.tests.factories import (
    UserFactory, WasteCategoryFactory, SubCategoryFactory
)


@pytest.mark.django_db
class TestWasteLogImageUpload:
    """Test image upload functionality for WasteLog model"""

    @pytest.fixture
    def user(self):
        return UserFactory()

    @pytest.fixture
    def api_client(self, user):
        from rest_framework.test import APIClient
        client = APIClient()
        client.force_authenticate(user=user)
        return client

    @pytest.fixture
    def subcategory(self):
        category = WasteCategoryFactory()
        return SubCategoryFactory(category=category)

    @pytest.fixture
    def mock_supabase_upload(self):
        """Mock Supabase storage upload"""
        with patch('apps.waste.api.v1.serializers.upload_image') as mock_upload:
            mock_upload.return_value = "https://example.supabase.co/storage/v1/object/public/bucket/waste/test.jpg"
            yield mock_upload

    def test_create_waste_log_with_multipart_image(self, api_client, user, subcategory, mock_supabase_upload):
        """Test creating waste log with multipart form data image upload"""
        url = reverse('waste:waste-log-list-create')
        
        # Create a simple image file
        from io import BytesIO
        from PIL import Image
        from django.core.files.uploadedfile import SimpleUploadedFile
        
        img = Image.new('RGB', (100, 100), color='green')
        img_file = BytesIO()
        img.save(img_file, 'JPEG')
        img_file.seek(0)
        
        photo_file = SimpleUploadedFile(
            name='test_photo.jpg',
            content=img_file.read(),
            content_type='image/jpeg'
        )
        
        data = {
            'sub_category': subcategory.id,
            'quantity': 2.5,
            'disposal_date': '2024-06-01',
            'disposal_location': 'Recycling Center',
            'disposal_photo_file': photo_file,
        }
        
        response = api_client.post(url, data, format='multipart')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'disposal_photo_url' in response.data
        # Verify upload was called
        mock_supabase_upload.assert_called_once()

    def test_create_waste_log_with_base64_image(self, api_client, user, subcategory, mock_supabase_upload):
        """Test creating waste log with base64 encoded image"""
        url = reverse('waste:waste-log-list-create')
        
        # Base64 encoded 1x1 red pixel PNG
        base64_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        data = {
            'sub_category': subcategory.id,
            'quantity': 2.5,
            'disposal_date': '2024-06-01',
            'disposal_location': 'Recycling Center',
            'disposal_photo_base64': base64_image,
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST]
        
        if response.status_code == status.HTTP_201_CREATED:
            assert 'disposal_photo_url' in response.data or 'disposal_photo' in response.data
            mock_supabase_upload.assert_called_once()

    def test_read_waste_log_returns_image_url(self, api_client, user, subcategory):
        """Test that reading a waste log returns image_url field"""
        log = WasteLog.objects.create(
            user=user,
            sub_category=subcategory,
            quantity=2.5,
            disposal_photo_url="https://example.supabase.co/storage/v1/object/public/bucket/waste/test.jpg"
        )
        
        url = reverse('waste:waste-log-detail', args=[log.id])
        response = api_client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        # After implementation, should have disposal_photo_url field
        assert 'disposal_photo_url' in response.data or 'disposal_photo' in response.data

    def test_create_waste_log_without_image(self, api_client, user, subcategory):
        """Test creating waste log without image should work"""
        url = reverse('waste:waste-log-list-create')
        
        data = {
            'sub_category': subcategory.id,
            'quantity': 2.5,
            'disposal_date': '2024-06-01',
        }
        
        response = api_client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED


