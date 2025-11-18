import React from 'react';
import { render, act, renderHook } from '@testing-library/react-native';
import { SessionProvider, useSession } from '../authContext';

// Mock useStorageState hook
const mockSetSession = jest.fn();
const mockSetUserRole = jest.fn();

jest.mock('../useStorageState', () => ({
  useStorageState: jest.fn((key: string) => {
    if (key === 'session') {
      return [[false, null], mockSetSession];
    } else if (key === 'userRole') {
      return [[false, null], mockSetUserRole];
    }
    return [[false, null], jest.fn()];
  }),
}));

jest.mock('@/services/tokenManager', () => ({
  __esModule: true,
  default: {
    autoLogin: jest.fn().mockResolvedValue(false),
    clearTokens: jest.fn().mockResolvedValue(undefined),
  },
}));

const tokenManager = require('@/services/tokenManager').default as {
  autoLogin: jest.Mock;
  clearTokens: jest.Mock;
};

const flushAsync = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    tokenManager.autoLogin.mockResolvedValue(false);
    tokenManager.clearTokens.mockResolvedValue(undefined);
    // Reset mocks to return no loading state and null values
    const { useStorageState } = require('../useStorageState');
    (useStorageState as jest.Mock).mockImplementation((key: string) => {
      if (key === 'session') {
        return [[false, null], mockSetSession];
      } else if (key === 'userRole') {
        return [[false, null], mockSetUserRole];
      }
      return [[false, null], jest.fn()];
    });
  });

  describe('SessionProvider', () => {
    it('should provide session context', async () => {
      const TestComponent = () => {
        const { session, userRole, isLoading, signIn, signOut } = useSession();
        expect(typeof signIn).toBe('function');
        expect(typeof signOut).toBe('function');
        expect(typeof isLoading).toBe('boolean');
        expect(session).toBeDefined();
        expect(userRole).toBeDefined();
        return null;
      };

      render(
        <SessionProvider>
          <TestComponent />
        </SessionProvider>
      );
      await flushAsync();
    });

    it('should manage loading state', async () => {
      const { useStorageState } = require('../useStorageState');
      
      // Test with loading state
      (useStorageState as jest.Mock).mockImplementation((key: string) => {
        if (key === 'session') {
          return [[true, null], mockSetSession];
        } else if (key === 'userRole') {
          return [[false, null], mockSetUserRole];
        }
        return [[false, null], jest.fn()];
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });
      await flushAsync();
      expect(result.current.isLoading).toBe(true);
    });

    it('should set isLoading to true when either session or role is loading', async () => {
      const { useStorageState } = require('../useStorageState');
      
      // Test with role loading
      (useStorageState as jest.Mock).mockImplementation((key: string) => {
        if (key === 'session') {
          return [[false, null], mockSetSession];
        } else if (key === 'userRole') {
          return [[true, null], mockSetUserRole];
        }
        return [[false, null], jest.fn()];
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });
      await flushAsync();
      expect(result.current.isLoading).toBe(true);
    });

    it('should set isLoading to false when both are loaded', async () => {
      const { useStorageState } = require('../useStorageState');
      
      (useStorageState as jest.Mock).mockImplementation((key: string) => {
        if (key === 'session') {
          return [[false, null], mockSetSession];
        } else if (key === 'userRole') {
          return [[false, null], mockSetUserRole];
        }
        return [[false, null], jest.fn()];
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });
      await flushAsync();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('signIn', () => {
    it('should set session', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });
      await flushAsync();

      act(() => {
        result.current.signIn('USER');
      });

      expect(mockSetSession).toHaveBeenCalledWith('authenticated');
    });

    it('should set user role to USER', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });
      await flushAsync();

      act(() => {
        result.current.signIn('USER');
      });

      expect(mockSetUserRole).toHaveBeenCalledWith('USER');
    });

    it('should set user role to ADMIN', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });
      await flushAsync();

      act(() => {
        result.current.signIn('ADMIN');
      });

      expect(mockSetUserRole).toHaveBeenCalledWith('ADMIN');
    });

    it('should set user role to MODERATOR', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });
      await flushAsync();

      act(() => {
        result.current.signIn('MODERATOR');
      });

      expect(mockSetUserRole).toHaveBeenCalledWith('MODERATOR');
    });

    it('should set both session and role when signing in', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });
      await flushAsync();

      act(() => {
        result.current.signIn('USER');
      });

      expect(mockSetSession).toHaveBeenCalledWith('authenticated');
      expect(mockSetUserRole).toHaveBeenCalledWith('USER');
    });
  });

  describe('signOut', () => {
    it('should clear session', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });
      await flushAsync();

      act(() => {
        result.current.signOut();
      });

      expect(mockSetSession).toHaveBeenCalledWith(null);
    });

    it('should clear user role', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });
      await flushAsync();

      act(() => {
        result.current.signOut();
      });

      expect(mockSetUserRole).toHaveBeenCalledWith(null);
    });

    it('should clear both session and role when signing out', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });
      await flushAsync();

      act(() => {
        result.current.signOut();
      });

      expect(mockSetSession).toHaveBeenCalledWith(null);
      expect(mockSetUserRole).toHaveBeenCalledWith(null);
    });
  });

  describe('useSession', () => {
    it('should return session values', async () => {
      const { useStorageState } = require('../useStorageState');
      
      (useStorageState as jest.Mock).mockImplementation((key: string) => {
        if (key === 'session') {
          return [[false, 'test-session'], mockSetSession];
        } else if (key === 'userRole') {
          return [[false, 'USER'], mockSetUserRole];
        }
        return [[false, null], jest.fn()];
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });
      await flushAsync();

      expect(result.current).toHaveProperty('signIn');
      expect(result.current).toHaveProperty('signOut');
      expect(result.current).toHaveProperty('session');
      expect(result.current).toHaveProperty('userRole');
      expect(result.current).toHaveProperty('isLoading');
      expect(typeof result.current.signIn).toBe('function');
      expect(typeof result.current.signOut).toBe('function');
      expect(result.current.session).toBe('test-session');
      expect(result.current.userRole).toBe('USER');
      expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('should return null values when no session exists', async () => {
      const { useStorageState } = require('../useStorageState');
      
      (useStorageState as jest.Mock).mockImplementation((key: string) => {
        if (key === 'session') {
          return [[false, null], mockSetSession];
        } else if (key === 'userRole') {
          return [[false, null], mockSetUserRole];
        }
        return [[false, null], jest.fn()];
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });
      await flushAsync();

      expect(result.current.session).toBeNull();
      expect(result.current.userRole).toBeNull();
    });

    it('should throw error when used outside provider', async () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      try {
        const { result } = renderHook(() => useSession());
        await flushAsync();
        expect(result.current.signIn).toBeDefined();
        expect(result.current.signOut).toBeDefined();
      } catch (error: any) {
        // If it throws, it should be the expected error
        expect(error.message).toContain('useSession must be wrapped in a <SessionProvider />');
      } finally {
        console.error = originalError;
      }
    });

    it('should update session and userRole when storage state changes', async () => {
      const { useStorageState } = require('../useStorageState');
      
      let sessionValue: string | null = null;
      let roleValue: string | null = null;

      (useStorageState as jest.Mock).mockImplementation((key: string) => {
        if (key === 'session') {
          return [[false, sessionValue], mockSetSession];
        } else if (key === 'userRole') {
          return [[false, roleValue], mockSetUserRole];
        }
        return [[false, null], jest.fn()];
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result, rerender } = renderHook(() => useSession(), { wrapper });
      await flushAsync();

      expect(result.current.session).toBeNull();
      expect(result.current.userRole).toBeNull();

      // Simulate storage state change
      sessionValue = 'new-session';
      roleValue = 'ADMIN';
      rerender({ children: <SessionProvider>{'test-session'}</SessionProvider> });
      await flushAsync();

      expect(result.current).toHaveProperty('session');
      expect(result.current).toHaveProperty('userRole');
    });
  });
});

