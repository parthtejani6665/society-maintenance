import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Bell, CheckCircle2, Clock, AlertCircle, Info } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { notificationService } from '../services/notificationService';
import { Theme } from '../constants/Theme';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'complaint' | 'maintenance' | 'notice';
    isRead: boolean;
    createdAt: string;
}

export default function NotificationsScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.fetchNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'complaint': return AlertCircle;
            case 'maintenance': return Clock; // or CreditCard if available
            case 'notice': return Info;
            default: return Bell;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'complaint': return Theme.colors.status.danger;
            case 'maintenance': return Theme.colors.status.warning;
            case 'notice': return Theme.colors.status.info;
            default: return Theme.colors.primary;
        }
    };

    const renderItem = ({ item }: { item: Notification }) => {
        const icon = getIcon(item.type);
        const color = getColor(item.type);

        return (
            <TouchableOpacity
                onPress={() => !item.isRead && handleMarkAsRead(item.id)}
                activeOpacity={0.8}
                className="mb-4"
            >
                <Card className={`p-4 ${item.isRead ? 'bg-white opacity-80' : 'bg-blue-50/50 border-l-4 border-blue-500'}`}>
                    <View className="flex-row">
                        <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${item.isRead ? 'bg-slate-100' : 'bg-white shadow-sm'}`}>
                            <Icon icon={icon} color={item.isRead ? '#94a3b8' : color} size={20} />
                        </View>
                        <View className="flex-1">
                            <View className="flex-row justify-between items-start mb-1">
                                <Text className={`text-sm font-bold flex-1 mr-2 ${item.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                                    {item.title}
                                </Text>
                                <Text className="text-[10px] text-slate-400 font-bold uppercase">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                            <Text className={`text-xs leading-5 ${item.isRead ? 'text-slate-500' : 'text-slate-600'}`}>
                                {item.message}
                            </Text>
                            {!item.isRead && (
                                <View className="mt-2 self-start bg-blue-100 px-2 py-0.5 rounded text-blue-800">
                                    <Text className="text-[9px] font-bold text-blue-700 uppercase tracking-wider">{t('common.new')}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="bg-white px-5 pt-14 pb-4 flex-row items-center border-b border-slate-100 shadow-sm z-10">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-slate-50 p-2.5 rounded-xl mr-4 active:bg-slate-100 border border-slate-100"
                >
                    <Icon icon={ChevronLeft} color="#374151" size={22} />
                </TouchableOpacity>
                <View>
                    <Text className="text-xl font-black text-slate-900">{t('notifications.title')}</Text>
                    <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t('notifications.subtitle')}</Text>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={Theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 20 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20 opacity-50">
                            <Icon icon={Bell} color="#cbd5e1" size={48} />
                            <Text className="text-slate-400 font-bold mt-4">{t('notifications.empty')}</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
