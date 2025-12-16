#!/usr/bin/env bash
set -o errexit

cd "$(dirname "$0")"

if [ ! -f .env.production ]; then
    echo "Error: .env.production not found"
    exit 1
fi

# GCP configuration
PROJECT_ID=cedar-dogfish-481402-h3
REGION=us-central1
SERVICE_NAME=ecochallenge-backend
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Build and push Docker image
echo "Building and pushing Docker image..."
docker build -t ${IMAGE_NAME} .
docker push ${IMAGE_NAME}

# Convert .env.production to gcloud format (comma-separated)
ENV_VARS="DJANGO_SETTINGS_MODULE=config.settings_production"
while IFS= read -r line; do
    [[ $line =~ ^#.*$ ]] && continue
    [[ -z "$line" ]] && continue
    if [[ $line =~ ^([^=]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"
        ENV_VARS="${ENV_VARS},${key}=${value}"
    fi
done < .env.production

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
    --image ${IMAGE_NAME} \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --set-env-vars "${ENV_VARS}" \
    --port 8000 \
    --command "sh" \
    --args "-c,python manage.py collectstatic --no-input && python manage.py migrate && gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2"

echo "Deployment complete!"

# https://ecochallenge-backend-377411205810.us-central1.run.app