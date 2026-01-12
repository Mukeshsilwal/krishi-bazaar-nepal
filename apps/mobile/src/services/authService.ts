import api from './api';
import { LoginRequest, VerifyOtpRequest, AuthResponse } from '../types/auth';
import * as Storage from '../utils/storage';

export const login = async (identifier: string): Promise<string> => {
    const response = await api.post<{ data: string }>('/auth/login', { identifier });
    return response.data.data;
};

export const verifyOtp = async (identifier: string, otp: string): Promise<AuthResponse> => {
    const response = await api.post<{ data: AuthResponse }>('/auth/verify-otp', { identifier, otp });
    const authData = response.data.data;

    if (authData.accessToken) {
        await Storage.setItem('auth_token', authData.accessToken);
        await Storage.setItem('user_data', JSON.stringify(authData.user));
    }

    return authData;
};

export const logout = async (): Promise<void> => {
    try {
        await api.post('/auth/logout');
    } finally {
        await Storage.deleteItem('auth_token');
        await Storage.deleteItem('user_data');
    }
};

export const getToken = async () => {
    return await Storage.getItem('auth_token');
};
