# Frontend Architecture

## Overview
The Greener frontend follows a component-based architecture with a clear separation of concerns, leveraging React's modularity.

## Directory Structure
- **src/components/**: Houses reusable and page-specific components, organized by feature (e.g., `auth/`, `dashboard/`).
- **src/services/**: Contains API service logic (`api.js`) for backend communication.
- **src/public/**: Static assets like icons, favicon, and manifest for PWA support.
- **src/**: Root files like `App.js` (main app component), `index.js` (entry point), and global styles.

## Component Hierarchy
- **App.js**: Root component, sets up routing with `react-router-dom`.
- **Pages**: Top-level components like `Home`, `Dashboard`, `Profile`, each corresponding to a route.
- **Common Components**: `Navbar` for navigation, reused across authenticated pages.
- **Feature Components**: Specific to pages, e.g., `ChallengeCard` in `ChallengesPage`.

## Data Flow
- **State Management**: Redux Toolkit manages global state (e.g., user authentication, waste logs).
- **API Integration**: Axios in `api.js` handles requests, with interceptors adding JWT tokens.
- **Local State**: React's `useState` and `useEffect` for component-specific state (e.g., form inputs in `WasteLog`).

## Routing
- Uses `react-router-dom` for client-side routing.
- Routes defined in `App.js`, mapping paths (e.g., `/dashboard`, `/waste`) to components.

## Scalability Considerations
- Modular components allow easy addition of new features.
- CSS Modules prevent style conflicts.
- Redux Toolkit's slice-based approach simplifies state management for future growth.