import api from '../../../services/api';
import { AUTH_ENDPOINTS } from '../../../config/endpoints';

const authService = {
    // Register new user (supports optional profile image)
    register: async (userData, profileImage = null) => {
        // If profile image is provided, use multipart/form-data
        if (profileImage) {
            const formData = new FormData();

            // Append all user data fields
            Object.keys(userData).forEach(key => {
                if (userData[key]) {
                    formData.append(key, userData[key]);
                }
            });

            // Append profile image
            formData.append('profileImage', profileImage);

            const response = await api.post(AUTH_ENDPOINTS.REGISTER, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        }

        // Backward compatible: JSON-only request (no image)
        const response = await api.post(AUTH_ENDPOINTS.REGISTER, userData);
        return response.data;
    },

    // Request OTP for login
    login: async (identifier) => {
        const response = await api.post(AUTH_ENDPOINTS.LOGIN, { identifier });
        return response.data;
    },

    // Admin Login (Password based)
    adminLogin: async (identifier, password) => {
        const response = await api.post(AUTH_ENDPOINTS.ADMIN_LOGIN, { identifier, password });
        if (response.data.code === 0 && response.data.data) {
            const { accessToken, refreshToken, user } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));
            return response.data;
        }
        return response.data;
    },

    // Verify OTP and get tokens
    verifyOtp: async (identifier, otp) => {
        const response = await api.post(AUTH_ENDPOINTS.VERIFY_OTP, { identifier, otp });

        if (response.data.code === 0 && response.data.data) {
            const { accessToken, refreshToken, user } = response.data.data;

            // Store tokens and user data
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            return response.data;
        }

        return response.data;
    },

    // Forgot Password (Admin)
    forgotPassword: async (mobileNumber) => {
        const response = await api.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { mobileNumber });
        return response.data;
    },

    // Reset Password (Admin)
    resetPassword: async (data) => {
        const response = await api.post(AUTH_ENDPOINTS.RESET_PASSWORD, data);
        return response.data;
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await api.get(AUTH_ENDPOINTS.ME);
        return response.data;
    },

    // Get user permissions
    getPermissions: async () => {
        const response = await api.get(`${AUTH_ENDPOINTS.ME}/permissions`);
        return response.data;
    },

    // Update user profile
    updateProfile: async (profileData) => {
        const response = await api.put(AUTH_ENDPOINTS.ME, profileData);
        return response.data;
    },

    // Logout
    logout: async () => {
        try {
            await api.post(AUTH_ENDPOINTS.LOGOUT);
        } catch (error) {
            console.error('Logout failed on server', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        }
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('accessToken');
    },

    // Get stored user data
    getUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Get stored access token
    getToken: () => {
        return localStorage.getItem('accessToken');
    },
};

export default authService;
