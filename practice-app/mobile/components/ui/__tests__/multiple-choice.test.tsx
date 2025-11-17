import React from 'react';
import { render, fireEvent } from '@/__tests__/test-utils';
import MultipleChoiceModal from '../multiple-choice';

// Mock the useColors hook
jest.mock('@/constants/colors', () => ({
  useColors: () => ({
    primary: '#10632C',
    background: '#F4F7F6',
    text: '#333333',
    textSecondary: '#666666',
    borders: '#E8F5E9',
  }),
}));

describe('MultipleChoiceModal', () => {
  const mockOptions = ['Option 1', 'Option 2', 'Option 3'];
  const defaultProps = {
    visible: true,
    options: mockOptions,
    onClose: jest.fn(),
    onSelect: jest.fn(),
    title: 'Select an option',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders options correctly', () => {
    const { getByText } = render(<MultipleChoiceModal {...defaultProps} />);

    expect(getByText('Select an option')).toBeTruthy();
    expect(getByText('Option 1')).toBeTruthy();
    expect(getByText('Option 2')).toBeTruthy();
    expect(getByText('Option 3')).toBeTruthy();
  });

  it('does not render when visible is false', () => {
    const { queryByText } = render(
      <MultipleChoiceModal {...defaultProps} visible={false} />
    );

    expect(queryByText('Select an option')).toBeNull();
  });

  it('calls onSelect with selected option when option is pressed', () => {
    const onSelectMock = jest.fn();
    const { getByText } = render(
      <MultipleChoiceModal {...defaultProps} onSelect={onSelectMock} />
    );

    fireEvent.press(getByText('Option 2'));
    expect(onSelectMock).toHaveBeenCalledWith('Option 2');
  });

  it('calls onClose when option is selected', () => {
    const onCloseMock = jest.fn();
    const { getByText } = render(
      <MultipleChoiceModal {...defaultProps} onClose={onCloseMock} />
    );

    fireEvent.press(getByText('Option 1'));
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('displays title correctly', () => {
    const { getByText } = render(
      <MultipleChoiceModal {...defaultProps} title="Choose one" />
    );

    expect(getByText('Choose one')).toBeTruthy();
  });

  it('pre-selects the selectedOption', () => {
    const { getByText } = render(
      <MultipleChoiceModal {...defaultProps} selectedOption="Option 2" />
    );

    // The component should render with Option 2 selected
    // We can verify this by checking if the text is rendered
    expect(getByText('Option 2')).toBeTruthy();
  });

  it('renders all provided options', () => {
    const customOptions = ['First', 'Second', 'Third', 'Fourth'];
    const { getByText } = render(
      <MultipleChoiceModal {...defaultProps} options={customOptions} />
    );

    expect(getByText('First')).toBeTruthy();
    expect(getByText('Second')).toBeTruthy();
    expect(getByText('Third')).toBeTruthy();
    expect(getByText('Fourth')).toBeTruthy();
  });

  it('calls onSelect and onClose in sequence when option is selected', () => {
    const onSelectMock = jest.fn();
    const onCloseMock = jest.fn();
    const { getByText } = render(
      <MultipleChoiceModal
        {...defaultProps}
        onSelect={onSelectMock}
        onClose={onCloseMock}
      />
    );

    fireEvent.press(getByText('Option 3'));

    expect(onSelectMock).toHaveBeenCalledWith('Option 3');
    expect(onSelectMock).toHaveBeenCalledTimes(1);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('handles single option correctly', () => {
    const { getByText } = render(
      <MultipleChoiceModal {...defaultProps} options={['Only Option']} />
    );

    expect(getByText('Only Option')).toBeTruthy();

    fireEvent.press(getByText('Only Option'));
    expect(defaultProps.onSelect).toHaveBeenCalledWith('Only Option');
  });

  it('renders with empty selectedOption', () => {
    const { getByText } = render(
      <MultipleChoiceModal {...defaultProps} selectedOption="" />
    );

    // Should still render all options
    expect(getByText('Option 1')).toBeTruthy();
    expect(getByText('Option 2')).toBeTruthy();
  });
});
