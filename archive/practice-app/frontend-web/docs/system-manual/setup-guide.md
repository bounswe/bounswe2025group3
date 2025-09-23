# Setup Guide

## Prerequisites
- **Node.js**: v18.x or later (includes npm).
- **Git**: For cloning the repository.
- **Backend API**: Running at `http://127.0.0.1:8000/api/` (see backend docs at `http://127.0.0.1:8000/api/docs/`).

## Installation
1. **Clone the Repository**:
   ```bash
   git clone <repository-url> (https://github.com/bounswe/bounswe2025group3.git)
   cd practice-app/frontend-web

## Install Dependencies

    npm install react-router-dom @reduxjs/toolkit react-redux axios

## Configure Environment
- Ensure the backend API is running.
- No .env file is needed as api.js uses a hardcoded baseURL (http://127.0.0.1:8000/api/).

## Running the Application
- Development Mode:
    npm start
- Opens http://localhost:3000 in your browser.

## Build for Production
    npm run build
- Outputs optimized files to the build/ directory.

## Run Tests
    npm test
- Launches Jest in watch mode.

## Troubleshooting
- Port Conflict: If 3000 is in use, set PORT environment variable or kill the process.
- API Errors: Verify backend is running and accessible.
- Dependency Issues: Run npm install again or clear node_modules and package-lock.json.












