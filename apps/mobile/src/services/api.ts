import axios from 'axios';
import * as Storage from '../utils/storage';
import { EventEmitter } from '../utils/events';

import { Platform } from 'react-native';

const getBaseUrl = () => {
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:8089/api';
    }
    return 'http://localhost:8089/api';
};

export const API_URL = getBaseUrl();

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        const token = await Storage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            await Storage.deleteItem('auth_token');
            EventEmitter.emit('logout');
        }
        return Promise.reject(error);
    }
);

export default api;
