# Mobile App Unit Tests

This directory contains unit tests for the Mobile App components, hooks, and utilities.

## Directory Structure

Tests are organized to mirror the application structure:

```
__tests__/
├── components/     # Tests for React components
├── hooks/          # Tests for custom hooks
└── utils/          # Tests for utility functions and classes
```

## Running Tests

To run all tests:

```bash
npm test
```

To run tests with coverage report:

```bash
npm test -- --coverage
```

To run a specific test file:

```bash
npm test -- path/to/test.js
```

## Writing Tests

### Component Tests

When testing components, follow these guidelines:

1. Import the component and any necessary testing utilities
2. Mock any external dependencies
3. Render the component with required props
4. Test that the component renders correctly
5. Test interactions and state changes

Example:

```javascript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomAlert from '@/components/CustomAlert';

describe('CustomAlert', () => {
  const mockOnClose = jest.fn();
  
  it('renders correctly', () => {
    const { getByText } = render(
      <CustomAlert 
        visible={true} 
        title="Test Title" 
        message="Test Message" 
        onClose={mockOnClose} 
      />
    );
    
    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Message')).toBeTruthy();
  });
  
  it('calls onClose when close button is pressed', () => {
    const { getByText } = render(
      <CustomAlert 
        visible={true} 
        title="Test Title" 
        message="Test Message" 
        onClose={mockOnClose} 
      />
    );
    
    fireEvent.press(getByText('Close'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
```

### Hook Tests

When testing hooks, follow these guidelines:

1. Import the hook and any necessary testing utilities
2. Mock any external dependencies
3. Use `renderHook` to render the hook
4. Test the initial state
5. Test state changes and effects

Example:

```javascript
import { renderHook, act } from '@testing-library/react-native';
import { useRoleProtection } from '@/hooks/useRoleProtection';
import TokenManager from '@/app/tokenManager';

// Mock dependencies
jest.mock('@/app/tokenManager', () => ({
  getUserRoleFromToken: jest.fn(),
}));

describe('useRoleProtection', () => {
  it('should grant access when user has required role', async () => {
    // Mock TokenManager to return ADMIN role
    TokenManager.getUserRoleFromToken.mockResolvedValue('ADMIN');
    
    const { result, waitForNextUpdate } = renderHook(() => 
      useRoleProtection(['ADMIN', 'MODERATOR'])
    );
    
    await waitForNextUpdate();
    
    expect(result.current.isAuthorized).toBe(true);
  });
});
```

### Utility Tests

When testing utility functions, follow these guidelines:

1. Import the utility function
2. Mock any external dependencies
3. Test the function with various inputs
4. Test error handling

Example:

```javascript
import TokenManager from '@/app/tokenManager';
import * as SecureStore from 'expo-secure-store';

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('TokenManager', () => {
  it('should save tokens to secure store', async () => {
    await TokenManager.saveTokens('access-token', 'refresh-token');
    
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('accessToken', 'access-token');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('refreshToken', 'refresh-token');
  });
});
```

## Mocking Dependencies

Common mocking patterns:

### External Libraries

```javascript
// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();
```

### Internal Dependencies

```javascript
// Mock TokenManager
jest.mock('@/app/tokenManager', () => ({
  getUserRoleFromToken: jest.fn(),
  autoLogin: jest.fn(),
  clearTokens: jest.fn(),
}));

// Mock hooks
jest.mock('@/hooks/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(),
}));
```

## Best Practices

1. Test one thing at a time
2. Use descriptive test names
3. Arrange-Act-Assert pattern
4. Mock external dependencies
5. Test edge cases and error handling
6. Keep tests independent and isolated
7. Avoid testing implementation details

## Code Coverage

We aim for high code coverage, but focus on meaningful tests rather than just hitting coverage targets. The most important areas to cover are:

1. Business logic
2. Error handling
3. Edge cases
4. User interactions

## Adding New Tests

When adding new features to the app, follow these steps:

1. Create a new test file in the appropriate directory
2. Import the component/hook/utility to test
3. Write tests for the main functionality
4. Write tests for edge cases and error handling
5. Run the tests to ensure they pass 