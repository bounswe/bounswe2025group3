"""
Supabase Storage utility for handling image uploads
"""
import base64
import mimetypes
import uuid
import logging
from typing import Optional, Union, BinaryIO
from django.conf import settings
from supabase import create_client, Client

logger = logging.getLogger(__name__)


def get_supabase_client() -> Client:
    """
    Get or create Supabase client instance
    """
    supabase_url = getattr(settings, 'SUPABASE_URL', None)
    supabase_key = getattr(settings, 'SUPABASE_SERVICE_KEY', None)
    
    logger.info(f"Supabase URL: {supabase_url}")
    logger.info(f"Supabase Service Key configured: {bool(supabase_key)}")
    
    if not supabase_url or not supabase_key:
        logger.error("Supabase credentials not configured!")
        raise ValueError(
            "Supabase credentials not configured. "
            "Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in settings."
        )
    
    # Create client with service role key for server-side operations
    return create_client(supabase_url, supabase_key)


def upload_image(
    file_content: Union[BinaryIO, bytes],
    folder_path: str,
    filename: Optional[str] = None,
    content_type: Optional[str] = None,
    upsert: bool = False
) -> str:
    """
    Upload an image file to Supabase Storage
    
    Args:
        file_content: File-like object or bytes containing image data
        folder_path: Folder path within bucket (e.g., 'events', 'waste', 'profiles')
        filename: Optional filename. If not provided, generates UUID-based filename
        content_type: MIME type (e.g., 'image/jpeg'). Auto-detected if not provided
        upsert: Whether to overwrite existing file
    
    Returns:
        Public URL of uploaded image
    
    Raises:
        ValueError: If Supabase is not configured or upload fails
    """
    supabase = get_supabase_client()
    bucket_name = getattr(settings, 'SUPABASE_STORAGE_BUCKET', 'images')
    
    # Generate filename if not provided
    if not filename:
        # Try to detect extension from content_type
        ext = 'jpg'  # default
        if content_type:
            ext = mimetypes.guess_extension(content_type) or 'jpg'
            ext = ext.lstrip('.')
        filename = f"{uuid.uuid4()}.{ext}"
    
    # Construct full path
    file_path = f"{folder_path}/{filename}"
    
    # Ensure file_content is bytes
    if hasattr(file_content, 'read'):
        file_bytes = file_content.read()
    else:
        file_bytes = file_content
    
    # Detect content type if not provided
    if not content_type:
        content_type = mimetypes.guess_type(filename)[0] or 'image/jpeg'
    
    # Upload to Supabase
    try:
        logger.info(f"Uploading to bucket '{bucket_name}' at path '{file_path}'")
        logger.info(f"Content type: {content_type}, Size: {len(file_bytes)} bytes")
        
        file_options = {
            "content-type": content_type,
            "upsert": "true" if upsert else "false",
            "cache-control": "3600",
        }
        
        response = (
            supabase.storage
            .from_(bucket_name)
            .upload(
                path=file_path,
                file=file_bytes,
                file_options=file_options
            )
        )
        
        logger.info(f"Upload response: {response}")
        
        # Get public URL
        public_url = (
            supabase.storage
            .from_(bucket_name)
            .get_public_url(file_path)
        )
        
        logger.info(f"Public URL generated: {public_url}")
        return public_url
        
    except Exception as e:
        logger.error(f"Upload failed: {str(e)}")
        logger.error(f"Error type: {type(e).__name__}")
        raise ValueError(f"Failed to upload image to Supabase: {str(e)}")


def upload_base64_image(
    base64_string: str,
    folder_path: str,
    filename: Optional[str] = None,
    upsert: bool = False
) -> str:
    """
    Upload a base64 encoded image to Supabase Storage
    
    Args:
        base64_string: Base64 encoded image string (with or without data URI prefix)
        folder_path: Folder path within bucket (e.g., 'events', 'waste', 'profiles')
        filename: Optional filename. If not provided, generates UUID-based filename
        upsert: Whether to overwrite existing file
    
    Returns:
        Public URL of uploaded image
    
    Raises:
        ValueError: If base64 string is invalid or upload fails
    """
    # Handle data URI format: data:image/png;base64,<base64_data>
    if ',' in base64_string:
        header, base64_data = base64_string.split(',', 1)
        # Extract content type from header
        content_type = None
        if 'data:' in header and ';' in header:
            content_type = header.split(';')[0].split(':')[1]
    else:
        base64_data = base64_string
        content_type = None
    
    # Decode base64
    try:
        image_bytes = base64.b64decode(base64_data)
    except Exception as e:
        raise ValueError(f"Invalid base64 string: {str(e)}")
    
    # Determine file extension from content type
    if content_type:
        ext = mimetypes.guess_extension(content_type) or 'jpg'
        ext = ext.lstrip('.')
    else:
        ext = 'jpg'  # default
    
    # Generate filename if not provided
    if not filename:
        filename = f"{uuid.uuid4()}.{ext}"
    elif not filename.endswith(f'.{ext}'):
        filename = f"{filename}.{ext}"
    
    # Upload using bytes
    return upload_image(
        file_content=image_bytes,
        folder_path=folder_path,
        filename=filename,
        content_type=content_type or 'image/jpeg',
        upsert=upsert
    )


def delete_image(file_path: str) -> bool:
    """
    Delete an image from Supabase Storage
    
    Args:
        file_path: Full path to file in bucket (e.g., 'events/uuid.jpg')
    
    Returns:
        True if deletion was successful, False otherwise
    """
    try:
        supabase = get_supabase_client()
        bucket_name = getattr(settings, 'SUPABASE_STORAGE_BUCKET', 'images')
        
        supabase.storage.from_(bucket_name).remove([file_path])
        return True
    except Exception:
        return False


def extract_path_from_url(public_url: str) -> Optional[str]:
    """
    Extract storage path from Supabase public URL for deletion
    
    Args:
        public_url: Full Supabase public URL 
            (e.g., 'https://xxx.supabase.co/storage/v1/object/public/images/events/abc.jpg')
    
    Returns:
        Storage path (e.g., 'events/abc.jpg') or None if URL is invalid
    """
    if not public_url:
        return None
    
    bucket_name = getattr(settings, 'SUPABASE_STORAGE_BUCKET', 'images')
    pattern = f'/public/{bucket_name}/'
    
    if pattern in public_url:
        return public_url.split(pattern)[1]
    return None