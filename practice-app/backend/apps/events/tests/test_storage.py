"""
Tests for Supabase Storage integration with Event model
"""
import pytest
from unittest.mock import Mock, patch, MagicMock
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from datetime import timedelta
from django.utils import timezone
from apps.events.models import Event

User = get_user_model()


@pytest.mark.django_db
class TestEventImageUpload:
    """Test image upload functionality for Event model"""

    @pytest.fixture
    def user(self):
        return User.objects.create_user(
            email="testuser@example.com",
            username="testuser",
            password="123456"
        )

    @pytest.fixture
    def client(self, user):
        client = APIClient()
        client.force_authenticate(user=user)
        return client

    @pytest.fixture
    def mock_supabase_upload(self):
        """Mock Supabase storage upload"""
        with patch('apps.events.api.v1.serializers.upload_image') as mock_upload, \
             patch('apps.events.api.v1.serializers.upload_base64_image') as mock_base64_upload:
            mock_upload.return_value = "https://example.supabase.co/storage/v1/object/public/bucket/events/test.jpg"
            mock_base64_upload.return_value = "https://example.supabase.co/storage/v1/object/public/bucket/events/test.jpg"
            # Return both mocks as a tuple for flexibility
            yield {'upload_image': mock_upload, 'upload_base64_image': mock_base64_upload}

    def test_create_event_with_multipart_image(self, client, user, mock_supabase_upload):
        """Test creating event with multipart form data image upload"""
        url = reverse('event-list')
        
        # Create a simple image file
        from io import BytesIO
        from PIL import Image
        
        img = Image.new('RGB', (100, 100), color='red')
        img_file = BytesIO()
        img.save(img_file, 'JPEG')
        img_file.seek(0)
        
        # Create a SimpleUploadedFile for Django
        from django.core.files.uploadedfile import SimpleUploadedFile
        image_file = SimpleUploadedFile(
            name='test_image.jpg',
            content=img_file.read(),
            content_type='image/jpeg'
        )
        
        data = {
            'title': 'Test Event',
            'description': 'Test Description',
            'location': 'Test Location',
            'date': (timezone.now() + timedelta(days=1)).isoformat(),
            'image_file': image_file,
        }
        
        response = client.post(url, data, format='multipart')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'image_url' in response.data
        # Verify upload was called
        mock_supabase_upload['upload_image'].assert_called_once()

    def test_create_event_with_base64_image(self, client, user, mock_supabase_upload):
        """Test creating event with base64 encoded image"""
        url = reverse('event-list')
        
        # Base64 encoded 1x1 red pixel PNG
        base64_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        data = {
            'title': 'Test Event',
            'description': 'Test Description',
            'location': 'Test Location',
            'date': (timezone.now() + timedelta(days=1)).isoformat(),
            'image_base64': base64_image,
        }
        
        response = client.post(url, data, format='json')
        
        if response.status_code != status.HTTP_201_CREATED:
            # Debug: print the error response
            print(f"Response status: {response.status_code}")
            print(f"Response data: {response.data}")
        
        assert response.status_code == status.HTTP_201_CREATED, f"Expected 201, got {response.status_code}. Response: {response.data}"
        assert 'image_url' in response.data
        # Verify upload_base64_image was called
        mock_supabase_upload['upload_base64_image'].assert_called_once()

    def test_update_event_image(self, client, user, mock_supabase_upload):
        """Test updating event image"""
        from django.utils import timezone
        event = Event.objects.create(
            title="Test Event",
            description="Test",
            creator=user,
            date=timezone.now() + timedelta(days=1)
        )
        
        url = reverse('event-detail', args=[event.id])
        
        from io import BytesIO
        from PIL import Image
        from django.core.files.uploadedfile import SimpleUploadedFile
        
        img = Image.new('RGB', (100, 100), color='blue')
        img_file = BytesIO()
        img.save(img_file, 'JPEG')
        img_file.seek(0)
        
        image_file = SimpleUploadedFile(
            name='update_image.jpg',
            content=img_file.read(),
            content_type='image/jpeg'
        )
        
        data = {
            'title': event.title,
            'description': event.description,
            'location': event.location or '',
            'date': event.date.isoformat(),
            'image_file': image_file,
        }
        
        response = client.patch(url, data, format='multipart')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'image_url' in response.data
        mock_supabase_upload['upload_image'].assert_called_once()

    def test_read_event_returns_image_url(self, client, user):
        """Test that reading an event returns image_url field"""
        from django.utils import timezone
        event = Event.objects.create(
            title="Test Event",
            description="Test",
            creator=user,
            date=timezone.now() + timedelta(days=1),
            image_url="https://example.supabase.co/storage/v1/object/public/bucket/events/test.jpg"
        )
        
        url = reverse('event-detail', args=[event.id])
        response = client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'image_url' in response.data

    def test_create_event_without_image(self, client, user):
        """Test creating event without image should work"""
        from django.utils import timezone
        url = reverse('event-list')
        
        data = {
            'title': 'Test Event',
            'description': 'Test Description',
            'location': 'Test Location',
            'date': (timezone.now() + timedelta(days=1)).isoformat(),
        }
        
        response = client.post(url, data, format='json')
        assert response.status_code == status.HTTP_201_CREATED


