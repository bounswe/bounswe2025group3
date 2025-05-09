"""API Documentation Helper Module

This module provides common utilities and decorators for standardizing API documentation
across the EcoChallenge Platform using drf-spectacular.

Usage examples:
    from common.api_docs import waste_category_docs, waste_log_docs
    
    @waste_category_docs.list
    class MyCategoryListView(APIView):
        ...
"""

from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from functools import wraps

# Common response codes for documentation
RESPONSE_401 = {401: None}  # Unauthorized
RESPONSE_403 = {403: None}  # Forbidden
RESPONSE_404 = {404: None}  # Not Found

# Common error responses
COMMON_ERROR_RESPONSES = {**RESPONSE_401, **RESPONSE_403, **RESPONSE_404}

# Base decorator for standard API documentation
def standard_api_doc(tags, summary, description, responses=None, *args, **kwargs):
    """Standard API documentation decorator with consistent format"""
    responses = responses or {}
    
    def decorator(view_func):
        return extend_schema(
            tags=tags if isinstance(tags, list) else [tags],
            summary=summary,
            description=description,
            responses=responses,
            *args, **kwargs
        )(view_func)
    return decorator

# Common date range filter parameters
def date_range_parameters():
    return [
        OpenApiParameter(
            name='date_from',
            type=OpenApiTypes.DATE,
            location=OpenApiParameter.QUERY,
            description='Filter items after this date (format: YYYY-MM-DD)',
            required=False
        ),
        OpenApiParameter(
            name='date_to',
            type=OpenApiTypes.DATE,
            location=OpenApiParameter.QUERY,
            description='Filter items before this date (format: YYYY-MM-DD)',
            required=False
        )
    ]

# Authentication API documentation helpers
class auth_docs:
    """Authentication API documentation helpers"""
    @staticmethod
    def login(view_func):
        return standard_api_doc(
            tags=['Authentication'],
            summary='User Login',
            description='Authenticate a user with email/password and receive JWT tokens',
            responses={
                200: OpenApiTypes.OBJECT,
                400: OpenApiTypes.OBJECT,  # Bad request
                401: OpenApiTypes.OBJECT,  # Unauthorized
            },
            examples=[
                OpenApiExample(
                    'Login Request',
                    value={'email': 'user@example.com', 'password': 'secure_password'},
                    request_only=True,
                )
            ]
        )(view_func)
    
    @staticmethod
    def register(view_func):
        return standard_api_doc(
            tags=['Authentication'],
            summary='User Registration',
            description='Register a new user account',
            responses={
                201: OpenApiTypes.OBJECT,  # Created
                400: OpenApiTypes.OBJECT,  # Bad request - validation errors
            },
            examples=[
                OpenApiExample(
                    'Registration Request',
                    value={
                        'email': 'newuser@example.com',
                        'password1': 'secure_password',
                        'password2': 'secure_password',
                    },
                    request_only=True,
                )
            ]
        )(view_func)

    @staticmethod
    def logout(view_func):
        return standard_api_doc(
            tags=['Authentication'],
            summary='User Logout',
            description='Invalidate refresh token and log the user out',
            responses={
                200: None,  # Success
                401: None,  # Unauthorized
            }
        )(view_func)

# Waste Category documentation helpers
class waste_category_docs:
    """Waste Category API documentation helpers"""
    @staticmethod
    def list(view_func):
        return standard_api_doc(
            tags=['Waste Categories'],
            summary='List waste categories',
            description='Returns a list of all active waste categories available in the system'
        )(view_func)
    
    @staticmethod
    def retrieve(view_func):
        return standard_api_doc(
            tags=['Waste Categories'],
            summary='Get waste category details',
            description='Returns detailed information about a specific waste category',
            responses={**RESPONSE_404}
        )(view_func)

# Waste Log documentation helpers
class waste_log_docs:
    """Waste Log API documentation helpers"""
    @staticmethod
    def list(view_func):
        return standard_api_doc(
            tags=['Waste Logs'],
            summary='List waste logs',
            description='Returns a list of all waste logs created by the current user',
            parameters=date_range_parameters()
        )(view_func)
    
    @staticmethod
    def create(view_func):
        return standard_api_doc(
            tags=['Waste Logs'],
            summary='Create waste log',
            description='Create a new waste log entry and calculate environmental impact score',
            responses={201: None},
            examples=[
                OpenApiExample(
                    'Waste Log Creation',
                    value={
                        'subcategory': 1,
                        'quantity': 2.5,
                        'disposal_method': 'recycled',
                        'notes': 'Plastic bottles from lunch'
                    },
                    request_only=True,
                )
            ]
        )(view_func)
