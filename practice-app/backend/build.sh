#!/usr/bin/env bash
# exit on error
set -o errexit

cd practice-app/backend

# Install Python dependencies
pip install -r requirements.txt


# Collect static files
python manage.py collectstatic --no-input

# Run migrations
python manage.py migrate

# Create test data
python create_test_users.py
python manage.py create_test_goal_templates
python manage.py create_waste_test_data
