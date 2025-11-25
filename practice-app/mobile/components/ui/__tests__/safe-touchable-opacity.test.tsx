import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@/__tests__/test-utils';
import SafeTouchableOpacity from '../safe-touchable-opacity';

describe('SafeTouchableOpacity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls onPress on first press', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <SafeTouchableOpacity onPress={onPressMock}>
        <Text>Press me</Text>
      </SafeTouchableOpacity>
    );

    fireEvent.press(getByText('Press me'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('prevents rapid double-clicks within delay period', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <SafeTouchableOpacity onPress={onPressMock} delay={800}>
        <Text>Press me</Text>
      </SafeTouchableOpacity>
    );

    const button = getByText('Press me');

    // First press should work
    fireEvent.press(button);
    expect(onPressMock).toHaveBeenCalledTimes(1);

    // Immediate second press should be blocked
    fireEvent.press(button);
    expect(onPressMock).toHaveBeenCalledTimes(1);

    // Third press should still be blocked
    fireEvent.press(button);
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('allows click after delay period', () => {
    jest.useFakeTimers();
    const onPressMock = jest.fn();
    const { getByText } = render(
      <SafeTouchableOpacity onPress={onPressMock} delay={800}>
        <Text>Press me</Text>
      </SafeTouchableOpacity>
    );

    const button = getByText('Press me');

    // First press
    fireEvent.press(button);
    expect(onPressMock).toHaveBeenCalledTimes(1);

    // Advance time by 800ms
    jest.advanceTimersByTime(800);

    // Second press after delay should work
    fireEvent.press(button);
    expect(onPressMock).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });

  it('respects custom delay parameter', () => {
    jest.useFakeTimers();
    const onPressMock = jest.fn();
    const customDelay = 500;

    const { getByText } = render(
      <SafeTouchableOpacity onPress={onPressMock} delay={customDelay}>
        <Text>Press me</Text>
      </SafeTouchableOpacity>
    );

    const button = getByText('Press me');

    // First press
    fireEvent.press(button);
    expect(onPressMock).toHaveBeenCalledTimes(1);

    // Try press before custom delay passes
    jest.advanceTimersByTime(300);
    fireEvent.press(button);
    expect(onPressMock).toHaveBeenCalledTimes(1);

    // Press after custom delay should work
    jest.advanceTimersByTime(200); // Total 500ms
    fireEvent.press(button);
    expect(onPressMock).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });

  it('renders children correctly', () => {
    const { getByText } = render(
      <SafeTouchableOpacity onPress={jest.fn()}>
        <Text>Child Content</Text>
      </SafeTouchableOpacity>
    );

    expect(getByText('Child Content')).toBeTruthy();
  });

  it('passes other TouchableOpacity props correctly', () => {
    const { getByTestId } = render(
      <SafeTouchableOpacity
        onPress={jest.fn()}
        testID="safe-button"
        activeOpacity={0.5}
        disabled={false}
      >
        <Text>Press me</Text>
      </SafeTouchableOpacity>
    );

    const button = getByTestId('safe-button');
    expect(button).toBeTruthy();
    expect(button.props.testID).toBe('safe-button');
  });
});
