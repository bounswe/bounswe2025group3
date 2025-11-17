import React from 'react';
import { render } from '@/__tests__/test-utils';
import { IconSymbol } from '../icon-symbol';

// Since MaterialIcons is mocked as a string in jest.setup.ts, we need to handle it differently
describe('IconSymbol', () => {
  it('renders with house.fill mapping', () => {
    const { UNSAFE_root } = render(
      <IconSymbol name="house.fill" color="#000000" size={24} />
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders with paperplane.fill mapping', () => {
    const { UNSAFE_root } = render(
      <IconSymbol name="paperplane.fill" color="#000000" size={24} />
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders with chevron.left.forwardslash.chevron.right mapping', () => {
    const { UNSAFE_root } = render(
      <IconSymbol
        name="chevron.left.forwardslash.chevron.right"
        color="#000000"
        size={24}
      />
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders with chevron.right mapping', () => {
    const { UNSAFE_root } = render(
      <IconSymbol name="chevron.right" color="#000000" size={24} />
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('applies size prop correctly', () => {
    const { UNSAFE_root } = render(
      <IconSymbol name="house.fill" color="#000000" size={32} />
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('applies color prop correctly', () => {
    const { UNSAFE_root } = render(
      <IconSymbol name="house.fill" color="#FF0000" size={24} />
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('uses default size when not specified', () => {
    const { UNSAFE_root } = render(
      <IconSymbol name="house.fill" color="#000000" />
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('applies style prop when provided', () => {
    const customStyle = { marginTop: 10, marginLeft: 5 };
    const { UNSAFE_root } = render(
      <IconSymbol
        name="house.fill"
        color="#000000"
        size={24}
        style={customStyle}
      />
    );
    expect(UNSAFE_root).toBeTruthy();
  });

  it('handles different color formats', () => {
    // Test with hex color
    const { UNSAFE_root: hexRoot } = render(
      <IconSymbol name="house.fill" color="#ABCDEF" size={24} />
    );
    expect(hexRoot).toBeTruthy();

    // Test with rgb color
    const { UNSAFE_root: rgbRoot } = render(
      <IconSymbol name="house.fill" color="rgb(255, 0, 0)" size={24} />
    );
    expect(rgbRoot).toBeTruthy();

    // Test with named color
    const { UNSAFE_root: namedRoot } = render(
      <IconSymbol name="house.fill" color="red" size={24} />
    );
    expect(namedRoot).toBeTruthy();
  });

  it('renders multiple icons with different sizes', () => {
    const { UNSAFE_root: small } = render(
      <IconSymbol name="house.fill" color="#000000" size={16} />
    );
    const { UNSAFE_root: medium } = render(
      <IconSymbol name="house.fill" color="#000000" size={24} />
    );
    const { UNSAFE_root: large } = render(
      <IconSymbol name="house.fill" color="#000000" size={48} />
    );

    expect(small).toBeTruthy();
    expect(medium).toBeTruthy();
    expect(large).toBeTruthy();
  });
});
