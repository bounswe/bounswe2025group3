# API Integration

## Overview
The frontend communicates with a backend API at `http://127.0.0.1:8000/api/` using Axios, configured in `src/services/api.js`.

## Configuration
- **Base URL**: `http://127.0.0.1:8000/api/`.
- **Interceptors**: Automatically add `Authorization: Bearer <token>` to requests if `access_token` is in localStorage.

## Key API Endpoints
- **Authentication**:
  - `POST /api/token/`: Login (returns access/refresh tokens).
  - `POST /api/auth/register/`: Signup.
  - `POST /api/auth/password_reset/`: Request password reset.
  - `POST /api/auth/password_reset_confirm/:uid/:token/`: Confirm password reset.
- **Waste Management**:
  - `GET /v1/waste/logs/`: Fetch user waste logs.
  - `POST /v1/waste/logs/`: Add a waste log.
  - `GET /v1/waste/subcategories/`: Fetch waste subcategories.
  - `GET /v1/waste/scores/me/`: Fetch user eco-score.
- **User Profile**:
  - `GET /user/me/`: Fetch user profile.
  - `PATCH /user/me/`: Update user profile.

## Usage in Components
- **WasteLog.js**:
  - Fetches logs and subcategories with `getWasteLogs` and `getSubCategories`.
  - Submits new logs with `addWasteLog`.
- **Dashboard.js**:
  - Fetches eco-score with `getUserScore`.
- **Profile.js**:
  - Fetches and updates profile with `getUserProfile` and `updateUserProfile`.

## Error Handling
- Components catch API errors and display user-friendly messages.
- Common errors: 401 (Unauthorized), 400 (Bad Request), 500 (Server Error).

## Authentication Flow
1. User logs in, tokens are stored in localStorage.
2. Axios interceptor adds token to subsequent requests.
3. On 401 errors, users are redirected to `/login`.