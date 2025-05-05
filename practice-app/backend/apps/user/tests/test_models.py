import pytest
from django.contrib.auth import get_user_model
from .factories import UserFactory

User = get_user_model()

@pytest.mark.django_db
class TestCustomUser:
    
    def test_create_user(self):
        """Test creating a user with basic attributes."""
        user = User.objects.create_user(
            username="testuser", 
            email="test@example.com",
            password="password123"
        )
        
        assert user.username == "testuser"
        assert user.email == "test@example.com"
        assert user.check_password("password123")
        assert user.is_active
        assert not user.is_staff
        assert not user.is_superuser
        # Default role should be USER
        assert user.role == User.Role.USER
    
    def test_create_superuser(self):
        """Test creating a superuser."""
        admin_user = User.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="adminpass123"
        )
        
        assert admin_user.username == "admin"
        assert admin_user.email == "admin@example.com"
        assert admin_user.check_password("adminpass123")
        assert admin_user.is_active
        assert admin_user.is_staff
        assert admin_user.is_superuser
    
    def test_user_str_method(self):
        """Test the string representation of a user."""
        user = UserFactory(email="userstr@example.com")
        assert str(user) == "userstr@example.com"
    
    def test_username_and_email_uniqueness(self):
        """Test that username and email must be unique."""
        UserFactory(username="uniqueuser", email="unique@example.com")
        
        # Try to create a user with the same username
        with pytest.raises(Exception):
            UserFactory(username="uniqueuser", email="different@example.com")
        
        # Try to create a user with the same email
        with pytest.raises(Exception):
            UserFactory(username="differentuser", email="unique@example.com")
    
    def test_user_roles(self):
        """Test setting and checking user roles."""
        # Create users with different roles
        admin_user = UserFactory(role=User.Role.ADMIN)
        moderator_user = UserFactory(role=User.Role.MODERATOR)
        regular_user = UserFactory(role=User.Role.USER)
        
        assert admin_user.role == User.Role.ADMIN
        assert moderator_user.role == User.Role.MODERATOR
        assert regular_user.role == User.Role.USER 