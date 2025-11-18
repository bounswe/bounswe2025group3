import React from 'react';
import { render, fireEvent } from '@/__tests__/test-utils';
import PillButton from '../pill-button';

describe('PillButton', () => {
  it('renders text correctly', () => {
    const { getByText } = render(<PillButton text="Click me" />);
    expect(getByText('Click me')).toBeTruthy();
  });

  it('applies custom backgroundColor', () => {
    const { getByText } = render(
      <PillButton text="Test" backgroundColor="#FF0000" />
    );
    const button = getByText('Test').parent?.parent;
    expect(button?.props.style).toMatchObject({ backgroundColor: '#FF0000' });
  });

  it('applies custom borderColor', () => {
    const { getByText } = render(
      <PillButton text="Test" borderColor="#00FF00" />
    );
    const button = getByText('Test').parent?.parent;
    expect(button?.props.style).toMatchObject({ borderColor: '#00FF00' });
  });

  it('applies custom textColor', () => {
    const { getByText } = render(
      <PillButton text="Test" textColor="#0000FF" />
    );
    const text = getByText('Test');
    expect(text.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: '#0000FF' })
      ])
    );
  });

  it('calls onPress callback when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <PillButton text="Press me" onPress={onPressMock} />
    );

    fireEvent.press(getByText('Press me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('prevents onPress when disabled', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <PillButton text="Disabled" onPress={onPressMock} disabled={true} />
    );

    // Firing press on a disabled button should not call the handler
    fireEvent.press(getByText('Disabled'));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it('applies default props correctly', () => {
    const { getByText } = render(<PillButton text="Default" />);
    const button = getByText('Default').parent?.parent;

    expect(button?.props.style).toMatchObject({
      backgroundColor: 'white',
      borderColor: 'black'
    });

    const text = getByText('Default');
    expect(text.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ color: 'black' })
      ])
    );
  });
});
