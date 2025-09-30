# Testing Guide for Django REST API

This guide describes the testing setup for our Django REST API project and provides instructions on how to write and run tests.

## Testing Stack

We use the following tools for testing:

- **pytest** - Modern test framework with cleaner syntax than unittest
- **pytest-django** - Django integration for pytest
- **factory_boy** - Test data generation using model factories
- **pytest-factoryboy** - Integration between pytest and factory_boy
- **responses** - Mocking external HTTP requests
- **pytest-cov** - Code coverage measurement for pytest

## Running Tests

### Run all tests
```bash
python -m pytest
```

### Run tests with verbose output
```bash
python -m pytest -v
```

### Run tests for a specific app
```bash
python -m pytest apps/waste/
```

### Run tests for a specific file
```bash
python -m pytest apps/waste/tests/test_api.py
```

### Run a specific test
```bash
python -m pytest apps/waste/tests/test_api.py::TestWasteAPI::test_create_waste_log
```

### Run tests with coverage report
```bash
# Terminal coverage report
python -m pytest --cov=apps

# HTML coverage report (creates htmlcov/ directory)
python -m pytest --cov=apps --cov-report=html
```

## Test Organization

Tests are organized by app, with each app having its own `tests/` directory:

```
apps/
  waste/
    tests/
      __init__.py
      factories.py
      test_api.py
      test_services.py
```

We use the following test types:

1. **Unit Tests** - Test individual functions or classes in isolation
   - Use the `@pytest.mark.unit` decorator

2. **Integration Tests** - Test interactions between components
   - Use the `@pytest.mark.integration` decorator

3. **API Tests** - Test REST API endpoints
   - Use Django REST Framework's APIClient

## Writing Tests

### Test Fixtures

Fixtures are defined in `conftest.py` files and provide test data or objects:

- Project-wide fixtures are in the root `conftest.py`
- App-specific fixtures can be defined in the app's tests directory

```python
@pytest.fixture
def api_client(user):
    """Return an authenticated API client"""
    from rest_framework.test import APIClient
    client = APIClient()
    client.force_authenticate(user=user)
    return client
```

### Model Factories

Model factories create test instances of models:

```python
# In apps/waste/tests/factories.py
class WasteCategoryFactory(DjangoModelFactory):
    class Meta:
        model = WasteCategory

    name = factory.Sequence(lambda n: f'Category {n}')
    is_active = True
```

Usage:
```python
# Create a single instance
category = WasteCategoryFactory()

# Create multiple instances
categories = WasteCategoryFactory.create_batch(5)

# Create with specific values
category = WasteCategoryFactory(name="Recyclables", is_active=False)
```

### API Tests

Test API endpoints using Django REST Framework's APIClient:

```python
@pytest.mark.django_db
def test_create_waste_log(api_client, subcategory, user):
    url = reverse('waste-log-list-create')
    data = {
        'sub_category': subcategory.id,
        'quantity': 3,
        'disposal_date': '2024-06-01'
    }
    response = api_client.post(url, data)
    assert response.status_code == status.HTTP_201_CREATED
    assert WasteLog.objects.count() == 1
```

### Mocking External Services

Mock external HTTP services using the `responses` library:

```python
@responses.activate
def test_external_service_integration():
    # Mock an external API response
    responses.add(
        responses.POST,
        "https://api.example.com/waste-tracking",
        json={"status": "success", "tracking_id": "123456"},
        status=200
    )
    
    # Make request to the mocked endpoint
    response = requests.post("https://api.example.com/waste-tracking", json={})
    
    # Test assertions
    assert response.status_code == 200
    assert response.json()["tracking_id"] == "123456"
```

Mock internal functions using `unittest.mock`:

```python
@patch('apps.waste.services.calculate_impact')
def test_with_mocked_function(mock_calculate):
    # Set up mock return value
    mock_calculate.return_value = {"co2_saved": 25.5}
    
    # Test code that calls the mocked function
    # ...
    
    # Verify mock was called
    mock_calculate.assert_called_once()
```

## Best Practices

1. **Keep tests isolated** - Each test should run independently of others
2. **Use appropriate fixtures** - Create fixtures for reusable test setup
3. **Use factories for test data** - Avoid creating model instances directly
4. **Test edge cases** - Include tests for error conditions and edge cases
5. **Keep tests fast** - Avoid unnecessary database operations or external API calls
6. **Mock external dependencies** - Use mocking for external services and slow operations
7. **Follow AAA pattern** - Arrange, Act, Assert in your test functions 