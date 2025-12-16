from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler to ensure all API errors return JSON responses.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    # If response is None, Django caught the exception before DRF
    if response is None:
        logger.error(f"Unhandled exception: {exc}", exc_info=True)
        return Response(
            {'detail': 'An error occurred processing your request.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    return response
