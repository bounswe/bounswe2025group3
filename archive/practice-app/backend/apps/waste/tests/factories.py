import factory
from django.contrib.auth import get_user_model
from apps.waste.models import WasteCategory, SubCategory, WasteLog, CustomCategoryRequest
from factory.django import DjangoModelFactory

User = get_user_model()


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    username = factory.Sequence(lambda n: f'testuser{n}')
    email = factory.LazyAttribute(lambda obj: f'{obj.username}@example.com')
    password = factory.PostGenerationMethodCall('set_password', 'password')


class WasteCategoryFactory(DjangoModelFactory):
    class Meta:
        model = WasteCategory

    name = factory.Sequence(lambda n: f'Category {n}')
    is_active = True


class SubCategoryFactory(DjangoModelFactory):
    class Meta:
        model = SubCategory

    name = factory.Sequence(lambda n: f'Subcategory {n}')
    category = factory.SubFactory(WasteCategoryFactory)
    score_per_unit = factory.Faker('pyfloat', min_value=1, max_value=10)
    unit = factory.Iterator(['kg', 'pcs', 'l'])
    is_active = True


class WasteLogFactory(DjangoModelFactory):
    class Meta:
        model = WasteLog

    user = factory.SubFactory(UserFactory)
    sub_category = factory.SubFactory(SubCategoryFactory)
    quantity = factory.Faker('pyfloat', min_value=0.1, max_value=10)
    disposal_date = factory.Faker('date_this_month')


class CustomCategoryRequestFactory(DjangoModelFactory):
    class Meta:
        model = CustomCategoryRequest

    user = factory.SubFactory(UserFactory)
    name = factory.Sequence(lambda n: f'Custom Category {n}')
    description = factory.Faker('paragraph', nb_sentences=3)
    suggested_category = factory.SubFactory(WasteCategoryFactory)
    unit = factory.Iterator(['kg', 'pcs', 'l'])
    status = 'pending' 