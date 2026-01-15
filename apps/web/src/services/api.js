import axios from 'axios';
import { toast } from 'sonner';
import { resolveUserMessage } from '../utils/errorUtils';

import { API_URL } from '../config/app';

const API_BASE_URL = API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    // 'Content-Type': 'application/json', // Let axios set this automatically based on body
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config);
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and global errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Unified Error Handling using Resolver

    const userMessage = resolveUserMessage(error);

    // Avoid duplicate toasts if handled elsewhere? 
    // Actually, we want a global toast for most errors, except maybe 401 which triggers refresh loop.
    // But even 401 might need a message if refresh fails.

    // We only show toast if it's NOT a 401 that is about to be retried
    const isRetryable401 = error.response?.status === 401 && !originalRequest._retry;

    if (!isRetryable401) {
      toast.error(userMessage);
    }


    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Call backend to refresh token
          // Use axios directly to avoid interceptor loop
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
            refreshToken: refreshToken
          });

          if (response.data?.success) {
            const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;

            // Update local storage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            // Update header and retry
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // If refresh fails, clear everything and redirect
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
