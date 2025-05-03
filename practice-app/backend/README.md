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
*   **Frontend:** (React - located in `front/` directory - *confirm details if needed*)

## Project Structure

*   **`apps/`**: Contains individual Django applications (authentication, user, waste, challenges, etc.) following best practices.
*   **`config/`**: Project-level configuration files (settings, main URLs).
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

5.  **(Optional) Create a superuser:**
    ```bash
    python manage.py createsuperuser
    ```

6.  **Run the development server:**
    ```bash
    python manage.py runserver
    ```
    The backend API will be available at `http://127.0.0.1:8000/`.

## Running Tests

To run the automated tests for a specific app (e.g., authentication):

```bash
python manage.py test apps.authentication.tests