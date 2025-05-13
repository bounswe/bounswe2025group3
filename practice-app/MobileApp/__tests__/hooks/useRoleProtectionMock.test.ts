// Mock dependencies before importing the module
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  })),
}));

jest.mock('@/app/tokenManager', () => ({
  getUserRoleFromToken: jest.fn(),
}));

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

// Import after mocking
import { renderHook, act } from '@testing-library/react-native';
import { useRoleProtection } from '@/hooks/useRoleProtection';
import TokenManager from '@/app/tokenManager';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

describe('useRoleProtection', () => {
  const mockRouter = { replace: jest.fn() };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should grant access when user has required role', async () => {
    // Mock TokenManager to return ADMIN role
    (TokenManager.getUserRoleFromToken as jest.Mock).mockResolvedValue('ADMIN');
    
    const { result } = renderHook(() => 
      useRoleProtection(['ADMIN', 'MODERATOR'], '/')
    );

    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.isAuthorized).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.tokenRole).toBe('ADMIN');
    expect(Alert.alert).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('should deny access when user does not have required role', async () => {
    // Mock TokenManager to return USER role
    (TokenManager.getUserRoleFromToken as jest.Mock).mockResolvedValue('USER');
    
    const { result } = renderHook(() => 
      useRoleProtection(['ADMIN', 'MODERATOR'], '/home')
    );

    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.isAuthorized).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.tokenRole).toBe('USER');
    expect(Alert.alert).toHaveBeenCalledWith(
      "Access Denied", 
      "You don't have permission to access this area.",
      expect.anything()
    );
    
    // Simulate clicking OK on the alert
    const alertCallback = (Alert.alert as jest.Mock).mock.calls[0][2][0].onPress;
    alertCallback();
    
    expect(mockRouter.replace).toHaveBeenCalledWith('/home');
  });
}); 