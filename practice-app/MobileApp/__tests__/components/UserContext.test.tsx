import React from 'react';
import { render, act } from '@testing-library/react-native';
import { UserProvider, useUser } from '@/app/UserContext';
import TokenManager from '@/app/tokenManager';

// Mock TokenManager
jest.mock('@/app/tokenManager', () => ({
  autoLogin: jest.fn(),
  clearTokens: jest.fn(),
  getUserRoleFromToken: jest.fn(),
  refreshToken: jest.fn(),
}));

// Create a test component that uses the useUser hook
const TestComponent = () => {
  const { user, isLoggedIn, userRole, login, logout } = useUser();
  
  return (
    <>
      <div data-testid="user-email">{user?.email || 'No user'}</div>
      <div data-testid="is-logged-in">{isLoggedIn ? 'Logged In' : 'Logged Out'}</div>
      <div data-testid="user-role">{userRole || 'No role'}</div>
      <button data-testid="login-button" onPress={() => login({ email: 'test@example.com' })}>
        Login
      </button>
      <button data-testid="logout-button" onPress={logout}>
        Logout
      </button>
    </>
  );
};

describe('UserContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial state with user not logged in', () => {
    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    expect(getByTestId('user-email').props.children).toBe('No user');
    expect(getByTestId('is-logged-in').props.children).toBe('Logged Out');
    expect(getByTestId('user-role').props.children).toBe('No role');
  });

  it('updates state when login is called', async () => {
    // Mock getUserRoleFromToken to return a role
    (TokenManager.getUserRoleFromToken as jest.Mock).mockResolvedValue('USER');

    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    // Initial state
    expect(getByTestId('is-logged-in').props.children).toBe('Logged Out');

    // Trigger login
    await act(async () => {
      getByTestId('login-button').props.onPress();
    });

    // After login
    expect(getByTestId('user-email').props.children).toBe('test@example.com');
    expect(getByTestId('is-logged-in').props.children).toBe('Logged In');
    expect(getByTestId('user-role').props.children).toBe('USER');
  });

  it('clears state when logout is called', async () => {
    // Mock getUserRoleFromToken to return a role
    (TokenManager.getUserRoleFromToken as jest.Mock).mockResolvedValue('USER');

    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    // First login
    await act(async () => {
      getByTestId('login-button').props.onPress();
    });

    // Verify logged in
    expect(getByTestId('is-logged-in').props.children).toBe('Logged In');

    // Then logout
    await act(async () => {
      getByTestId('logout-button').props.onPress();
    });

    // After logout
    expect(getByTestId('user-email').props.children).toBe('No user');
    expect(getByTestId('is-logged-in').props.children).toBe('Logged Out');
    expect(getByTestId('user-role').props.children).toBe('No role');
    expect(TokenManager.clearTokens).toHaveBeenCalled();
  });

  it('attempts auto login on mount', async () => {
    // Mock successful auto login
    (TokenManager.autoLogin as jest.Mock).mockResolvedValue(true);
    (TokenManager.getUserRoleFromToken as jest.Mock).mockResolvedValue('USER');

    await act(async () => {
      render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );
    });

    expect(TokenManager.autoLogin).toHaveBeenCalled();
  });

  it('handles failed auto login', async () => {
    // Mock failed auto login
    (TokenManager.autoLogin as jest.Mock).mockResolvedValue(false);

    let component;
    await act(async () => {
      component = render(
        <UserProvider>
          <TestComponent />
        </UserProvider>
      );
    });

    expect(TokenManager.autoLogin).toHaveBeenCalled();
    expect(component.getByTestId('is-logged-in').props.children).toBe('Logged Out');
  });
}); 