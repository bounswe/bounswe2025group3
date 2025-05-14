#!/usr/bin/env bash
# exit on error
set -o errexit

cd practice-app/backend

# Install Python dependencies
pip install -r requirements.txt

# Create a function to check if postgres is ready
postgres_ready() {
python << END
import sys
import dj_database_url
import psycopg2
try:
    url = dj_database_url.config()
    psycopg2.connect(
        dbname=url['NAME'],
        user=url['USER'],
        password=url['PASSWORD'],
        host=url['HOST'],
        port=url['PORT'],
    )
except psycopg2.OperationalError:
    sys.exit(-1)
sys.exit(0)
END
}

# Wait until postgres is ready
until postgres_ready; do
  >&2 echo 'Waiting for PostgreSQL to become available...'
  sleep 1
done
>&2 echo 'PostgreSQL is available'

# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate
