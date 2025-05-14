from django.db import connection
from django.core.management import call_command
import logging

logger = logging.getLogger(__name__)

def reset_db():
    """Reset the database by dropping all tables and recreating them."""
    try:
        with connection.cursor() as cursor:
            # Get list of all tables
            cursor.execute("""
                SELECT tablename FROM pg_tables
                WHERE schemaname = 'public'
            """)
            tables = cursor.fetchall()
            
            # Disable foreign key checks
            cursor.execute("SET CONSTRAINTS ALL DEFERRED;")
            
            # Drop each table
            for table in tables:
                table_name = table[0]
                if not table_name.startswith('django_'):  # Skip Django's internal tables
                    cursor.execute(f'DROP TABLE IF EXISTS "{table_name}" CASCADE;')
            
            # Re-enable foreign key checks
            cursor.execute("SET CONSTRAINTS ALL IMMEDIATE;")
            
        # Run migrations
        call_command('migrate')
        
        logger.info("Database reset completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"Error resetting database: {str(e)}")
        return False
