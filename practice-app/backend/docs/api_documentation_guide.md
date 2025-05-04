# EcoChallenge API Documentation Guide

## Overview

This guide explains how to document your APIs using drf-spectacular in the EcoChallenge platform. We've set up a comprehensive system for API documentation that automatically generates OpenAPI 3.0 schema from your code.

## Available Documentation Interfaces

Once the server is running, you can access the API documentation at:

- **Swagger UI**: http://127.0.0.1:8000/api/docs/
- **Raw Schema**: http://127.0.0.1:8000/api/schema/

## How to Document Your APIs

### 1. Using Helper Decorators (Recommended)

We've created a helper module in `common/api_docs.py` that provides pre-configured decorators for common API patterns.

Example:

```python
from common.api_docs import waste_category_docs

class WasteCategoryListView(generics.ListAPIView):
    queryset = WasteCategory.objects.filter(is_active=True)
    serializer_class = WasteCategorySerializer
    
    @waste_category_docs.list
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)
```

### 2. Using Standard drf-spectacular Decorators

For more complex or custom documentation needs, use drf-spectacular decorators directly:

```python
from drf_spectacular.utils import extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

@extend_schema(
    tags=['Waste Categories'],
    summary='List active waste categories',
    description='Returns a list of all active waste categories available in the system',
    responses={200: WasteCategorySerializer(many=True)}
)
class WasteCategoryListView(generics.ListAPIView):
    ...
```

### 3. Documenting Serializers

Add docstrings and help_text to your serializer fields for better documentation:

```python
class WasteLogSerializer(serializers.ModelSerializer):
    """Serializer for waste log entries with subcategory details."""
    
    subcategory_name = serializers.CharField(
        source='subcategory.name', 
        read_only=True,
        help_text='Name of the subcategory (read-only)'
    )
    
    class Meta:
        model = WasteLog
        fields = ['id', 'subcategory', 'subcategory_name', 'quantity', 'disposal_method', 'notes', 'date', 'score']
        read_only_fields = ['id', 'score', 'date', 'subcategory_name']
```

## Exporting the Schema

To export the API schema for sharing with frontend developers or other tools:

```bash
# Export as YAML (default)
python manage.py export_schema --output=schema.yaml

# Export as JSON
python manage.py export_schema --format=json --output=schema.json

# Validate during export
python manage.py export_schema --validate
```

## Best Practices

1. **Use Tags**: Group related endpoints under consistent tags
2. **Write Clear Descriptions**: Explain what each endpoint does
3. **Document Parameters**: Include descriptions for all parameters
4. **Provide Examples**: Add example requests/responses when helpful
5. **Document All Responses**: Include success and error response formats
6. **Use `help_text` in Models**: This improves the documentation of your model fields

## Testing Schema Validity

You can validate your schema during development with:

```bash
python manage.py export_schema --validate
```

## Example View Documentation

```python
@extend_schema(
    tags=['Waste Logs'],
    summary='Create waste log',
    description='Create a new waste log entry and calculate environmental impact score',
    responses={
        201: WasteLogSerializer,
        400: None,  # Bad request validation errors
        401: None,  # Unauthorized
    },
    examples=[
        OpenApiExample(
            'Sample Log Creation',
            value={
                'subcategory': 1,
                'quantity': 2.5,
                'disposal_method': 'recycled',
                'notes': 'Plastic bottles from lunch'
            },
            request_only=True,
        )
    ]
)
def post(self, request, *args, **kwargs):
    return super().post(request, *args, **kwargs)
```

## Resources

- [drf-spectacular Documentation](https://drf-spectacular.readthedocs.io/)
- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3)
