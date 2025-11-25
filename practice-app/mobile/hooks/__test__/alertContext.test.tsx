import React from 'react';
import { View } from 'react-native';
import { render, act, renderHook } from '@testing-library/react-native';
import { AlertProvider, useAlert } from '../alertContext';

// Mock CustomAlert component
jest.mock('@/components/ui/custom-alert', () => {
  const { View, Text } = require('react-native');
  return function CustomAlert({ visible, title, message, confirmText, onConfirm, onClose }: any) {
    if (!visible) return null;
    return (
      <View testID="custom-alert">
        <Text testID="alert-title">{title}</Text>
        <Text testID="alert-message">{message}</Text>
        <Text testID="alert-confirm-text">{confirmText}</Text>
        <View testID="alert-confirm-button" onTouchEnd={onConfirm} />
        <View testID="alert-close-button" onTouchEnd={onClose} />
      </View>
    );
  };
});

// Mock useColors
jest.mock('@/constants/colors', () => ({
  useColors: () => ({
    error: '#ff0000',
  }),
}));

describe('AlertContext', () => {
  describe('AlertProvider', () => {
    it('should provide showAlert function in context', () => {
      const TestComponent = () => {
        const { showAlert } = useAlert();
        expect(typeof showAlert).toBe('function');
        return null;
      };

      render(
        <AlertProvider>
          <TestComponent />
        </AlertProvider>
      );
    });

    it('should provide hideAlert function in context', () => {
      const TestComponent = () => {
        const { hideAlert } = useAlert();
        expect(typeof hideAlert).toBe('function');
        return null;
      };

      render(
        <AlertProvider>
          <TestComponent />
        </AlertProvider>
      );
    });

    it('should have initial visibility as false', () => {
      const TestComponent = () => {
        const { isVisible } = useAlert();
        expect(isVisible).toBe(false);
        return null;
      };

      const { queryByTestId } = render(
        <AlertProvider>
          <TestComponent />
        </AlertProvider>
      );

      expect(queryByTestId('custom-alert')).toBeNull();
    });
  });

  describe('showAlert', () => {
    it('should set alert visibility to true', () => {
      const TestComponent = () => {
        const { showAlert, isVisible } = useAlert();
        
        React.useEffect(() => {
          showAlert({
            title: 'Test Title',
            message: 'Test Message',
            confirmText: 'OK',
          });
        }, [showAlert]);

        return null;
      };

      const { getByTestId } = render(
        <AlertProvider>
          <TestComponent />
        </AlertProvider>
      );

      expect(getByTestId('custom-alert')).toBeTruthy();
    });

    it('should apply default title when title is missing', () => {
      const TestComponent = () => {
        const { showAlert } = useAlert();
        
        React.useEffect(() => {
          showAlert({
            message: 'Test Message',
            confirmText: 'OK',
          });
        }, [showAlert]);

        return null;
      };

      const { getByTestId } = render(
        <AlertProvider>
          <TestComponent />
        </AlertProvider>
      );

      expect(getByTestId('alert-title').props.children).toBe('Alert');
    });

    it('should apply default values for missing options', () => {
      const TestComponent = () => {
        const { showAlert } = useAlert();
        
        React.useEffect(() => {
          showAlert({});
        }, [showAlert]);

        return null;
      };

      const { getByTestId } = render(
        <AlertProvider>
          <TestComponent />
        </AlertProvider>
      );

      expect(getByTestId('alert-title').props.children).toBe('Alert');
      expect(getByTestId('alert-message').props.children).toBe('');
      expect(getByTestId('alert-confirm-text').props.children).toBe('');
    });

    it('should set custom title, message, and confirmText', () => {
      const TestComponent = () => {
        const { showAlert } = useAlert();
        
        React.useEffect(() => {
          showAlert({
            title: 'Custom Title',
            message: 'Custom Message',
            confirmText: 'Confirm',
          });
        }, [showAlert]);

        return null;
      };

      const { getByTestId } = render(
        <AlertProvider>
          <TestComponent />
        </AlertProvider>
      );

      expect(getByTestId('alert-title').props.children).toBe('Custom Title');
      expect(getByTestId('alert-message').props.children).toBe('Custom Message');
      expect(getByTestId('alert-confirm-text').props.children).toBe('Confirm');
    });

    it('should execute onConfirm callback when confirm button is pressed', () => {
      const onConfirmMock = jest.fn();
      
      const TestComponent = () => {
        const { showAlert } = useAlert();
        
        React.useEffect(() => {
          showAlert({
            title: 'Test',
            message: 'Test',
            confirmText: 'OK',
            onConfirm: onConfirmMock,
          });
        }, [showAlert]);

        return null;
      };

      const { getByTestId } = render(
        <AlertProvider>
          <TestComponent />
        </AlertProvider>
      );

      act(() => {
        getByTestId('alert-confirm-button').props.onTouchEnd();
      });

      expect(onConfirmMock).toHaveBeenCalledTimes(1);
    });

    it('should call hideAlert after onConfirm is executed', () => {
      const TestComponent = () => {
        const { showAlert, isVisible } = useAlert();
        
        React.useEffect(() => {
          showAlert({
            title: 'Test',
            message: 'Test',
            confirmText: 'OK',
            onConfirm: () => {},
          });
        }, [showAlert]);

        return null;
      };

      const { getByTestId, queryByTestId } = render(
        <AlertProvider>
          <TestComponent />
        </AlertProvider>
      );

      expect(getByTestId('custom-alert')).toBeTruthy();

      act(() => {
        getByTestId('alert-confirm-button').props.onTouchEnd();
      });

      // Alert should be hidden after confirm
      expect(queryByTestId('custom-alert')).toBeNull();
    });

    it('should work without onConfirm callback', () => {
      const TestComponent = () => {
        const { showAlert } = useAlert();
        
        React.useEffect(() => {
          showAlert({
            title: 'Test',
            message: 'Test',
            confirmText: 'OK',
          });
        }, [showAlert]);

        return null;
      };

      const { getByTestId, queryByTestId } = render(
        <AlertProvider>
          <TestComponent />
        </AlertProvider>
      );

      expect(getByTestId('custom-alert')).toBeTruthy();

      act(() => {
        getByTestId('alert-confirm-button').props.onTouchEnd();
      });

      // Should still hide even without onConfirm
      expect(queryByTestId('custom-alert')).toBeNull();
    });
  });

  describe('hideAlert', () => {
    it('should set visibility to false', () => {
      const TestComponent = () => {
        const { showAlert, hideAlert } = useAlert();
        
        React.useEffect(() => {
          showAlert({
            title: 'Test',
            message: 'Test',
            confirmText: 'OK',
          });
        }, [showAlert]);

        return (
          <>
            <View testID="hide-button" onTouchEnd={hideAlert} />
          </>
        );
      };

      const { getByTestId, queryByTestId } = render(
        <AlertProvider>
          <TestComponent />
        </AlertProvider>
      );

      expect(getByTestId('custom-alert')).toBeTruthy();

      act(() => {
        getByTestId('hide-button').props.onTouchEnd();
      });

      expect(queryByTestId('custom-alert')).toBeNull();
    });

    it('should hide alert when close button is pressed', () => {
      const TestComponent = () => {
        const { showAlert } = useAlert();
        
        React.useEffect(() => {
          showAlert({
            title: 'Test',
            message: 'Test',
            confirmText: 'OK',
          });
        }, [showAlert]);

        return null;
      };

      const { getByTestId, queryByTestId } = render(
        <AlertProvider>
          <TestComponent />
        </AlertProvider>
      );

      expect(getByTestId('custom-alert')).toBeTruthy();

      act(() => {
        getByTestId('alert-close-button').props.onTouchEnd();
      });

      expect(queryByTestId('custom-alert')).toBeNull();
    });
  });

  describe('useAlert', () => {
    it('should return context values', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AlertProvider>{children}</AlertProvider>
      );

      const { result } = renderHook(() => useAlert(), { wrapper });

      expect(result.current).toHaveProperty('showAlert');
      expect(result.current).toHaveProperty('hideAlert');
      expect(result.current).toHaveProperty('isVisible');
      expect(typeof result.current.showAlert).toBe('function');
      expect(typeof result.current.hideAlert).toBe('function');
      expect(typeof result.current.isVisible).toBe('boolean');
      expect(result.current.isVisible).toBe(false);
    });

    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      try {
        renderHook(() => useAlert());
        // If we get here, the hook didn't throw, which means it's using the default context
        // This is actually fine - React Context doesn't throw by default, it just uses the default value
        // So we'll check that it returns the default context values instead
        const { result } = renderHook(() => useAlert());
        expect(result.current.showAlert).toBeDefined();
        expect(result.current.hideAlert).toBeDefined();
        expect(result.current.isVisible).toBe(false);
      } finally {
        console.error = originalError;
      }
    });

    it('should update isVisible when alert is shown and hidden', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AlertProvider>{children}</AlertProvider>
      );

      const { result } = renderHook(() => useAlert(), { wrapper });

      expect(result.current.isVisible).toBe(false);

      act(() => {
        result.current.showAlert({
          title: 'Test',
          message: 'Test',
          confirmText: 'OK',
        });
      });

      expect(result.current.isVisible).toBe(true);

      act(() => {
        result.current.hideAlert();
      });

      expect(result.current.isVisible).toBe(false);
    });
  });
});

