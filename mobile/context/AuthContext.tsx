import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { notificationService } from '../services/notificationService';

interface AuthContextType {
    user: any | null;
    isLoading: boolean;
    signIn: (token: string, userData: any) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            console.log('Auth: Loading user from storage...');
            const timeoutId = setTimeout(() => {
                if (isLoading) {
                    console.warn('Auth: SecureStore load timed out, forcing isLoading to false');
                    setIsLoading(false);
                }
            }, 8000);

            try {
                const token = await SecureStore.getItemAsync('token');
                const userData = await SecureStore.getItemAsync('user');
                console.log('Auth: Storage result:', { hasToken: !!token, hasUserData: !!userData });
                if (token && userData) {
                    try {
                        const parsedUser = JSON.parse(userData);
                        setUser(parsedUser);
                        // Register push token after loading user
                        notificationService.initialize();
                    } catch (e) {
                        console.error('Auth: Failed to parse userData', e);
                        await SecureStore.deleteItemAsync('user');
                        await SecureStore.deleteItemAsync('token');
                    }
                }
            } catch (e) {
                console.error('Auth: Failed to load user', e);
            } finally {
                clearTimeout(timeoutId);
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

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
