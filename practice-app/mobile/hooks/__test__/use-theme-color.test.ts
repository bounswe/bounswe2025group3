import { renderHook } from '@testing-library/react-native';
import { useThemeColor } from '../use-theme-color';
import { Colors } from '@/constants/theme';

// Mock useColorScheme
const mockUseColorScheme = jest.fn(() => 'light' as 'light' | 'dark' | null);
jest.mock('../use-color-scheme', () => ({
  useColorScheme: () => mockUseColorScheme(),
}));

// Mock Colors
jest.mock('@/constants/theme', () => ({
  Colors: {
    light: {
      text: '#11181C',
      background: '#fff',
      tint: '#0a7ea4',
      icon: '#687076',
      tabIconDefault: '#687076',
      tabIconSelected: '#0a7ea4',
    },
    dark: {
      text: '#ECEDEE',
      background: '#151718',
      tint: '#fff',
      icon: '#9BA1A6',
      tabIconDefault: '#9BA1A6',
      tabIconSelected: '#fff',
    },
  },
}));

describe('useThemeColor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseColorScheme.mockReturnValue('light');
  });

  describe('Returns prop color when provided', () => {
    it('should return light prop color when light theme and light color is provided', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() =>
        useThemeColor({ light: '#custom-light-color', dark: '#custom-dark-color' }, 'text')
      );

      expect(result.current).toBe('#custom-light-color');
    });

    it('should return dark prop color when dark theme and dark color is provided', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() =>
        useThemeColor({ light: '#custom-light-color', dark: '#custom-dark-color' }, 'text')
      );

      expect(result.current).toBe('#custom-dark-color');
    });

    it('should return light prop color when only light color is provided and theme is light', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() =>
        useThemeColor({ light: '#custom-light-color' }, 'text')
      );

      expect(result.current).toBe('#custom-light-color');
    });

    it('should return dark prop color when only dark color is provided and theme is dark', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() =>
        useThemeColor({ dark: '#custom-dark-color' }, 'text')
      );

      expect(result.current).toBe('#custom-dark-color');
    });
  });

  describe('Returns theme color when no prop', () => {
    it('should return theme color when no light prop is provided and theme is light', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() =>
        useThemeColor({}, 'text')
      );

      expect(result.current).toBe(Colors.light.text);
    });

    it('should return theme color when no dark prop is provided and theme is dark', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() =>
        useThemeColor({}, 'text')
      );

      expect(result.current).toBe(Colors.dark.text);
    });

    it('should return theme color when light prop is undefined and theme is light', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() =>
        useThemeColor({ light: undefined, dark: '#custom-dark-color' }, 'text')
      );

      expect(result.current).toBe(Colors.light.text);
    });

    it('should return theme color when dark prop is undefined and theme is dark', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() =>
        useThemeColor({ light: '#custom-light-color', dark: undefined }, 'text')
      );

      expect(result.current).toBe(Colors.dark.text);
    });
  });

  describe('Handles light theme', () => {
    it('should use light theme colors when theme is light', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() =>
        useThemeColor({}, 'background')
      );

      expect(result.current).toBe(Colors.light.background);
    });

    it('should prioritize light prop over theme color when both available', () => {
      mockUseColorScheme.mockReturnValue('light');

      const { result } = renderHook(() =>
        useThemeColor({ light: '#prop-color' }, 'background')
      );

      expect(result.current).toBe('#prop-color');
      expect(result.current).not.toBe(Colors.light.background);
    });

    it('should work with different color names in light theme', () => {
      mockUseColorScheme.mockReturnValue('light');

      const textResult = renderHook(() => useThemeColor({}, 'text'));
      const backgroundResult = renderHook(() => useThemeColor({}, 'background'));
      const tintResult = renderHook(() => useThemeColor({}, 'tint'));

      expect(textResult.result.current).toBe(Colors.light.text);
      expect(backgroundResult.result.current).toBe(Colors.light.background);
      expect(tintResult.result.current).toBe(Colors.light.tint);
    });
  });

  describe('Handles dark theme', () => {
    it('should use dark theme colors when theme is dark', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() =>
        useThemeColor({}, 'background')
      );

      expect(result.current).toBe(Colors.dark.background);
    });

    it('should prioritize dark prop over theme color when both available', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const { result } = renderHook(() =>
        useThemeColor({ dark: '#prop-color' }, 'background')
      );

      expect(result.current).toBe('#prop-color');
      expect(result.current).not.toBe(Colors.dark.background);
    });

    it('should work with different color names in dark theme', () => {
      mockUseColorScheme.mockReturnValue('dark');

      const textResult = renderHook(() => useThemeColor({}, 'text'));
      const backgroundResult = renderHook(() => useThemeColor({}, 'background'));
      const tintResult = renderHook(() => useThemeColor({}, 'tint'));

      expect(textResult.result.current).toBe(Colors.dark.text);
      expect(backgroundResult.result.current).toBe(Colors.dark.background);
      expect(tintResult.result.current).toBe(Colors.dark.tint);
    });
  });

  describe('Handles null color scheme', () => {
    it('should default to light theme when useColorScheme returns null', () => {
      mockUseColorScheme.mockReturnValue(null);

      const { result } = renderHook(() =>
        useThemeColor({}, 'text')
      );

      expect(result.current).toBe(Colors.light.text);
    });

    it('should use light prop when useColorScheme returns null', () => {
      mockUseColorScheme.mockReturnValue(null);

      const { result } = renderHook(() =>
        useThemeColor({ light: '#custom-color' }, 'text')
      );

      expect(result.current).toBe('#custom-color');
    });
  });
});

