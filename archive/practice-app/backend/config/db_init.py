from django.db import connection
from django.core.management import call_command
import logging

logger = logging.getLogger(__name__)

def reset_db():
    """Reset the database by dropping all tables and recreating them."""
    try:
        with connection.cursor() as cursor:
            # Disable triggers
            cursor.execute("SET session_replication_role = 'replica';")
            
            # Drop all tables, views, and types
            cursor.execute("""
                DO $$ DECLARE
                    r RECORD;
                BEGIN
                    -- Drop tables
                    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                    END LOOP;
                    
                    -- Drop sequences
                    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
                        EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
                    END LOOP;
                    
                    -- Drop types
                    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) LOOP
                        EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
                    END LOOP;
                END $$;
            """)
            
            # Re-enable triggers
            cursor.execute("SET session_replication_role = 'origin';")
            
            # Run migrations
            call_command('migrate', '--no-input')
            
            logger.info("Database reset completed successfully")
            return True
            
    except Exception as e:
        logger.error(f"Error resetting database: {str(e)}")
        return False
