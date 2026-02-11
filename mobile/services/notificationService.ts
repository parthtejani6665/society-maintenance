import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import axios from 'axios';
import { API_ROOT } from './api';
import api from './api';
import * as SecureStore from 'expo-secure-store';

// Helper to check if we should skip notifications (Android Expo Go SDK 53+)
const shouldSkipNotifications = () => {
    return Platform.OS === 'android' && Constants.appOwnership === 'expo';
};

export const notificationService = {
    registerForPushNotificationsAsync: async () => {
        if (shouldSkipNotifications()) {
            console.warn('Push Notifications: Skipping Android Expo Go (SDK 53+) to avoid remote notification errors.');
            return;
        }

        // Lazy load expo-notifications to avoid top-level import error in Expo Go
        const Notifications = require('expo-notifications');

        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return;
            }

            try {
                // Determine if we should use FCM token directly or Expo token
                if (Platform.OS === 'android') {
                    token = (await Notifications.getDevicePushTokenAsync()).data;
                    console.log('Android Device (FCM) Token:', token);
                } else {
                    const projectId =
                        Constants?.expoConfig?.extra?.eas?.projectId ??
                        Constants?.easConfig?.projectId;

                    if (!projectId || typeof projectId !== 'string' || projectId.length < 10) {
                        console.warn('Push Notifications: No valid EAS Project ID found. Skipping token registration.');
                        return;
                    }

                    token = (await Notifications.getExpoPushTokenAsync({
                        projectId,
                    })).data;
                    console.log('iOS Expo Push Token:', token);
                }
            } catch (e: any) {
                console.error('Error getting push token:', e.message || e);
            }
        } else {
            console.log('Must use physical device for Push Notifications');
        }

        return token;
    },

    updatePushTokenOnBackend: async (token: string) => {
        try {
            await api.post('/auth/register-push-token', { token });
            console.log('Push token successfully registered on backend');
        } catch (error) {
            console.error('Error updating push token on backend:', error);
        }
    },

    // Initialize and register
    initialize: async () => {
        if (shouldSkipNotifications()) {
            console.log('Skipping notification initialization in Expo Go (SDK 53+)');
            return;
        }

        try {
            // Lazy load expo-notifications
            const Notifications = require('expo-notifications');

            Notifications.setNotificationHandler({
                handleNotification: async () => ({
                    shouldShowAlert: true,
                    shouldPlaySound: true,
                    shouldSetBadge: false,
                    shouldShowBanner: true,
                    shouldShowList: true,
                }),
            });

            // Foreground notification listener
            Notifications.addNotificationReceivedListener((notification: any) => {
                console.log('🔔 Notification Received in Foreground:', {
                    title: notification.request.content.title,
                    body: notification.request.content.body,
                    data: notification.request.content.data,
                });
            });

            // Notification interaction listener (when user taps notification)
            Notifications.addNotificationResponseReceivedListener((response: any) => {
                console.log('👆 Notification Tapped:', {
                    actionIdentifier: response.actionIdentifier,
                    data: response.notification.request.content.data,
                });
            });

            const token = await notificationService.registerForPushNotificationsAsync();
            if (token) {
                await notificationService.updatePushTokenOnBackend(token);
            }
        } catch (error) {
            console.error('Error during notification initialization:', error);
        }
    }
};
