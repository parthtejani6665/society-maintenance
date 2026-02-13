import { Stack, Redirect, useSegments, useRouter } from 'expo-router';
import { View, ActivityIndicator, Platform } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { useEffect } from 'react';
import Constants from 'expo-constants';
import '../i18n';

function InitialLayout() {
    const { user, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        // Guard for Android Expo Go SDK 54
        if (Platform.OS === 'android' && Constants.appOwnership === 'expo') {
            console.log('Skipping notification listeners in Expo Go (SDK 54)');
            return;
        }

        try {
            // Lazy load expo-notifications
            const Notifications = require('expo-notifications');

            // Handle notification response (when user taps notification)
            const subscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
                const data = response.notification.request.content.data;

                if (data?.screen) {
                    console.log('Deep-linking to:', data.screen, data.id);

                    let targetPath = '';
                    switch (data.screen) {
                        case 'complaint-details':
                            targetPath = `/complaints/${data.id}`;
                            break;
                        case 'notices':
                            targetPath = '/notices';
                            break;
                        case 'maintenance':
                            targetPath = '/(tabs)/maintenance';
                            break;
                        case 'amenities/my-bookings':
                            targetPath = '/amenities/my-bookings';
                            break;
                        case 'amenities/manage-bookings':
                            targetPath = '/amenities/manage-bookings';
                            break;
                        default:
                            targetPath = '/(tabs)';
                    }

                    if (targetPath) {
                        // Use setTimeout to ensure the navigation container is ready
                        setTimeout(() => {
                            router.push(targetPath as any);
                        }, 500);
                    }
                }
            });

            return () => subscription.remove();
        } catch (error) {
            console.error('Error setting up notification listeners:', error);
        }
    }, []);

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    const inAuthGroup = segments[0] === '(auth)';

    // Redirect if not logged in and not in auth group
    if (!user && !inAuthGroup) {
        return <Redirect href="/(auth)/login" />;
    }

    // Redirect if logged in and in auth group
    if (user && inAuthGroup) {
        return <Redirect href="/(tabs)" />;
    }

    // Redirect if logged in and at root index
    if (user && !segments[0]) {
        return <Redirect href="/(tabs)" />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="users/[id]" options={{ headerShown: false }} />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <InitialLayout />
            </ThemeProvider>
        </AuthProvider>
    );
}
