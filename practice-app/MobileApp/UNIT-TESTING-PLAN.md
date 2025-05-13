# Mobile App Unit Testing Plan

This document outlines the plan for implementing unit tests for the MobileApp part of the practice-app project.

## Setup and Configuration

We have set up the following testing environment:

1. **Testing Framework**: Jest + React Testing Library
2. **Configuration Files**:
   - `jest.config.js` - Jest configuration
   - `package.json` - Added testing dependencies

## Test Structure

Tests are organized to mirror the application structure:

```
__tests__/
├── components/     # Tests for React components
├── hooks/          # Tests for custom hooks
└── utils/          # Tests for utility functions and classes
```

## Testing Approach by Component Type

### 1. Utility Functions and Classes

#### TokenManager (`app/tokenManager.ts`)

This is a critical class that handles authentication tokens and API calls.

**Test Cases**:
- Token storage and retrieval
- Token validation
- Token refresh
- Error handling
- API call authentication
- Role extraction from tokens

**Mocking Requirements**:
- `expo-secure-store` for token storage
- `fetch` for API calls

### 2. Custom Hooks

#### useRoleProtection (`hooks/useRoleProtection.ts`)

This hook protects routes based on user roles.

**Test Cases**:
- Access granted when user has required role
- Access denied when user doesn't have required role
- Error handling when token check fails
- Redirect behavior on access denial

**Mocking Requirements**:
- `TokenManager.getUserRoleFromToken`
- `expo-router` for navigation
- `Alert` for showing access denied messages

#### useThemeColor (`hooks/useThemeColor.ts`)

This hook provides theme colors based on color scheme.

**Test Cases**:
- Returns correct colors for light theme
- Returns correct colors for dark theme
- Handles custom colors

**Mocking Requirements**:
- `useColorScheme` hook

### 3. UI Components

#### CustomAlert (`components/CustomAlert.tsx`)

A reusable alert component.

**Test Cases**:
- Renders correctly with default props
- Shows success icon when type is 'success'
- Shows error icon when type is 'error'
- Calls onClose when close button is pressed
- Is not visible when visible prop is false

**Mocking Requirements**:
- None, can be tested with standard React Testing Library

#### ThemedText (`components/ThemedText.tsx`)

A text component that adapts to the current theme.

**Test Cases**:
- Renders with correct color in light mode
- Renders with correct color in dark mode
- Applies custom styles when provided
- Applies variant styles correctly

**Mocking Requirements**:
- `useColorScheme` hook

#### ThemedView (`components/ThemedView.tsx`)

A view component that adapts to the current theme.

**Test Cases**:
- Renders with correct background color in light mode
- Renders with correct background color in dark mode
- Applies custom styles when provided

**Mocking Requirements**:
- `useColorScheme` hook

### 4. Context Providers

#### UserContext (`app/UserContext.tsx`)

Manages user authentication state.

**Test Cases**:
- Provides initial state with user not logged in
- Updates state when login is called
- Clears state when logout is called
- Attempts auto login on mount
- Updates user role when changed

**Mocking Requirements**:
- `TokenManager` methods
- `expo-router` for navigation

## Mocking Strategies

### External Dependencies

1. **expo-secure-store**
   ```javascript
   jest.mock('expo-secure-store', () => ({
     setItemAsync: jest.fn(() => Promise.resolve()),
     getItemAsync: jest.fn(() => Promise.resolve()),
     deleteItemAsync: jest.fn(() => Promise.resolve()),
   }));
   ```

2. **expo-router**
   ```javascript
   jest.mock('expo-router', () => ({
     useRouter: jest.fn(() => ({
       replace: jest.fn(),
       push: jest.fn(),
       back: jest.fn(),
     })),
   }));
   ```

3. **React Native Alert**
   ```javascript
   jest.mock('react-native', () => ({
     Alert: {
       alert: jest.fn(),
     },
   }));
   ```

4. **fetch**
   ```javascript
   global.fetch = jest.fn();
   ```

### Internal Dependencies

1. **TokenManager**
   ```javascript
   jest.mock('@/app/tokenManager', () => ({
     getUserRoleFromToken: jest.fn(),
     autoLogin: jest.fn(),
     clearTokens: jest.fn(),
     refreshToken: jest.fn(),
   }));
   ```

2. **useColorScheme**
   ```javascript
   jest.mock('@/hooks/useColorScheme', () => ({
     __esModule: true,
     default: jest.fn(),
   }));
   ```

## Implementation Plan

### Phase 1: Core Utilities and Services

1. TokenManager tests
2. API utility tests
3. Authentication flow tests

### Phase 2: Custom Hooks

1. useRoleProtection tests
2. useThemeColor tests
3. useColorScheme tests

### Phase 3: UI Components

1. CustomAlert tests
2. ThemedText tests
3. ThemedView tests
4. Other UI component tests

### Phase 4: Context Providers

1. UserContext tests

### Phase 5: Screen Components

1. Login/Register screen tests
2. Profile screens tests
3. Admin/Moderator screens tests
4. Feature-specific screens tests

## Best Practices

1. **Arrange-Act-Assert** pattern for all tests
2. Mock external dependencies
3. Test one thing at a time
4. Use descriptive test names
5. Keep tests independent and isolated
6. Test edge cases and error handling
7. Avoid testing implementation details

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm test -- --coverage

# Run specific test file
npm test -- path/to/test.js

# Run tests in watch mode
npm test -- --watch
```

## Continuous Integration

Tests should be run automatically on pull requests to ensure code quality.

## Troubleshooting Common Issues

1. **Mocking Issues**: Ensure mocks are defined before importing the modules they mock
2. **Timing Issues**: Use `act()` and `waitFor()` for asynchronous operations
3. **Rendering Issues**: Check component props and ensure all required context providers are present
4. **Test Environment Issues**: Make sure Jest configuration is correct for React Native 