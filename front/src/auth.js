// --- Configuration ---
const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Your Django API base URL
const LOGIN_ENDPOINT = `${API_BASE_URL}/auth/login/`;
const REGISTER_ENDPOINT = `${API_BASE_URL}/auth/register/`;
const USER_PROFILE_ENDPOINT = `${API_BASE_URL}/user/me/`; // Endpoint to get logged-in user's profile
const PROTECTED_TEST_ENDPOINT = `${API_BASE_URL}/auth/test-protected/`; // Test endpoint

// --- Token Management ---
function storeTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
}

function getAccessToken() {
    return localStorage.getItem('accessToken');
}

function getRefreshToken() {
    return localStorage.getItem('refreshToken');
}

function clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
}

function isLoggedIn() {
    return !!getAccessToken(); // Simple check if access token exists
}

// --- API Call Helper ---
async function makeApiRequest(url, method = 'GET', body = null, includeAuth = false) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (includeAuth) {
        const token = getAccessToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            console.warn('Attempted to make authenticated request without token.');
            // Optional: redirect to login or handle appropriately
             window.location.href = 'login.html'; // Redirect if no token
            return null; // Prevent request if not logged in and auth required
        }
    }

    const options = {
        method: method,
        headers: headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        if (!response.ok) {
             console.error(`API Error (${response.status}):`, data);
            // You might want to handle specific errors like 401 Unauthorized (e.g., token expired -> try refresh or logout)
            if (response.status === 401 && includeAuth) {
                // Handle token expiration/invalidation - maybe try refresh token or force logout
                console.log('Token might be invalid or expired. Logging out.');
                handleLogout(); // Force logout on 401
            }
            return { error: data, status: response.status };
        }
        return { data: data, status: response.status };
    } catch (error) {
        console.error('Network or other error:', error);
        return { error: { detail: 'Network error or server unreachable.' }, status: 500 };
    }
}

// --- Event Handlers & Page Logic ---

async function handleLoginSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = ''; // Clear previous errors

    const result = await makeApiRequest(LOGIN_ENDPOINT, 'POST', { email, password });

    if (result && result.data && result.data.access) {
        storeTokens(result.data.access, result.data.refresh);
        console.log('Login successful, tokens stored.');
        window.location.href = 'dashboard.html'; // Redirect to dashboard
    } else {
        const errorDetail = result.error?.detail || 'Login failed. Please check your credentials.';
        errorMessageElement.textContent = errorDetail;
        console.error('Login failed:', result.error);
    }
}

async function handleRegisterSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = ''; // Clear previous errors

    // Basic password match validation
    if (form.password.value !== form.password2.value) {
        errorMessageElement.textContent = 'Passwords do not match.';
        return;
    }

    const registrationData = {
        email: form.email.value,
        password: form.password.value,
        password2: form.password2.value,
        first_name: form.first_name.value,
        last_name: form.last_name.value,
        bio: form.bio.value || '',
        city: form.city.value || '',
        country: form.country.value || '',
    };

    const result = await makeApiRequest(REGISTER_ENDPOINT, 'POST', registrationData);

    if (result && result.status === 201) { // Assuming 201 Created on successful registration
        console.log('Registration successful:', result.data);
        // Optionally, log the user in automatically or redirect to login
        alert('Registration successful! Please log in.');
        window.location.href = 'login.html';
    } else {
        // Display specific errors if available
        let errorMsg = 'Registration failed. Please check the form.';
        if (result.error) {
            // Combine multiple error messages if the API returns them
            errorMsg = Object.entries(result.error).map(([field, messages]) =>
                `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
            ).join('\n');
        }
        errorMessageElement.textContent = errorMsg;
        console.error('Registration failed:', result.error);
    }
}

function handleLogout() {
    clearTokens();
    console.log('Logged out, tokens cleared.');
    // Redirect to login or home page
    window.location.href = 'login.html';
}

async function fetchProtectedData() {
    const userInfoDiv = document.getElementById('user-info');
    if (!userInfoDiv) return; // Only run on pages with the user-info div

    // Try fetching from /api/user/me/ first
    let result = await makeApiRequest(USER_PROFILE_ENDPOINT, 'GET', null, true);

    // If /api/user/me/ fails (e.g., 404), try the test endpoint
    // Note: This fallback might not be ideal in production, but okay for testing.
    if (!result || result.error) {
        console.warn('/api/user/me/ failed, trying /api/auth/test-protected/');
        result = await makeApiRequest(PROTECTED_TEST_ENDPOINT, 'GET', null, true);
    }

    if (result && result.data) {
        console.log('Protected data received:', result.data);
        // Display user information - Adjust based on the actual response structure
        userInfoDiv.innerHTML = `
            <h2>Welcome, ${result.data.first_name || result.data.email}!</h2>
            <p><strong>Email:</strong> ${result.data.email}</p>
            <p><strong>Role:</strong> ${result.data.role}</p>
            <p><strong>User ID:</strong> ${result.data.id || result.data.user_id}</p>
             ${result.data.bio ? `<p><strong>Bio:</strong> ${result.data.bio}</p>` : ''}
            ${result.data.city ? `<p><strong>City:</strong> ${result.data.city}</p>` : ''}
            ${result.data.country ? `<p><strong>Country:</strong> ${result.data.country}</p>` : ''}
             <!-- Add more fields as needed -->
        `;

         // Add logout listener if on dashboard
        const logoutButtonDash = document.getElementById('logout-button-dashboard');
        if(logoutButtonDash) logoutButtonDash.addEventListener('click', handleLogout);

    } else {
        console.error('Failed to fetch protected data:', result.error);
        userInfoDiv.innerHTML = '<p class="error">Failed to load user data. You might be logged out.</p>';
        // Optionally redirect to login if fetching fails due to auth issues
        // setTimeout(() => { window.location.href = 'login.html'; }, 2000);
    }
}

// --- Page Load Logic ---
function checkLoginStatusAndRedirect(currentPage) {
    const loggedIn = isLoggedIn();
    const authLinks = document.getElementById('auth-links');
    const dashboardLink = document.getElementById('dashboard-link');
    const logoutButtonIndex = document.getElementById('logout-button-index');

    if (loggedIn) {
        if (currentPage === 'login' || currentPage === 'register') {
            console.log('Already logged in, redirecting to dashboard.');
            window.location.href = 'dashboard.html';
        } else if (currentPage === 'index') {
             // Show dashboard link, hide login/register on index
            if(authLinks) authLinks.style.display = 'none';
            if(dashboardLink) dashboardLink.style.display = 'block';
             if(logoutButtonIndex) logoutButtonIndex.addEventListener('click', handleLogout);
        }
        // If on dashboard, fetchProtectedData will be called by its own DOMContentLoaded listener

    } else { // Not logged in
        if (currentPage === 'dashboard') {
            console.log('Not logged in, redirecting to login.');
            window.location.href = 'login.html';
        } else if (currentPage === 'index') {
             // Show login/register, hide dashboard link on index
            if(authLinks) authLinks.style.display = 'block';
            if(dashboardLink) dashboardLink.style.display = 'none';
        }
        // Stay on login/register page if currently there
    }
}

// Add global logout listener for index page if exists
document.addEventListener('DOMContentLoaded', () => {
    const logoutButtonIndex = document.getElementById('logout-button-index');
    if (logoutButtonIndex && isLoggedIn()) { // Add listener only if button exists and user is logged in
        logoutButtonIndex.addEventListener('click', handleLogout);
    }
});
