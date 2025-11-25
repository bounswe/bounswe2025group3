import React from 'react';
import { render, fireEvent } from '@/__tests__/test-utils';
import CustomAlert from '../custom-alert';

// Mock the useColors hook
jest.mock('@/constants/colors', () => ({
  useColors: () => ({
    primary: '#10632C',
    error: '#D32F2F',
    text: '#333333',
  }),
}));

describe('CustomAlert', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: 'Test Title',
    message: 'Test Message',
    confirmText: 'Confirm',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when visible is true', () => {
    const { getByText } = render(<CustomAlert {...defaultProps} />);

    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Message')).toBeTruthy();
    expect(getByText('Confirm')).toBeTruthy();
    expect(getByText('common.cancel')).toBeTruthy();
  });

  it('does not render when visible is false', () => {
    const { queryByText } = render(
      <CustomAlert {...defaultProps} visible={false} />
    );

    expect(queryByText('Test Title')).toBeNull();
    expect(queryByText('Test Message')).toBeNull();
  });

  it('displays title and message correctly', () => {
    const { getByText } = render(
      <CustomAlert
        {...defaultProps}
        title="Custom Title"
        message="Custom Message"
      />
    );

    expect(getByText('Custom Title')).toBeTruthy();
    expect(getByText('Custom Message')).toBeTruthy();
  });

  it('calls onClose when cancel button is pressed', () => {
    const onCloseMock = jest.fn();
    const { getByText } = render(
      <CustomAlert {...defaultProps} onClose={onCloseMock} />
    );

    fireEvent.press(getByText('common.cancel'));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when confirm button is pressed', () => {
    const onConfirmMock = jest.fn();
    const { getByText } = render(
      <CustomAlert {...defaultProps} onConfirm={onConfirmMock} />
    );

    fireEvent.press(getByText('Confirm'));
    expect(onConfirmMock).toHaveBeenCalledTimes(1);
  });

  it('displays custom confirm button text', () => {
    const { getByText } = render(
      <CustomAlert {...defaultProps} confirmText="Delete" />
    );

    expect(getByText('Delete')).toBeTruthy();
  });

  it('renders both action buttons', () => {
    const { getByText } = render(<CustomAlert {...defaultProps} />);

    const cancelButton = getByText('common.cancel');
    const confirmButton = getByText('Confirm');

    expect(cancelButton).toBeTruthy();
    expect(confirmButton).toBeTruthy();
  });

  it('cancel button does not call onConfirm', () => {
    const onConfirmMock = jest.fn();
    const { getByText } = render(
      <CustomAlert {...defaultProps} onConfirm={onConfirmMock} />
    );

    fireEvent.press(getByText('common.cancel'));
    expect(onConfirmMock).not.toHaveBeenCalled();
  });

  it('confirm button does not call onClose', () => {
    const onCloseMock = jest.fn();
    const { getByText } = render(
      <CustomAlert {...defaultProps} onClose={onCloseMock} />
    );

    fireEvent.press(getByText('Confirm'));
    expect(onCloseMock).not.toHaveBeenCalled();
  });
});
