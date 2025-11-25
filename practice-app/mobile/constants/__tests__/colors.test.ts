import { renderHook } from '@testing-library/react-native';
import { useColors } from '../colors';

// Mock the theme context
jest.mock('@/hooks/themeContext', () => ({
  useTheme: jest.fn(() => ({
    isDark: false,
    theme: 'light',
    isColorBlind: false,
  })),
}));

describe('useColors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns light colors by default', () => {
    const useThemeMock = require('@/hooks/themeContext').useTheme;
    useThemeMock.mockReturnValue({
      isDark: false,
      theme: 'light',
      isColorBlind: false,
    });

    const { result } = renderHook(() => useColors());

    expect(result.current.primary).toBe('#10632C');
    expect(result.current.background).toBe('#F4F7F6');
    expect(result.current.text).toBe('#333333');
    expect(result.current.error).toBe('#D32F2F');
  });

  it('returns dark colors when isDark is true', () => {
    const useThemeMock = require('@/hooks/themeContext').useTheme;
    useThemeMock.mockReturnValue({
      isDark: true,
      theme: 'dark',
      isColorBlind: false,
    });

    const { result } = renderHook(() => useColors());

    expect(result.current.primary).toBe('#B2FF45');
    expect(result.current.background).toBe('#0C0D0F');
    expect(result.current.text).toBe('#C8C9CA');
    expect(result.current.error).toBe('red');
  });

  it('returns colorBlind colors when isColorBlind is true', () => {
    const useThemeMock = require('@/hooks/themeContext').useTheme;
    useThemeMock.mockReturnValue({
      isDark: false,
      theme: 'light',
      isColorBlind: true,
    });

    const { result } = renderHook(() => useColors());

    expect(result.current.primary).toBe('#10632C');
    expect(result.current.background).toBe('#F4F7F6');
    expect(result.current.text).toBe('#333333');
    expect(result.current.error).toBe('#7500FA'); // Purple for colorBlind mode
  });

  it('returns colorBlind colors when theme is colorBlind', () => {
    const useThemeMock = require('@/hooks/themeContext').useTheme;
    useThemeMock.mockReturnValue({
      isDark: false,
      theme: 'colorBlind',
      isColorBlind: false,
    });

    const { result } = renderHook(() => useColors());

    expect(result.current.primary).toBe('#10632C');
    expect(result.current.error).toBe('#7500FA'); // Purple for colorBlind mode
  });

  it('prioritizes isColorBlind over isDark', () => {
    const useThemeMock = require('@/hooks/themeContext').useTheme;
    useThemeMock.mockReturnValue({
      isDark: true,
      theme: 'dark',
      isColorBlind: true,
    });

    const { result } = renderHook(() => useColors());

    // Should return colorBlind colors, not dark colors
    expect(result.current.error).toBe('#7500FA'); // Purple for colorBlind mode
    expect(result.current.primary).toBe('#10632C');
  });

  it('returns all expected color properties', () => {
    const useThemeMock = require('@/hooks/themeContext').useTheme;
    useThemeMock.mockReturnValue({
      isDark: false,
      theme: 'light',
      isColorBlind: false,
    });

    const { result } = renderHook(() => useColors());

    // Verify all required color properties exist
    expect(result.current).toHaveProperty('primary');
    expect(result.current).toHaveProperty('primary_d');
    expect(result.current).toHaveProperty('blue');
    expect(result.current).toHaveProperty('background');
    expect(result.current).toHaveProperty('borders');
    expect(result.current).toHaveProperty('cb1');
    expect(result.current).toHaveProperty('cb2');
    expect(result.current).toHaveProperty('cb3');
    expect(result.current).toHaveProperty('cb4');
    expect(result.current).toHaveProperty('inactive_button');
    expect(result.current).toHaveProperty('inactive_text');
    expect(result.current).toHaveProperty('text');
    expect(result.current).toHaveProperty('textSecondary');
    expect(result.current).toHaveProperty('border');
    expect(result.current).toHaveProperty('success');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('sun');
    expect(result.current).toHaveProperty('black');
    expect(result.current).toHaveProperty('white');
  });

  it('returns different text colors for light and dark themes', () => {
    const useThemeMock = require('@/hooks/themeContext').useTheme;

    // Test light theme
    useThemeMock.mockReturnValue({
      isDark: false,
      theme: 'light',
      isColorBlind: false,
    });
    const { result: lightResult } = renderHook(() => useColors());

    // Test dark theme
    useThemeMock.mockReturnValue({
      isDark: true,
      theme: 'dark',
      isColorBlind: false,
    });
    const { result: darkResult } = renderHook(() => useColors());

    // Text colors should be different
    expect(lightResult.current.text).not.toBe(darkResult.current.text);
    expect(lightResult.current.background).not.toBe(darkResult.current.background);
  });

  it('returns consistent colors for the same theme', () => {
    const useThemeMock = require('@/hooks/themeContext').useTheme;
    useThemeMock.mockReturnValue({
      isDark: false,
      theme: 'light',
      isColorBlind: false,
    });

    const { result: firstCall } = renderHook(() => useColors());
    const { result: secondCall } = renderHook(() => useColors());

    expect(firstCall.current).toEqual(secondCall.current);
  });
});
