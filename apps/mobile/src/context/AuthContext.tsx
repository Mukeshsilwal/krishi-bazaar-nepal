import React, { createContext, useState, useEffect, useContext } from 'react';
import * as Storage from '../utils/storage';
import { getToken, logout as apiLogout } from '../services/authService';
import { EventEmitter } from '../utils/events';

interface AuthContextType {
    isLoading: boolean;
    userToken: string | null;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState<string | null>(null);

    const checkToken = async () => {
        try {
            const token = await getToken();
            setUserToken(token);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkToken();
        const unsubscribe = EventEmitter.on('logout', signOut);
        return () => {
            unsubscribe();
        };
    }, []);

    const signIn = async (token: string) => {
        setUserToken(token);
        await Storage.setItem('auth_token', token);
    };

    const signOut = async () => {
        await apiLogout();
        setUserToken(null);
    };

    return (
        <AuthContext.Provider value={{ isLoading, userToken, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
