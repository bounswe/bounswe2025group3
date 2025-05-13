/**
 * Docker environment detection and configuration
 * This file helps determine if we're running in a Docker container
 * and provides proper API URLs for services
 */

// Check if we're in a dockerized environment
export const isDockerized = () => {
  // Check for Docker-specific environment variables
  return (
    typeof process !== 'undefined' &&
    (process.env.EXPO_DOCKER_BACKEND_URL !== undefined || 
     process.env.REACT_NATIVE_BACKEND_URL !== undefined ||
     process.env.EXPO_TUNNEL === 'true')
  );
};

// Check if we're running in Expo tunnel mode
export const isTunnelMode = () => {
  // In browser, we can check the URL for exp.direct
  if (typeof window !== 'undefined' && window.location) {
    return window.location.hostname.includes('exp.direct');
  }
  // For native, check environment variable
  return process.env.EXPO_TUNNEL === 'true';
};

// Backend base URL that works in Docker environment
export const DOCKER_BACKEND_URL = 'http://backend:8000';

// Public backend URL (for devices that can't access Docker network directly)
export const PUBLIC_BACKEND_URL = 'http://127.0.0.1:8000';

// Public tunnel URL (for accessing via QR code)
export const TUNNEL_BACKEND_URL = 'http://10.0.2.2:8000'; 