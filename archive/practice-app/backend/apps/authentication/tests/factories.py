import factory
from factory.django import DjangoModelFactory
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import uuid

from apps.authentication.models import UserAuthToken, OAuth

User = get_user_model()


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User
        django_get_or_create = ('email',)

    username = factory.Sequence(lambda n: f'testuser{n}')
    email = factory.LazyAttribute(lambda obj: f'{obj.username}@example.com')
    # first_name and last_name are now optional, so we don't define them by default
    password = factory.PostGenerationMethodCall('set_password', 'password123')
    is_active = True
    bio = factory.Faker('paragraph', nb_sentences=2)
    city = factory.Faker('city')
    country = factory.Faker('country')


class UserAuthTokenFactory(DjangoModelFactory):
    class Meta:
        model = UserAuthToken

    token = factory.LazyFunction(lambda: str(uuid.uuid4()))
    user = factory.SubFactory(UserFactory)
    expiry = factory.LazyFunction(lambda: timezone.now() + timedelta(days=7))


class OAuthFactory(DjangoModelFactory):
    class Meta:
        model = OAuth

    user = factory.SubFactory(UserFactory)
    provider = 'google'
    provider_user_id = factory.Sequence(lambda n: f'google_user_id_{n}')
    created = factory.LazyFunction(lambda: timezone.now()) 