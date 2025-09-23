# Testing Guide

## Overview
The Greener frontend uses Jest and React Testing Library for unit and integration tests, configured via Create React App.

## Running Tests
1. **Run All Tests**:
   ```bash
   npm test

- Launches Jest in watch mode.
- Press a to run all tests, or select specific files.

- Single Test File:
    npm test src/App.test.js

- Coverage Report:
    npm test -- --coverage

## Writing Tests
- Location: Place test files alongside components (e.g., Component.test.js).
- Tools:
    - React Testing Library: render, screen, fireEvent for DOM interactions.
    - Jest: Assertions (expect) and mocks.
    - @testing-library/user-event: Simulates user interactions like typing and clicking.

## Best Practices
- Test user-facing behavior, not implementation details.
- Mock API calls using Jest's jest.fn() or mock modules.
- Use data-testid attributes for stable DOM queries.
- Cover critical paths: rendering, user interactions, error states.

## Example Test
- See docs/testing/sample-tests.md for a sample unit test for LoginPage.js.