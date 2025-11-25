import React from 'react';
import { render } from '@/__tests__/test-utils';
import { ThemedText } from '../themed-text';

// Mock useThemeColor hook
jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: jest.fn((props: any, colorName: string) => {
    if (props.light) return props.light;
    if (props.dark) return props.dark;
    return '#333333'; // default text color
  }),
}));

describe('ThemedText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders text correctly', () => {
    const { getByText } = render(<ThemedText>Hello World</ThemedText>);
    expect(getByText('Hello World')).toBeTruthy();
  });

  it('applies default type styles', () => {
    const { getByText } = render(<ThemedText type="default">Default Text</ThemedText>);
    const text = getByText('Default Text');

    expect(text.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fontSize: 16, lineHeight: 24 })
      ])
    );
  });

  it('applies title type styles', () => {
    const { getByText } = render(<ThemedText type="title">Title Text</ThemedText>);
    const text = getByText('Title Text');

    expect(text.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 32,
          fontWeight: 'bold',
          lineHeight: 32
        })
      ])
    );
  });

  it('applies defaultSemiBold type styles', () => {
    const { getByText } = render(
      <ThemedText type="defaultSemiBold">SemiBold Text</ThemedText>
    );
    const text = getByText('SemiBold Text');

    expect(text.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 16,
          lineHeight: 24,
          fontWeight: '600'
        })
      ])
    );
  });

  it('applies subtitle type styles', () => {
    const { getByText } = render(<ThemedText type="subtitle">Subtitle Text</ThemedText>);
    const text = getByText('Subtitle Text');

    expect(text.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 20,
          fontWeight: 'bold'
        })
      ])
    );
  });

  it('applies link type styles', () => {
    const { getByText } = render(<ThemedText type="link">Link Text</ThemedText>);
    const text = getByText('Link Text');

    expect(text.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          lineHeight: 30,
          fontSize: 16,
          color: '#0a7ea4'
        })
      ])
    );
  });

  it('applies light color prop override', () => {
    const { getByText } = render(
      <ThemedText lightColor="#FF0000">Light Color Text</ThemedText>
    );
    const text = getByText('Light Color Text');

    expect(text.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: '#FF0000' })
      ])
    );
  });

  it('applies dark color prop override', () => {
    const { getByText } = render(
      <ThemedText darkColor="#00FF00">Dark Color Text</ThemedText>
    );
    const text = getByText('Dark Color Text');

    expect(text.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: '#00FF00' })
      ])
    );
  });

  it('applies custom style prop', () => {
    const customStyle = { marginTop: 10, paddingLeft: 5 };
    const { getByText } = render(
      <ThemedText style={customStyle}>Styled Text</ThemedText>
    );
    const text = getByText('Styled Text');

    expect(text.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining(customStyle)
      ])
    );
  });

  it('passes other Text props correctly', () => {
    const { getByTestId } = render(
      <ThemedText testID="themed-text" numberOfLines={2}>
        Test Text
      </ThemedText>
    );
    const text = getByTestId('themed-text');

    expect(text).toBeTruthy();
    expect(text.props.numberOfLines).toBe(2);
  });

  it('combines type style with custom style', () => {
    const customStyle = { marginBottom: 20 };
    const { getByText } = render(
      <ThemedText type="title" style={customStyle}>
        Combined Style
      </ThemedText>
    );
    const text = getByText('Combined Style');

    expect(text.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fontSize: 32, fontWeight: 'bold' }),
        expect.objectContaining(customStyle)
      ])
    );
  });

  it('defaults to default type when type is not specified', () => {
    const { getByText } = render(<ThemedText>No Type</ThemedText>);
    const text = getByText('No Type');

    expect(text.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fontSize: 16, lineHeight: 24 })
      ])
    );
  });
});
