# Utility Test Template

Use this template when creating new utility function tests:

```javascript
import { yourUtilityFunction } from '@/utils/path/to/yourUtils';

// Mock any dependencies the utility uses
jest.mock('@/api/someApi', () => ({
  fetchSomething: jest.fn(),
}));

describe('yourUtilityFunction', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('returns the expected result for valid input', () => {
    // Setup test inputs
    const input = 'test input';
    
    // Call the function
    const result = yourUtilityFunction(input);
    
    // Assert the result is correct
    expect(result).toBe('expected output');
  });

  it('handles edge cases correctly', () => {
    // Test with empty input
    expect(yourUtilityFunction('')).toBe('default output');
    
    // Test with null input
    expect(yourUtilityFunction(null)).toBe('default output');
    
    // Test with numeric input
    expect(yourUtilityFunction(123)).toBe('numeric output');
  });

  it('throws error for invalid input', () => {
    // Assert that the function throws an error
    expect(() => yourUtilityFunction(undefined)).toThrow('Invalid input');
  });

  it('calls dependencies with correct arguments', () => {
    // Setup specific mock behavior
    const mockDependency = require('@/api/someApi').fetchSomething;
    mockDependency.mockResolvedValue('mocked response');
    
    // Call the function
    yourUtilityFunction('input that uses dependency');
    
    // Assert the dependency was called correctly
    expect(mockDependency).toHaveBeenCalledWith('expected argument');
  });
});
```

## Common Test Patterns

### Testing Pure Functions

```javascript
describe('formatCurrency', () => {
  it('formats numbers as currency', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(0)).toBe('$0.00');
  });
  
  it('handles negative numbers', () => {
    expect(formatCurrency(-1000)).toBe('-$1,000.00');
  });
  
  it('handles different currencies', () => {
    expect(formatCurrency(1000, 'EUR')).toBe('€1,000.00');
    expect(formatCurrency(1000, 'GBP')).toBe('£1,000.00');
  });
});
```

### Testing Async Functions

```javascript
describe('fetchUserData', () => {
  // Mock the fetch API
  global.fetch = jest.fn();
  
  it('returns user data when successful', async () => {
    // Setup mock response
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '123', name: 'Test User' }),
    });
    
    // Call the function
    const result = await fetchUserData('123');
    
    // Assert the result is correct
    expect(result).toEqual({ id: '123', name: 'Test User' });
    
    // Assert that fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/users/123',
      expect.any(Object)
    );
  });
  
  it('throws an error when request fails', async () => {
    // Setup mock response
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });
    
    // Assert that the function throws an error
    await expect(fetchUserData('nonexistent')).rejects.toThrow(
      'Failed to fetch user: Not Found'
    );
  });
});
```

### Testing Error Handling

```javascript
describe('parseJSON', () => {
  it('parses valid JSON', () => {
    expect(parseJSON('{"key":"value"}')).toEqual({ key: 'value' });
  });
  
  it('returns default value for invalid JSON', () => {
    expect(parseJSON('invalid json', { default: true })).toEqual({ default: true });
  });
  
  it('logs error for invalid JSON when specified', () => {
    // Mock console.error
    console.error = jest.fn();
    
    parseJSON('invalid json', {}, true);
    
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error parsing JSON')
    );
  });
});
```

### Testing Class Methods

```javascript
import DataProcessor from '@/utils/DataProcessor';

describe('DataProcessor', () => {
  let processor;
  
  beforeEach(() => {
    processor = new DataProcessor({ option1: true });
  });
  
  it('processes data correctly', () => {
    const input = [1, 2, 3];
    const result = processor.process(input);
    
    expect(result).toEqual([2, 4, 6]);
  });
  
  it('filters data based on options', () => {
    processor = new DataProcessor({ option1: true, threshold: 5 });
    
    const input = [1, 3, 5, 7, 9];
    const result = processor.process(input);
    
    expect(result).toEqual([10, 14, 18]);
  });
  
  it('throws error for invalid data', () => {
    expect(() => processor.process(null)).toThrow('Invalid data');
  });
});
```

### Testing With Dependencies

```javascript
import { processOrder } from '@/utils/orderUtils';
import { calculateTax } from '@/utils/taxUtils';
import { sendEmail } from '@/utils/emailUtils';

// Mock dependencies
jest.mock('@/utils/taxUtils', () => ({
  calculateTax: jest.fn(),
}));

jest.mock('@/utils/emailUtils', () => ({
  sendEmail: jest.fn(),
}));

describe('processOrder', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock behaviors
    calculateTax.mockReturnValue(10);
    sendEmail.mockResolvedValue(true);
  });
  
  it('processes order correctly', async () => {
    const order = {
      id: '123',
      items: [{ id: 'item1', price: 100 }],
      customer: { email: 'test@example.com' },
    };
    
    const result = await processOrder(order);
    
    expect(result.total).toBe(110); // 100 + 10 tax
    expect(calculateTax).toHaveBeenCalledWith(100);
    expect(sendEmail).toHaveBeenCalledWith(
      'test@example.com',
      expect.stringContaining('Order Confirmation'),
      expect.anything()
    );
  });
  
  it('handles failed email sending', async () => {
    // Override the default mock behavior
    sendEmail.mockRejectedValue(new Error('Failed to send'));
    
    const order = {
      id: '123',
      items: [{ id: 'item1', price: 100 }],
      customer: { email: 'test@example.com' },
    };
    
    const result = await processOrder(order);
    
    expect(result.total).toBe(110);
    expect(result.emailSent).toBe(false);
  });
});
``` 