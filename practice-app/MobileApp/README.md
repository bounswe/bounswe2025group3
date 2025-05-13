## Project Setup and Running Instructions

### Phase 1: Get the Backend Running

1.  **Navigate to the backend directory:**
    ```bash
    cd practice-app/backend
    ```

2.  **Create and Activate a Virtual Environment:**
    *   For macOS/Linux:
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```
    *   For Windows:
        ```bash
        python -m venv venv
        .\venv\Scripts\activate
        ```
    *(Ensure `(venv)` appears in your terminal prompt.)*

3.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Apply Database Migrations:**
    ```bash
    python manage.py migrate
    ```

5.  **Create Test Data for Waste Categories:**
    ```bash
    python manage.py create_waste_test_data
    ```

6.  **(Optional) Create a Superuser:**
    ```bash
    python manage.py createsuperuser
    ```
    *(Follow the prompts.)*

7.  **Modify Django Settings for Local Network Access:**
    *   Open the file `practice-app/backend/config/settings.py`.
    *   Find the `ALLOWED_HOSTS` setting.
    *   Change it to:
        ```python
        // filepath: practice-app/backend/config/settings.py
        // ...existing code...
        ALLOWED_HOSTS = ['*']
        // ...existing code...
        ```

8.  **Run the Django Development Server:**
    ```bash
    python manage.py runserver 0.0.0.0:8000
    ```
    *(The backend API should be accessible at `http://<your-local-ip-address>:8000/` and `http://127.0.0.1:8000/`.)*

### Phase 2: Configure and Run the Mobile App

1.  **Identify Your Computer's Local IP Address:**
    *   **macOS:** `ifconfig | grep "inet " | grep -v 127.0.0.1` or System Settings > Network.
    *   **Windows:** `ipconfig` in Command Prompt (look for IPv4 Address).
    *   **Linux:** `ip addr show` or `hostname -I`.
    *(Let's assume your IP is `192.168.1.100` for the next step; replace it with your actual IP.)*

2.  **Update API Base URL in the Mobile App:**
    *   Open the file `practice-app/MobileApp/constants/api.ts`.
    *   Change `API_BASE_URL` to your computer's IP address:
        ```typescript
        // filepath: practice-app/MobileApp/constants/api.ts
        // ...existing code...
        export const API_BASE_URL = 'http://<YOUR_COMPUTER_IP_ADDRESS>:8000'; 
        // Example: export const API_BASE_URL = 'http://192.168.1.100:8000';
        // ...existing code...
        ```

3.  **Navigate to the MobileApp directory:**
    *(Open a new terminal for this, or navigate from the project root)*
    ```bash
    cd practice-app/MobileApp
    ```

4.  **Install Mobile App Dependencies:**
    ```bash
    npm install 
    ```

5.  **Run the Mobile App:**
    ```bash
    npx expo start
    ```
    *(Follow the instructions in the terminal to open the app on a device/emulator.)*

### Running with Docker (Recommended)

We've dockerized the application to make it easier to run consistently across different environments.

1. **Prerequisites:**
   * Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
   * Make sure Docker is running on your machine

2. **Run the application using Docker Compose:**
   ```bash
   # Navigate to the practice-app directory
   cd practice-app
   
   # Build and start all services
   docker compose up --build
   ```

3. **Accessing the Mobile App:**
   * When the mobile app container starts, it will display a QR code in the terminal
   * Scan this QR code with the Expo Go app on your phone
   * Alternatively, you can access the web version at http://localhost:19006

4. **Test Login Credentials:**
   * For testing in the dockerized environment, use:
     * Email: test@example.com
     * Password: password123

5. **Troubleshooting:**
   * If you need to see logs from just the mobile app:
     ```
     docker compose logs -f mobile-app
     ```
   * If you need to restart just the mobile app:
     ```
     docker compose restart mobile-app
     ```
   * If you need to run just the mobile app:
     ```
     docker compose run --service-ports mobile-app
     ```

### Summary of Terminals

*   **Terminal 1 (Backend - from `bounswe2025group3/practice-app/backend`):**
    1.  `source venv/bin/activate` (or `.\venv\Scripts\activate` on Windows)
    2.  `python manage.py runserver 0.0.0.0:8000`

*   **Terminal 2 (Mobile App - from `bounswe2025group3/practice-app/MobileApp`):**
    1.  `npm install`
    2.  `npx expo start`

*   **Using Docker (Recommended - from `bounswe2025group3/practice-app`):**
    1.  `docker compose up --build`