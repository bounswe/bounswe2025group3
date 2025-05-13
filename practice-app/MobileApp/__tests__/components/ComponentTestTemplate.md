# Component Test Template

Use this template when creating new component tests:

```javascript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import YourComponent from '@/components/path/to/YourComponent';

// Mock any dependencies the component uses
jest.mock('@/hooks/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(() => 'light'),
}));

describe('YourComponent', () => {
  // Setup any props or mock functions your component needs
  const defaultProps = {
    prop1: 'value1',
    prop2: 'value2',
    onSomeEvent: jest.fn(),
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    const { getByText, getByTestId } = render(<YourComponent {...defaultProps} />);
    
    // Assert that the component renders correctly
    expect(getByText('Expected Text')).toBeTruthy();
    expect(getByTestId('some-element')).toBeTruthy();
  });

  it('handles user interaction correctly', () => {
    const { getByText } = render(<YourComponent {...defaultProps} />);
    
    // Simulate user interaction
    fireEvent.press(getByText('Button Text'));
    
    // Assert that the expected behavior occurred
    expect(defaultProps.onSomeEvent).toHaveBeenCalledTimes(1);
  });

  it('renders differently based on props', () => {
    const altProps = {
      ...defaultProps,
      prop1: 'different value',
    };
    
    const { getByText } = render(<YourComponent {...altProps} />);
    
    // Assert that the component renders differently
    expect(getByText('Different Expected Text')).toBeTruthy();
  });

  it('updates when state changes', () => {
    const { getByText, getByTestId } = render(<YourComponent {...defaultProps} />);
    
    // Interact with component to change state
    fireEvent.changeText(getByTestId('input'), 'new value');
    
    // Assert that the component updated correctly
    expect(getByText('new value')).toBeTruthy();
  });
});
```

## Common Test Patterns

### Testing Rendered Output

```javascript
// Check if an element with the given text exists
expect(getByText('Some Text')).toBeTruthy();

// Check if an element with the given testID exists
expect(getByTestId('element-id')).toBeTruthy();

// Check props of a specific element
const element = getByTestId('element-id');
expect(element.props.style).toEqual(
  expect.objectContaining({
    color: '#FF0000',
  })
);
```

### Testing User Interactions

```javascript
// Test button press
fireEvent.press(getByText('Button Text'));
expect(mockOnPress).toHaveBeenCalledTimes(1);

// Test text input
fireEvent.changeText(getByTestId('input'), 'new text');
expect(getByDisplayValue('new text')).toBeTruthy();
```

### Testing Conditional Rendering

```javascript
// Test component renders something when condition is true
const { getByText, rerender } = render(<YourComponent condition={true} />);
expect(getByText('Shown when true')).toBeTruthy();

// Test component renders something else when condition is false
rerender(<YourComponent condition={false} />);
expect(getByText('Shown when false')).toBeTruthy();
```

### Testing with Context

```javascript
// Create a wrapper component that provides the context
const wrapper = ({ children }) => (
  <ThemeContext.Provider value="dark">
    {children}
  </ThemeContext.Provider>
);

// Use the wrapper when rendering
const { getByText } = render(<YourComponent />, { wrapper });
```

## Testing Asynchronous Components

```javascript
it('loads data asynchronously', async () => {
  // Mock an async function
  global.fetch = jest.fn(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: 'test data' }),
    })
  );

  const { getByText, findByText } = render(<YourAsyncComponent />);
  
  // Check loading state
  expect(getByText('Loading...')).toBeTruthy();
  
  // Wait for data to load
  const dataElement = await findByText('test data');
  expect(dataElement).toBeTruthy();
  
  // Check that fetch was called correctly
  expect(global.fetch).toHaveBeenCalledWith('https://example.com/api');
});
``` 