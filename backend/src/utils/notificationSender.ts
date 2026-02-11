import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import admin from '../config/firebase';
import User from '../models/User';

const expo = new Expo();

/**
 * Sends a push notification to a single user.
 * It detects if the token is an Expo token or a direct FCM token.
 */
export const sendPushNotification = async (
    userId: string,
    title: string,
    body: string,
    data?: any
) => {
    try {
        const user = await User.findByPk(userId);
        if (!user || !user.pushToken) {
            console.log(`No push token found for user ${userId}`);
            return;
        }

        const token = user.pushToken;

        // 1. Check if it's an Expo Push Token
        if (Expo.isExpoPushToken(token)) {
            const messages: ExpoPushMessage[] = [{
                to: token,
                sound: 'default',
                title,
                body,
                data,
            }];

            const chunks = expo.chunkPushNotifications(messages);
            for (const chunk of chunks) {
                try {
                    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                    console.log('Expo Notification tickets:', ticketChunk);
                } catch (error) {
                    console.error('Error sending Expo notification chunk:', error);
                }
            }
        }
        // 2. Otherwise, treat it as a direct FCM token
        else {
            const message = {
                notification: {
                    title,
                    body,
                },
                data: data ? { ...data, id: String(data.id || '') } : {},
                token: token,
            };

            try {
                const response = await admin.messaging().send(message);
                console.log('FCM Notification sent successfully:', response);
            } catch (error) {
                console.error('Error sending FCM notification:', error);
            }
        }
    } catch (error) {
        console.error('Error in sendPushNotification:', error);
    }
};

/**
 * Sends a push notification to multiple users.
 * Batches tokens by type (Expo vs FCM).
 */
export const sendToMultipleUsers = async (
    userIds: string[],
    title: string,
    body: string,
    data?: any
) => {
    try {
        const users = await User.findAll({
            where: {
                id: userIds,
            },
            attributes: ['pushToken'],
        });

        const expoTokens: string[] = [];
        const fcmTokens: string[] = [];

        users.forEach(u => {
            if (u.pushToken) {
                if (Expo.isExpoPushToken(u.pushToken)) {
                    expoTokens.push(u.pushToken);
                } else {
                    fcmTokens.push(u.pushToken);
                }
            }
        });

        // 1. Send via Expo
        if (expoTokens.length > 0) {
            const messages: ExpoPushMessage[] = expoTokens.map(token => ({
                to: token,
                sound: 'default',
                title,
                body,
                data,
            }));

            const chunks = expo.chunkPushNotifications(messages);
            for (const chunk of chunks) {
                try {
                    await expo.sendPushNotificationsAsync(chunk);
                } catch (error) {
                    console.error('Error sending Expo notification chunk:', error);
                }
            }
        }

        // 2. Send via FCM
        if (fcmTokens.length > 0) {
            const message = {
                notification: {
                    title,
                    body,
                },
                data: data ? { ...data, id: String(data.id || '') } : {},
                tokens: fcmTokens,
            };

            try {
                const response = await admin.messaging().sendEachForMulticast(message);
                console.log('FCM Multicast sent successfully:', response.successCount);
            } catch (error) {
                console.error('Error sending FCM Multicast:', error);
            }
        }
    } catch (error) {
        console.error('Error in sendToMultipleUsers:', error);
    }
};
