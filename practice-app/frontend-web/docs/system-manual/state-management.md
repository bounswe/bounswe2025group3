# State Management

## Overview
The Greener frontend uses a combination of Redux Toolkit for global state and React's built-in hooks (`useState`, `useEffect`) for local component state. This approach balances scalability with simplicity, suitable for managing user authentication, API data, and UI state.

## Global State with Redux Toolkit
- **Purpose**: Manages application-wide data, such as user authentication status, user profile, and shared API responses (e.g., waste logs, eco-scores).
- **Setup**:
  - **Store**: Configured in `src/store.js` using `configureStore` from `@reduxjs/toolkit`.
  - **Slices**: Defined in `src/slices/` (e.g., `authSlice.js`, `userSlice.js`).
    - `authSlice`: Handles login status, tokens, and user ID.
    - `userSlice`: Stores user profile data (e.g., username, email, bio).
  - **Provider**: Wraps the app in `src/index.js` with `<Provider store={store}>` from `react-redux`.
- **Key Features**:
  - **Actions**: Defined in slices (e.g., `login`, `logout`, `setUser`).
  - **Reducers**: Manage state updates, e.g., storing tokens in `authSlice`.
  - **Selectors**: Used to access state, e.g., `useSelector((state) => state.auth.isAuthenticated)`.
- **Usage**:
  - Components like `Navbar` use `useSelector` to check `isAuthenticated` and render conditional links.
  - `LoginPage` dispatches `login` action on successful API response, updating tokens in localStorage and state.
  - `Profile` fetches user data via API and updates `userSlice` with `setUser`.

## Local State with React Hooks
- **Purpose**: Handles component-specific state, such as form inputs, loading states, and UI toggles.
- **Tools**:
  - **`useState`**: Manages local data, e.g., form fields in `WasteLog` (`category`, `quantity`).
  - **`useEffect`**: Handles side effects, e.g., fetching waste logs in `WasteLog` on mount.
- **Examples**:
  - **WasteLog.js**: Uses `useState` for form inputs and `useEffect` to fetch subcategories and logs.
  - **ChallengeCard.js**: Uses `useState` to toggle "Join Challenge" button state.
  - **Dashboard.js**: Uses `useState` to store eco-score and quick links data locally after API fetch.

## Data Flow
1. **Initialization**:
   - On app load, `authSlice` checks localStorage for `access_token` to set `isAuthenticated`.
   - Components like `Dashboard` fetch data via `api.js` and store results in Redux or local state.
2. **Updates**:
   - User actions (e.g., logging waste) trigger API calls via `api.js`.
   - Successful responses update Redux (e.g., `userSlice` for profile) or local state (e.g., `WasteLog` form reset).
3. **Propagation**:
   - Redux state changes re-render components via `useSelector`.
   - Local state updates trigger component re-renders via `useState`.

## Best Practices
- **Minimize Global State**: Only store data in Redux if shared across components (e.g., user profile). Use `useState` for transient UI state.
- **Async Handling**: Use `createAsyncThunk` in slices for API calls (e.g., fetching user data).
- **Immutability**: Redux Toolkit uses Immer, allowing direct state mutations in reducers for simplicity.
- **Testing**: Mock Redux store in tests using `@reduxjs/toolkit` utilities (see `docs/testing/`).

## Example
**authSlice.js**:
```javascript
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: !!localStorage.getItem('access_token'),
    accessToken: localStorage.getItem('access_token') || null,
    userId: null,
  },
  reducers: {
    login(state, action) {
      state.isAuthenticated = true;
      state.accessToken = action.payload.access;
      state.userId = action.payload.user_id;
      localStorage.setItem('access_token', action.payload.access);
    },
    logout(state) {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.userId = null;
      localStorage.removeItem('access_token');
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
```
## Why Redux Toolkit?
- Simplicity: Reduces boilerplate compared to vanilla Redux.
- Scalability: Suitable for growing apps with complex state needs.
- Alternative Considered: React Context (lighter but less robust for frequent updates).

