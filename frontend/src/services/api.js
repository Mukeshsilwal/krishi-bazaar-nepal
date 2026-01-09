import axios from 'axios';
import { toast } from 'sonner';

import { API_URL } from '../config/app';

const API_BASE_URL = API_URL;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    // 'Content-Type': 'application/json', // Let axios set this automatically based on body
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
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

    // Show safe user message from backend if available
    // Show safe user message from backend if available
    if (error.response?.data?.userMessage) {
      toast.error(error.response.data.userMessage);
    } else if (error.message === 'Network Error') {
      toast.error("इन्टरनेट जडानमा समस्या छ। कृपया जाँच गर्नुहोस्।");
    } else if (error.response) {
      // Handle standard HTTP errors
      const status = error.response.status;
      switch (status) {
        case 400:
          // Bad request - often validation errors, usually handled by form
          // Only show if no specific userMessage was sent
          if (!error.response.data?.userMessage) {
            toast.error("आवेदनमा त्रुटि। कृपया विवरण जाँच गर्नुहोस्।");
          }
          break;
        case 401:
          // Handled by refresh logic, but show message if it fails eventually
          if (originalRequest._retry) {
            toast.error("सत्र समाप्त भयो। कृपया पुन: लगइन गर्नुहोस्।");
          }
          break;
        case 403:
          toast.error("तपाईंलाई यो कार्य गर्न अनुमति छैन।");
          break;
        case 404:
          toast.error("अनुरोध गरिएको स्रोत फेला परेन।");
          break;
        case 500:
          toast.error("सर्भरमा समस्या आयो। कृपया केहि समय पछि पुन: प्रयास गर्नुहोस्।");
          break;
        default:
          toast.error("केही गलत भयो। कृपया पुन: प्रयास गर्नुहोस्।");
      }
    } else {
      toast.error("केही गलत भयो। कृपया पुन: प्रयास गर्नुहोस्।");
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
