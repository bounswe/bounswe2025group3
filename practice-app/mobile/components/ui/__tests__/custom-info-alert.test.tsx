import React from 'react';
import { render } from '@/__tests__/test-utils';
import CustomInfoAlert from '../custom-info-alert';

// Mock the useColors hook
jest.mock('@/constants/colors', () => ({
  useColors: () => ({
    primary: '#10632C',
    text: '#333333',
  }),
}));

describe('CustomInfoAlert', () => {
  const defaultProps = {
    visible: true,
    title: 'Info Title',
    message: 'Info Message',
  };

  it('renders when visible is true', () => {
    const { getByText } = render(<CustomInfoAlert {...defaultProps} />);

    expect(getByText('Info Title')).toBeTruthy();
    expect(getByText('Info Message')).toBeTruthy();
  });

  it('does not render when visible is false', () => {
    const { queryByText } = render(
      <CustomInfoAlert {...defaultProps} visible={false} />
    );

    expect(queryByText('Info Title')).toBeNull();
    expect(queryByText('Info Message')).toBeNull();
  });

  it('displays title correctly', () => {
    const { getByText } = render(
      <CustomInfoAlert {...defaultProps} title="Custom Info Title" />
    );

    expect(getByText('Custom Info Title')).toBeTruthy();
  });

  it('displays message correctly', () => {
    const { getByText } = render(
      <CustomInfoAlert {...defaultProps} message="Custom Info Message" />
    );

    expect(getByText('Custom Info Message')).toBeTruthy();
  });

  it('renders both title and message together', () => {
    const { getByText } = render(
      <CustomInfoAlert
        visible={true}
        title="Important Information"
        message="This is important"
      />
    );

    expect(getByText('Important Information')).toBeTruthy();
    expect(getByText('This is important')).toBeTruthy();
  });

  it('does not render action buttons', () => {
    const { queryByText } = render(<CustomInfoAlert {...defaultProps} />);

    // Info alert should not have Cancel or Confirm buttons
    expect(queryByText('Cancel')).toBeNull();
    expect(queryByText('Confirm')).toBeNull();
    expect(queryByText('OK')).toBeNull();
  });

  it('handles empty strings gracefully', () => {
    const { UNSAFE_root } = render(
      <CustomInfoAlert visible={true} title="" message="" />
    );

    // Component should still render even with empty strings
    // The component's structure should be present
    expect(UNSAFE_root).toBeTruthy();
  });
});
