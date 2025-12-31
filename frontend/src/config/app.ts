
/**
 * Application Configuration
 * Central source of truth for environment variables and global constants.
 */

// Default to 8089 if not specified, matching the backend configuration
export const BACKEND_PORT = 8089;

// Base Backend URL (e.g., http://localhost:8089)
export const BACKEND_URL = import.meta.env.VITE_WS_URL || (import.meta.env.PROD ? 'https://krishi-bazaar-nepal-1.onrender.com' : `http://localhost:${BACKEND_PORT}`);

// API Base URL (e.g., http://localhost:8089/api)
// We prefer VITE_API_URL if set, otherwise construct from BACKEND_URL
export const API_URL = import.meta.env.VITE_API_URL || `${BACKEND_URL}/api`;

export const APP_CONFIG = {
    BACKEND_PORT,
    BACKEND_URL,
    API_URL,
    ENV: import.meta.env.VITE_ENV || 'development'
};

export default APP_CONFIG;
