import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomAlert from '@/components/CustomAlert';

describe('CustomAlert', () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    visible: true,
    title: 'Test Title',
    message: 'Test Message',
    onClose: mockOnClose,
  };

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders correctly with default props', () => {
    const { getByText } = render(<CustomAlert {...defaultProps} />);
    
    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Message')).toBeTruthy();
    expect(getByText('Close')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const { getByText } = render(<CustomAlert {...defaultProps} />);
    
    fireEvent.press(getByText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders success type correctly', () => {
    const { UNSAFE_getByType } = render(
      <CustomAlert {...defaultProps} type="success" />
    );
    
    const icon = UNSAFE_getByType('Ionicons');
    expect(icon.props.name).toBe('checkmark-circle');
  });

  it('renders error type correctly', () => {
    const { UNSAFE_getByType } = render(
      <CustomAlert {...defaultProps} type="error" />
    );
    
    const icon = UNSAFE_getByType('Ionicons');
    expect(icon.props.name).toBe('alert-circle');
  });

  it('is not visible when visible prop is false', () => {
    const { UNSAFE_getByProps } = render(
      <CustomAlert {...defaultProps} visible={false} />
    );
    
    const modal = UNSAFE_getByProps({ visible: false });
    expect(modal).toBeTruthy();
  });
}); 