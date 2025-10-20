# EcoChallenge Practice App

## Quick Start with Docker

### 1. Setup Environment Variables

Copy the sample environment files:

```bash
# Backend environment (includes database config)
cp backend/env.sample backend/.env

# Frontend environment  
cp frontend-web/env.sample frontend-web/.env
```

Edit the `.env` files with your configurations (database passwords, Google OAuth credentials, etc.)

### 2. Start All Services

```bash
docker-compose up --build
```

This will automatically:
- Start **PostgreSQL Database** on port 5432
- Run database migrations
- Create test waste categories and goal templates
- Start **Django Backend** on port 8000
- Start **React Frontend** on port 3000

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **API Documentation**: http://localhost:8000/api/docs/
- **Admin Panel**: http://localhost:8000/admin

### 4. Create Admin User

```bash
docker-compose exec backend python manage.py createsuperuser
```

### 5. Create Test Users (Optional)

```bash
docker-compose exec backend python manage.py shell < backend/create_test_users.py
```

## Development

### Stop Services

```bash
docker-compose down
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Rebuild After Changes

```bash
docker-compose up --build
```

## Project Structure

```
practice-app/
├── backend/           # Django backend
├── frontend-web/      # React frontend
├── docker-compose.yml # Docker orchestration
└── .env              # Environment variables (create from .env.sample)
```

## Environment Variables

See `.env.sample` for all available configuration options.

Required for OAuth:
- `GCP_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for Google login
- `REACT_APP_GITHUB_CLIENT_ID` for GitHub login

## Troubleshooting

### Database Connection Issues

```bash
# Reset database
docker-compose down -v
docker-compose up --build
```

### Port Already in Use

Change ports in `docker-compose.yml` if 3000 or 8000 are already taken.

