# Technology Stack

## Overview
The Greener frontend is built using modern JavaScript technologies to ensure a responsive, scalable, and maintainable application.

## Core Technologies
- **React (v19.1.0)**: A JavaScript library for building user interfaces, chosen for its component-based architecture and ecosystem.
- **React Router (v7.5.3)**: Handles client-side routing, enabling seamless navigation across pages like Home, Dashboard, and Profile.
- **Axios (v1.9.0)**: Used for making HTTP requests to the backend API, with interceptors for token-based authentication.
- **Redux Toolkit (v2.8.0)**: Manages global state for user authentication, waste logs, and other shared data.
- **Create React App (v5.0.1)**: Bootstrapped the project, providing a pre-configured development environment with Webpack, Babel, and ESLint.

## Testing
- **Jest**: Integrated via Create React App for unit and integration testing.
- **React Testing Library (v16.3.0)**: Facilitates testing React components by simulating user interactions.

## Styling
- **CSS Modules**: Scoped CSS files (e.g., `Home.css`, `Dashboard.css`) ensure styles are component-specific and avoid conflicts.
- **Global Styles**: `index.css` and `App.css` for shared styles like typography and layout.

## Why This Stack?
- **React**: Industry-standard, supports reusable components, and has a vast community.
- **Redux Toolkit**: Simplifies state management compared to vanilla Redux.
- **Axios**: Lightweight and flexible for API interactions.
- **Create React App**: Reduces setup time, ideal for rapid prototyping and development.