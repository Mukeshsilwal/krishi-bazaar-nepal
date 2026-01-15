import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const storedUser = authService.getUser();
        if (storedUser) {
            setUser(storedUser);

            // Refresh user data from server to get latest fields (like createdAt)
            authService.getCurrentUser()
                .then(response => {
                    if (response.code === 0 && response.data) {
                        setUser(response.data);
                        localStorage.setItem('user', JSON.stringify(response.data));
                    }
                })
                .catch(err => {
                    console.error('Failed to refresh user data:', err);
                });
        }
        setLoading(false);
    }, []);

    const login = async (mobileNumber, otp) => {
        try {
            const response = await authService.verifyOtp(mobileNumber, otp);
            if (response.code === 0 && response.data) {
                setUser(response.data.user);
                return { code: 0, data: response.data };
            }
            return { code: 'ERROR', message: response.message };
        } catch (error) {
            const { resolveUserMessage } = await import('@/utils/errorUtils');
            return {
                code: 'ERROR',
                message: resolveUserMessage(error)
            };
        }
    };

    const adminLogin = async (identifier, password) => {
        try {
            console.log('Attempting admin login for:', identifier);
            const response = await authService.adminLogin(identifier, password);
            console.log('Admin login response:', response);

            if (response.code === 0 && response.data) {
                console.log('Setting user state:', response.data.user);
                setUser(response.data.user);
                return { code: 0, data: response.data };
            }
            return { code: 'ERROR', message: response.message };
        } catch (error) {
            const { resolveUserMessage } = await import('@/utils/errorUtils');
            return {
                code: 'ERROR',
                message: resolveUserMessage(error)
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authService.register(userData);
            return { success: true, data: response.data };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const value = {
        user,
        loading,
        login,
        adminLogin,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
