import React from 'react';
import { render } from '@testing-library/react-native';
import ThemedText from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';

// Mock the useColorScheme hook
jest.mock('@/hooks/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('ThemedText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with light theme colors when color scheme is light', () => {
    // Mock the hook to return 'light'
    (useColorScheme as jest.Mock).mockReturnValue('light');

    const { getByText, UNSAFE_getByProps } = render(
      <ThemedText>Test Text</ThemedText>
    );

    expect(getByText('Test Text')).toBeTruthy();
    
    // Check that the text color is dark (for light mode)
    const textComponent = UNSAFE_getByProps({ children: 'Test Text' });
    expect(textComponent.props.style).toEqual(
      expect.objectContaining({
        color: expect.stringMatching(/^#333|rgba\(0,0,0/) // Match dark color
      })
    );
  });

  it('renders with dark theme colors when color scheme is dark', () => {
    // Mock the hook to return 'dark'
    (useColorScheme as jest.Mock).mockReturnValue('dark');

    const { getByText, UNSAFE_getByProps } = render(
      <ThemedText>Test Text</ThemedText>
    );

    expect(getByText('Test Text')).toBeTruthy();
    
    // Check that the text color is light (for dark mode)
    const textComponent = UNSAFE_getByProps({ children: 'Test Text' });
    expect(textComponent.props.style).toEqual(
      expect.objectContaining({
        color: expect.stringMatching(/^#fff|#f|rgba\(255/) // Match light color
      })
    );
  });

  it('applies custom styles when provided', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');

    const customStyle = { fontSize: 20, fontWeight: 'bold' as const };
    
    const { UNSAFE_getByProps } = render(
      <ThemedText style={customStyle}>Test Text</ThemedText>
    );

    const textComponent = UNSAFE_getByProps({ children: 'Test Text' });
    expect(textComponent.props.style).toEqual(
      expect.objectContaining({
        fontSize: 20,
        fontWeight: 'bold'
      })
    );
  });

  it('applies variant styles correctly', () => {
    (useColorScheme as jest.Mock).mockReturnValue('light');

    const { UNSAFE_getByProps } = render(
      <ThemedText variant="h1">Heading Text</ThemedText>
    );

    const textComponent = UNSAFE_getByProps({ children: 'Heading Text' });
    expect(textComponent.props.style).toEqual(
      expect.objectContaining({
        fontSize: expect.any(Number),
        fontWeight: expect.any(String)
      })
    );
  });
}); 