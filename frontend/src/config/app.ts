
/**
 * Application Configuration
 * Central source of truth for environment variables and global constants.
 */

// Default to 8089 if not specified, matching the backend configuration
export const BACKEND_PORT = 8089;

// API Base URL - uses environment variable or defaults to localhost
export const API_URL = import.meta.env.VITE_API_BASE_URL || `http://localhost:${BACKEND_PORT}/api`;

// WebSocket Base URL - uses environment variable or defaults to localhost
export const WS_URL = import.meta.env.VITE_WS_BASE_URL || `http://localhost:${BACKEND_PORT}/ws`;

// Backend Base URL (derived from API_URL)
export const BACKEND_URL = API_URL.replace('/api', '');

export const APP_CONFIG = {
    BACKEND_PORT,
    BACKEND_URL,
    API_URL,
    WS_URL,
    ENV: import.meta.env.VITE_ENV || 'development'
};

export default APP_CONFIG;
