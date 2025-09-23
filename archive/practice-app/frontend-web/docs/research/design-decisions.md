# Design Decisions

## Component-Based Architecture
- **Why**: React's component model promotes reusability and maintainability.
- **Impact**: Components like `Navbar` and `ChallengeCard` are reusable across pages.

## Redux Toolkit for State Management
- **Why**: Simplifies Redux boilerplate, suitable for managing user sessions and API data.
- **Alternative Considered**: React Context (lighter but less robust for complex state).

## Axios with Interceptors
- **Why**: Centralized token management for authenticated API requests.
- **Alternative Considered**: Fetch API (native but requires more manual configuration).

## CSS Modules
- **Why**: Scoped styles prevent conflicts, unlike global CSS or inline styles.
- **Alternative Considered**: Styled-components (adds runtime overhead).

## Create React App
- **Why**: Quick setup with pre-configured tools, ideal for student projects.
- **Alternative Considered**: Vite (faster but less mature at project start).

## Authentication Flow
- **Why**: JWT-based authentication stored in localStorage for simplicity.
- **Trade-off**: Security risks mitigated by short-lived tokens and secure backend.

## Progressive Web App (PWA) Support
- **Why**: `manifest.json` and service workers enable offline capabilities and app-like experience.
- **Impact**: Enhances user engagement, especially on mobile.