
**File: `docs/testing/sample-tests.md`**
```markdown
# Sample Tests

## Unit Test for LoginPage.js
This test verifies the login form's rendering and submission behavior.

**File**: `src/components/auth/LoginPage.test.js`

```javascript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import LoginPage from './LoginPage';

// Mock axios
jest.mock('axios');

describe('LoginPage', () => {
  // Mock useNavigate
  const mockedNavigate = jest.fn();
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate,
  }));

  // Wrapper for routing context
  const renderWithRouter = (ui) => render(ui, { wrapper: BrowserRouter });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form and submits credentials', async () => {
    // Mock successful API response
    axios.post.mockResolvedValue({
      data: {
        access: 'mock-token',
        refresh: 'mock-refresh',
        user_id: '1',
        email: 'test@example.com',
        role: 'user',
      },
    });

    // Render component
    renderWithRouter(<LoginPage />);

    // Check form elements
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();

    // Fill form
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Verify API call
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/api/token/',
        {
          email: 'test@example.com',
          password: 'password123',
        }
      );
    });

    // Verify localStorage and navigation
    expect(localStorage.getItem('access_token')).toBe('mock-token');
    expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('displays error on failed login', async () => {
    // Mock failed API response
    axios.post.mockRejectedValue({
      response: { data: { detail: 'Invalid credentials' } },
    });

    renderWithRouter(<LoginPage />);

    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    // Check error message
    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });
});
```
## Explanation
- Test Setup: Mocks axios and useNavigate to isolate dependencies.
- Test Cases:
    - Successful Login: Verifies form rendering, submission, API call, localStorage updates, and navigation.
    - Failed Login: Tests error handling when the API returns an error.
- Tools: Uses render, screen, and fireEvent from React Testing Library, with waitFor for async operations.

