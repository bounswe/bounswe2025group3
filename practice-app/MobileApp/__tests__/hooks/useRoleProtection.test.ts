import { renderHook, act } from '@testing-library/react-native';
import { useRoleProtection } from '@/hooks/useRoleProtection';
import TokenManager from '@/app/tokenManager';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

// Mock dependencies
jest.mock('@/app/tokenManager', () => ({
  getUserRoleFromToken: jest.fn(),
}));

jest.mock('expo-router');
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      ...RN.Alert,
      alert: jest.fn(),
    },
  };
});

describe('useRoleProtection', () => {
  const mockRouter = { replace: jest.fn() };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should grant access when user has required role', async () => {
    // Mock TokenManager to return ADMIN role
    (TokenManager.getUserRoleFromToken as jest.Mock).mockResolvedValue('ADMIN');
    
    const { result, rerender } = renderHook(() => 
      useRoleProtection(['ADMIN', 'MODERATOR'], '/')
    );

    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    rerender();
    
    expect(result.current.isAuthorized).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.tokenRole).toBe('ADMIN');
    expect(Alert.alert).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it('should deny access when user does not have required role', async () => {
    // Mock TokenManager to return USER role
    (TokenManager.getUserRoleFromToken as jest.Mock).mockResolvedValue('USER');
    
    const { result, rerender } = renderHook(() => 
      useRoleProtection(['ADMIN', 'MODERATOR'], '/home')
    );

    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    rerender();
    
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

  it('should handle error when token role check fails', async () => {
    // Mock TokenManager to throw an error
    (TokenManager.getUserRoleFromToken as jest.Mock).mockRejectedValue(new Error('Token error'));
    
    const { result, rerender } = renderHook(() => 
      useRoleProtection(['ADMIN'], '/')
    );

    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    rerender();
    
    expect(result.current.isAuthorized).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith(
      "Authentication Error", 
      "There was a problem checking your permissions. Please try again.",
      expect.anything()
    );
  });
}); 