# bounswe2025group3 - EcoChallenge Platform (CMPE352/451 Group 3)

This repository contains the source code for the CMPE352/451 Group 3 project, an EcoChallenge platform designed to promote sustainable habits through challenges, community interaction, and rewards.

## Technologies Used

*   **Backend:** Django 4.2.20, Django REST Framework (DRF)
*   **Authentication:**
    *   `djangorestframework-simplejwt` (JWT Authentication)
    *   `dj-rest-auth` (REST API endpoints for auth operations)
    *   `django-allauth` (Social authentication - Google OAuth, email handling)
*   **Database:** SQLite (development), PostgreSQL (planned for production)
*   **Other:** `django-cors-headers`, `cryptography`
*   **Frontend:** Django Templates with Bootstrap for testing, React (planned for production)

## Project Structure

*   **`apps/`**: Contains individual Django applications (authentication, user, waste, challenges, etc.) following best practices.
*   **`config/`**: Project-level configuration files (settings, main URLs).
*   **`templates/`**: Django HTML templates for frontend testing.
    *   **`auth/`**: Authentication-related templates (login, register).
    *   **`waste/`**: Waste logging and management templates.
*   **`front/`**: Contains the frontend source code (React).
*   **`requirements.txt`**: Lists Python dependencies.
*   **`manage.py`**: Django's command-line utility.
*   **`docs/`**: Contains project documentation (UML diagrams, etc.).

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd bounswe2025group3
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # Windows
    python -m venv venv
    .\venv\Scripts\activate

    # macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Apply database migrations:**
    ```bash
    python manage.py migrate
    ```

5.  **Create test data for waste categories:**
    ```bash
    python manage.py create_waste_test_data
    ```

6.  **(Optional) Create a superuser:**
    ```bash
    python manage.py createsuperuser
    ```

7.  **Run the development server:**
    ```bash
    python manage.py runserver
    ```
    The backend API will be available at `http://127.0.0.1:8000/`.

## Frontend Templates

The project includes Django templates for testing backend functionality:

1. **Authentication:**
   - Login: http://127.0.0.1:8000/login/
   - Register: http://127.0.0.1:8000/register/

2. **Waste Management:**
   - Main Dashboard: http://127.0.0.1:8000/waste/
   - Add Waste Log: http://127.0.0.1:8000/waste/add/
   - Request New Category: http://127.0.0.1:8000/waste/request-category/

3. **Placeholder Pages:**
   - Dashboard: http://127.0.0.1:8000/dashboard/
   - Goals: http://127.0.0.1:8000/goals/
   - Challenges: http://127.0.0.1:8000/challenges/
   - Leaderboard: http://127.0.0.1:8000/leaderboard/

## Running Tests

To run the automated tests for a specific app (e.g., authentication):

```bash
python manage.py test apps.authentication.tests