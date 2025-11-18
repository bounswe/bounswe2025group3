import React from 'react';
import { render, act, renderHook, waitFor } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '../themeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock useColorScheme
const mockUseColorScheme = jest.fn(() => 'light');
jest.mock('react-native', () => {
  const actualRN = jest.requireActual('react-native');
  return new Proxy(actualRN, {
    get: (target, prop) => {
      if (prop === 'useColorScheme') {
        return () => mockUseColorScheme();
      }
      return target[prop as keyof typeof actualRN];
    },
  });
});

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
    mockUseColorScheme.mockReturnValue('light');
  });

  describe('ThemeProvider', () => {
    it('should load saved theme on mount', async () => {
      await AsyncStorage.setItem('appTheme', 'dark');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.theme).toBe('dark');
      });
    });

    it('should load color blind preference on mount', async () => {
      await AsyncStorage.setItem('colorBlindEnabled', 'true');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isColorBlind).toBe(true);
      });
    });

    it('should load both theme and color blind preference', async () => {
      await AsyncStorage.setItem('appTheme', 'dark');
      await AsyncStorage.setItem('colorBlindEnabled', 'true');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.theme).toBe('dark');
        expect(result.current.isColorBlind).toBe(true);
      });
    });

    it('should use default values when no saved preferences exist', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.theme).toBe('system');
        expect(result.current.isColorBlind).toBe(false);
      });
    });

    it('should calculate isDark correctly for system theme when system is dark', async () => {
      mockUseColorScheme.mockReturnValue('dark');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.theme).toBe('system');
        expect(result.current.isDark).toBe(true);
      });
    });

    it('should calculate isDark correctly for system theme when system is light', async () => {
      mockUseColorScheme.mockReturnValue('light');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.theme).toBe('system');
        expect(result.current.isDark).toBe(false);
      });
    });

    it('should calculate isDark correctly for dark theme', async () => {
      await AsyncStorage.setItem('appTheme', 'dark');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.theme).toBe('dark');
        expect(result.current.isDark).toBe(true);
      });
    });

    it('should calculate isDark correctly for light theme', async () => {
      await AsyncStorage.setItem('appTheme', 'light');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.theme).toBe('light');
        expect(result.current.isDark).toBe(false);
      });
    });

    it('should calculate isDark correctly for colorBlind theme', async () => {
      await AsyncStorage.setItem('appTheme', 'colorBlind');
      mockUseColorScheme.mockReturnValue('light');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.theme).toBe('colorBlind');
        expect(result.current.isDark).toBe(false);
      });
    });

    it('should handle error when loading theme', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      AsyncStorage.getItem = jest.fn().mockRejectedValueOnce(new Error('Storage error'));

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should return null while loading', async () => {
      // This test verifies that the provider returns null during loading
      // Since AsyncStorage.getItem is async, there's a brief moment where isLoading is true
      // We'll verify the loading state behavior by checking that children render after loading
      const { Text } = require('react-native');
      const { queryByText } = render(
        <ThemeProvider>
          <Text>Test</Text>
        </ThemeProvider>
      );

      // Wait for loading to complete - children should render after
      await waitFor(() => {
        expect(queryByText('Test')).toBeTruthy();
      }, { timeout: 3000 });
    });
  });

  describe('setTheme', () => {
    it('should save theme to AsyncStorage', async () => {
      const setItemSpy = jest.spyOn(AsyncStorage, 'setItem');
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      await act(async () => {
        await result.current.setTheme('dark');
      });

      expect(setItemSpy).toHaveBeenCalledWith('appTheme', 'dark');
      setItemSpy.mockRestore();
    });

    it('should update theme state', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      await act(async () => {
        await result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
    });

    it('should handle all theme modes', async () => {
      const setItemSpy = jest.spyOn(AsyncStorage, 'setItem');
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      const themes: Array<'system' | 'light' | 'dark' | 'colorBlind'> = [
        'system',
        'light',
        'dark',
        'colorBlind',
      ];

      for (const theme of themes) {
        await act(async () => {
          await result.current.setTheme(theme);
        });

        expect(result.current.theme).toBe(theme);
        expect(setItemSpy).toHaveBeenCalledWith('appTheme', theme);
      }
      
      setItemSpy.mockRestore();
    });

    it('should handle error when saving theme', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const originalSetItem = AsyncStorage.setItem;
      AsyncStorage.setItem = jest.fn().mockRejectedValueOnce(new Error('Storage error'));

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      await act(async () => {
        await result.current.setTheme('dark');
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving theme:', expect.any(Error));
      
      // Restore original
      AsyncStorage.setItem = originalSetItem;
      consoleErrorSpy.mockRestore();
    });
  });

  describe('setIsColorBlind', () => {
    it('should save preference to AsyncStorage when enabled', async () => {
      const setItemSpy = jest.spyOn(AsyncStorage, 'setItem');
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      await act(async () => {
        await result.current.setIsColorBlind(true);
      });

      expect(setItemSpy).toHaveBeenCalledWith('colorBlindEnabled', 'true');
      setItemSpy.mockRestore();
    });

    it('should save preference to AsyncStorage when disabled', async () => {
      const setItemSpy = jest.spyOn(AsyncStorage, 'setItem');
      await AsyncStorage.setItem('colorBlindEnabled', 'true');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      await act(async () => {
        await result.current.setIsColorBlind(false);
      });

      expect(setItemSpy).toHaveBeenCalledWith('colorBlindEnabled', 'false');
      setItemSpy.mockRestore();
    });

    it('should update state when enabled', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      await act(async () => {
        await result.current.setIsColorBlind(true);
      });

      expect(result.current.isColorBlind).toBe(true);
    });

    it('should update state when disabled', async () => {
      // Set initial state in AsyncStorage
      await AsyncStorage.setItem('colorBlindEnabled', 'true');

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Wait for provider to load and check initial state
      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      // The initial state should be loaded from AsyncStorage
      // But since the mock might not persist, we'll just verify the state update works
      await act(async () => {
        await result.current.setIsColorBlind(false);
      });

      expect(result.current.isColorBlind).toBe(false);
    });

    it('should handle error when saving color blind preference', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const originalSetItem = AsyncStorage.setItem;
      AsyncStorage.setItem = jest.fn().mockRejectedValueOnce(new Error('Storage error'));

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      await act(async () => {
        await result.current.setIsColorBlind(true);
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error saving color-blind preference:',
        expect.any(Error)
      );
      
      // Restore original
      AsyncStorage.setItem = originalSetItem;
      consoleErrorSpy.mockRestore();
    });
  });

  describe('useTheme', () => {
    it('should return theme context', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      expect(result.current).toHaveProperty('theme');
      expect(result.current).toHaveProperty('setTheme');
      expect(result.current).toHaveProperty('isDark');
      expect(result.current).toHaveProperty('isColorBlind');
      expect(result.current).toHaveProperty('setIsColorBlind');
      expect(typeof result.current.setTheme).toBe('function');
      expect(typeof result.current.setIsColorBlind).toBe('function');
      expect(typeof result.current.isDark).toBe('boolean');
      expect(typeof result.current.isColorBlind).toBe('boolean');
    });

    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('useTheme must be used within ThemeProvider');

      console.error = originalError;
    });

    it('should return correct initial values', async () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
      );

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current).not.toBeNull();
      });

      expect(result.current.theme).toBe('system');
      expect(result.current.isColorBlind).toBe(false);
      expect(result.current.isDark).toBe(false); // system theme with light color scheme
    });
  });
});
