# Hook Test Template

Use this template when creating new hook tests:

```javascript
import { renderHook, act } from '@testing-library/react-native';
import useYourHook from '@/hooks/path/to/useYourHook';

// Mock any dependencies the hook uses
jest.mock('@/app/tokenManager', () => ({
  someMethod: jest.fn(),
}));

describe('useYourHook', () => {
  // Setup any parameters or mock functions your hook needs
  const defaultParams = {
    param1: 'value1',
    param2: 'value2',
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('returns the initial state correctly', () => {
    const { result } = renderHook(() => useYourHook(defaultParams));
    
    // Assert that the initial state is correct
    expect(result.current.someState).toBe('initial value');
    expect(result.current.someOtherState).toBe(false);
  });

  it('updates state when a function is called', () => {
    const { result } = renderHook(() => useYourHook(defaultParams));
    
    // Call a function returned by the hook
    act(() => {
      result.current.someFunction('new value');
    });
    
    // Assert that the state was updated correctly
    expect(result.current.someState).toBe('new value');
  });

  it('calls dependencies correctly', () => {
    // Setup specific mock behavior
    const mockDependency = require('@/app/tokenManager').someMethod;
    mockDependency.mockResolvedValue('mocked value');
    
    const { result } = renderHook(() => useYourHook(defaultParams));
    
    // Call a function that should use the dependency
    act(() => {
      result.current.functionThatUsesDependency();
    });
    
    // Assert that the dependency was called correctly
    expect(mockDependency).toHaveBeenCalledWith('expected argument');
  });

  it('behaves differently based on parameters', () => {
    const altParams = {
      ...defaultParams,
      param1: 'different value',
    };
    
    const { result } = renderHook(() => useYourHook(altParams));
    
    // Assert that the hook behaves differently
    expect(result.current.someState).toBe('different initial value');
  });
});
```

## Common Test Patterns

### Testing Initial State

```javascript
it('initializes with correct state', () => {
  const { result } = renderHook(() => useYourHook());
  
  expect(result.current.value).toBe(0);
  expect(result.current.loading).toBe(false);
  expect(result.current.error).toBeNull();
});
```

### Testing State Updates

```javascript
it('updates state correctly', () => {
  const { result } = renderHook(() => useYourHook());
  
  act(() => {
    result.current.increment();
  });
  
  expect(result.current.value).toBe(1);
});
```

### Testing Asynchronous Operations

```javascript
it('handles async operations', async () => {
  // Mock fetch or other async dependencies
  global.fetch = jest.fn(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: 'test data' }),
    })
  );
  
  const { result, waitForNextUpdate } = renderHook(() => useYourHook());
  
  // Initial state
  expect(result.current.loading).toBe(false);
  
  // Start async operation
  act(() => {
    result.current.fetchData();
  });
  
  // State during operation
  expect(result.current.loading).toBe(true);
  
  // Wait for the operation to complete
  await waitForNextUpdate();
  
  // Final state
  expect(result.current.loading).toBe(false);
  expect(result.current.data).toBe('test data');
});
```

### Testing Effects

```javascript
it('runs effect on mount', () => {
  const mockFn = jest.fn();
  
  // Mock a function that should be called in the effect
  jest.mock('@/utils/someUtil', () => ({
    someFunction: () => mockFn(),
  }));
  
  renderHook(() => useYourHook());
  
  // Assert that the effect ran
  expect(mockFn).toHaveBeenCalledTimes(1);
});

it('runs effect when dependencies change', () => {
  const mockFn = jest.fn();
  
  // Mock a function that should be called in the effect
  jest.mock('@/utils/someUtil', () => ({
    someFunction: () => mockFn(),
  }));
  
  const { rerender } = renderHook(
    ({ id }) => useYourHook(id),
    { initialProps: { id: '1' } }
  );
  
  // Effect runs once on mount
  expect(mockFn).toHaveBeenCalledTimes(1);
  
  // Rerender with the same prop (effect should not run again)
  rerender({ id: '1' });
  expect(mockFn).toHaveBeenCalledTimes(1);
  
  // Rerender with a different prop (effect should run again)
  rerender({ id: '2' });
  expect(mockFn).toHaveBeenCalledTimes(2);
});
```

### Testing Cleanup

```javascript
it('cleans up on unmount', () => {
  const mockCleanup = jest.fn();
  
  // Mock a module that provides a cleanup function
  jest.mock('@/utils/someUtil', () => ({
    subscribe: () => mockCleanup,
  }));
  
  const { unmount } = renderHook(() => useYourHook());
  
  // Unmount the hook
  unmount();
  
  // Assert that cleanup was called
  expect(mockCleanup).toHaveBeenCalledTimes(1);
});
``` 