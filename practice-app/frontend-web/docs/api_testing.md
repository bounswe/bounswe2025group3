# API Testing Report

## Environment
- Tool: Postman
- Backend URL: http://127.0.0.1:8000/
- Authentication: JWT via /api/token/

## Test Cases

### 1. Obtain JWT Token
- Endpoint: POST /api/token/
- Request Body:
  ```json
  {
      "email": "admin@example.com",
      "password": "adminpass"
  }

- Response: 200 OK

- Sample Response:

  ```{
    "refresh": "<refresh-token>",
    "access": "<access-token>",
    "role": "ADMIN",
    "email": "admin@example.com",
    "user_id": 1
}

### 2. List Waste Logs

- Endpoint: GET /api/v1/waste/logs/
- Authorization: Bearer <access_token>
- Response: 200 OK
- Sample Response:

  ```{
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "sub_category": 1,
            "sub_category_name": "Plastic Bottles",
            "quantity": "0.50",
            "date_logged": "2025-05-05T10:26:04.932966Z",
            "disposal_date": null,
            "disposal_location": null,
            "disposal_photo": null,
            "score": 1.0
        }
    ]
}

### 3. Create Waste Log

- Endpoint: POST /api/v1/waste/logs/
- Authorization: Bearer <access_token>
- Request Body:
  ```json
  {
      "sub_category": 1,
      "quantity": 0.5
  }
- Response: 201 Created
- Sample Response:

  ```{
    "id": 1,
    "sub_category": 1,
    "sub_category_name": "Plastic Bottles",
    "quantity": "0.50",
    "date_logged": "2025-05-05T10:26:04.932966Z",
    "disposal_date": null,
    "disposal_location": null,
    "disposal_photo": null,
    "score": 1.0
}

## Notes
- Created admin user (admin@example.com) via createsuperuser or create_test_users.py for API testing.
- Fixed CustomUserManager, create_test_users.py, and added migration for email-based authentication.
- Increased ACCESS_TOKEN_LIFETIME to 30 minutes.
- Populated database with 7 categories and 17 subcategories using create_waste_test_data.
- Ignored dj_rest_auth 7.0.1 and django-allauth deprecation warnings (to be addressed later).
- Fixed FieldError in WasteLogListCreateView by correcting date field to date_logged.
- Successfully tested GET /api/v1/waste/logs/ (initially empty, then populated) and POST /api/v1/waste/logs/.
