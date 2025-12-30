import api from './api';

const authService = {
    // Register new user
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    // Request OTP for login
    login: async (mobileNumber) => {
        const response = await api.post('/auth/login', { mobileNumber });
        return response.data;
    },

    // Verify OTP and get tokens
    verifyOtp: async (mobileNumber, otp) => {
        const response = await api.post('/auth/verify-otp', { mobileNumber, otp });

        if (response.data.success && response.data.data) {
            const { accessToken, refreshToken, user } = response.data.data;

            // Store tokens and user data
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            return response.data;
        }

        return response.data;
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    // Update user profile
    updateProfile: async (profileData) => {
        const response = await api.put('/auth/me', profileData);
        return response.data;
    },

    // Logout
    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
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
};

export default authService;
