import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

/**
 * Decode JWT token and extract permissions
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    /**
     * Fetch permissions from API
     */
    const fetchPermissions = async () => {
        try {
            const response = await authService.getPermissions();
            if (response.code === 0 && Array.isArray(response.data)) {
                setPermissions(response.data);

            } else {
                setPermissions([]);
            }
        } catch (error) {
            setPermissions([]);
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            // Check if user is logged in on mount
            const storedUser = authService.getUser();

            if (storedUser) {
                setUser(storedUser);
                try {
                    await fetchPermissions();
                } catch (error) {
                }

                // Refresh user data from server to get latest fields (like createdAt)
                try {
                    const response = await authService.getCurrentUser();
                    if (response.code === 0 && response.data) {
                        setUser(response.data);
                        localStorage.setItem('user', JSON.stringify(response.data));
                    }
                } catch (err) {
                    // console.error('Failed to refresh user data:', err);
                    // Silent fail is okay here, we have stored user
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (mobileNumber, otp) => {
        try {
            const response = await authService.verifyOtp(mobileNumber, otp);
            if (response.code === 0 && response.data) {
                setUser(response.data.user);
                await fetchPermissions();
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

            const response = await authService.adminLogin(identifier, password);

            if (response.code === 0 && response.data) {

                setUser(response.data.user);
                await fetchPermissions();
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
        setPermissions([]);
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const value = {
        user,
        permissions,
        loading,
        login,
        adminLogin,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
        hasPermission: (permission) => permissions.includes(permission),
        hasAnyPermission: (permissionList) => permissionList.some(p => permissions.includes(p)),
        hasAllPermissions: (permissionList) => permissionList.every(p => permissions.includes(p)),
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
