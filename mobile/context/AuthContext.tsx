import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { notificationService } from '../services/notificationService';
import api from '../services/api';

interface AuthContextType {
    user: any | null;
    isLoading: boolean;
    signIn: (token: string, userData: any) => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            console.log('Auth: Loading user from storage...');
            try {
                const token = await SecureStore.getItemAsync('token');
                const userData = await SecureStore.getItemAsync('user');

                if (token && userData) {
                    // 1. Set initial state from storage for immediate UI
                    const parsedUser = JSON.parse(userData);
                    setUser(parsedUser);

                    // 2. Fetch fresh user data from backend
                    try {
                        console.log('Auth: Fetching fresh user data...');
                        // We need to set the token for the api instance manually here or relies on the interceptor reading from SecureStore.
                        // The interceptor reads from SecureStore, so it should be fine.
                        const response = await api.get('/auth/me');
                        const freshUser = response.data;

                        console.log('Auth: Fresh user data received:', freshUser.role);

                        // Update storage and state
                        await SecureStore.setItemAsync('user', JSON.stringify(freshUser));
                        setUser(freshUser);

                        notificationService.initialize();
                    } catch (apiError: any) {
                        console.error('Auth: Failed to fetch fresh user data', apiError);

                        // If token is invalid/expired or user is deactivated (401/403)
                        if (apiError.response && (apiError.response.status === 401 || apiError.response.status === 403)) {
                            console.warn('Auth: Session invalid, signing out.');
                            await signOut();
                            return;
                        }
                        // For other errors (network), we keep the stale user logged in
                        notificationService.initialize();
                    }
                }
            } catch (e) {
                console.error('Auth: Failed to load user', e);
            } finally {
                console.log('Auth: Load complete');
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    const signIn = async (token: string, userData: any) => {
        try {
            await SecureStore.setItemAsync('token', token);
            await SecureStore.setItemAsync('user', JSON.stringify(userData));
            setUser(userData);
            // Register push token after sign in
            notificationService.initialize();
        } catch (error) {
            console.error('Sign in error:', error);
        }
    };

    const signOut = async () => {
        try {
            await SecureStore.deleteItemAsync('token');
            await SecureStore.deleteItemAsync('user');
            setUser(null);
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    const refreshUser = async () => {
        try {
            console.log('Auth: Refreshing user data...');
            const response = await api.get('/auth/me');
            const freshUser = response.data;
            await SecureStore.setItemAsync('user', JSON.stringify(freshUser));
            setUser(freshUser);
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signOut, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};
