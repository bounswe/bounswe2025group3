import factory
from factory.django import DjangoModelFactory
from django.contrib.auth import get_user_model
import random

User = get_user_model()

class UserFactory(DjangoModelFactory):
    class Meta:
        model = User
        django_get_or_create = ('email',)

    username = factory.Sequence(lambda n: f'testuser{n}')
    email = factory.LazyAttribute(lambda obj: f'{obj.username}@example.com')
    password = factory.PostGenerationMethodCall('set_password', 'password123')
    is_active = True
    bio = factory.Faker('paragraph', nb_sentences=2)
    city = factory.Faker('city')
    country = factory.Faker('country')
    
    # Settings & Stats
    notifications_enabled = True
    total_score = factory.LazyFunction(lambda: random.randint(0, 1000))

    @factory.post_generation
    def roles(self, create, extracted, **kwargs):
        if not create:
            return
            
        # Default to USER role if none specified
        if not hasattr(self, 'role'):
            self.role = User.Role.USER 