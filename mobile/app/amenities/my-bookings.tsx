import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react-native';
import { bookingService } from '../../services/bookingService';
import { Booking } from '../../types';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

function TabBarIcon(props: { icon: any; color: string; size?: number }) {
    const { icon: Icon, color, size = 24 } = props;
    return <Icon size={size} color={color} />;
}

export default function MyBookingsScreen() {
    const { t } = useTranslation();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [cancelling, setCancelling] = useState<string | null>(null);

    const fetchBookings = async () => {
        try {
            const data = await bookingService.fetchUserBookings();
            setBookings(data);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBookings();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const handleCancel = (id: string) => {
        Alert.alert(
            t('amenities.cancelBooking'),
            t('amenities.confirmCancel'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('amenities.yesCancel'),
                    style: 'destructive',
                    onPress: async () => {
                        setCancelling(id);
                        try {
                            await bookingService.cancelBooking(id);
                            fetchBookings();
                        } catch (error) {
                            Alert.alert(t('common.error'), t('amenities.cancelError'));
                        } finally {
                            setCancelling(null);
                        }
                    }
                }
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'text-green-600 bg-green-50 border-green-200';
            case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
            case 'cancelled': return 'text-gray-500 bg-gray-100 border-gray-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const renderItem = ({ item }: { item: Booking }) => (
        <View className="bg-white p-5 rounded-3xl mb-4 shadow-lg shadow-gray-200/50 border border-gray-100">
            <View className="flex-row justify-between items-start mb-4">
                <Text className="text-xl font-extrabold text-gray-900 flex-1 mr-2">{item.amenity?.name}</Text>
                <View className={`px-3 py-1.5 rounded-full border-2 ${getStatusColor(item.status).split(' ')[2]} ${getStatusColor(item.status).split(' ')[1]}`}>
                    <Text className={`text-xs font-extrabold uppercase tracking-wider ${getStatusColor(item.status).split(' ')[0]}`}>
                        {t(`manageBookings.${item.status}`)}
                    </Text>
                </View>
            </View>

            <View className="space-y-3 mb-5">
                <View className="flex-row items-center bg-gray-50 p-3 rounded-xl">
                    <View className="bg-blue-100 p-2 rounded-lg mr-3">
                        <TabBarIcon icon={Calendar} color="#2563eb" size={18} />
                    </View>
                    <Text className="text-gray-700 font-semibold flex-1">
                        {new Date(item.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </Text>
                </View>
                <View className="flex-row items-center bg-gray-50 p-3 rounded-xl">
                    <View className="bg-purple-100 p-2 rounded-lg mr-3">
                        <TabBarIcon icon={Clock} color="#a855f7" size={18} />
                    </View>
                    <Text className="text-gray-700 font-semibold">
                        {item.startTime} - {item.endTime}
                    </Text>
                </View>
            </View>

            {(item.status === 'pending' || item.status === 'confirmed') && (
                <TouchableOpacity
                    onPress={() => handleCancel(item.id)}
                    disabled={cancelling === item.id}
                    className="py-4 items-center border-2 border-red-200 rounded-2xl bg-red-50 active:bg-red-100 flex-row justify-center"
                    activeOpacity={0.7}
                >
                    {cancelling === item.id ? (
                        <ActivityIndicator size="small" color="#ef4444" />
                    ) : (
                        <>
                            <TabBarIcon icon={XCircle} color="#ef4444" size={20} />
                            <Text className="text-red-600 font-extrabold text-base ml-2">{t('amenities.cancelBooking')}</Text>
                        </>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gradient-to-b from-indigo-50 to-white">
            <Stack.Screen options={{
                title: t('common.myBookings'),
                headerStyle: { backgroundColor: 'white' },
                headerShadowVisible: true
            }} />

            <FlatList
                data={bookings}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View className="items-center py-20">
                        <View className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 rounded-full mb-4 shadow-lg">
                            <TabBarIcon icon={AlertCircle} color="#6b7280" size={48} />
                        </View>
                        <Text className="text-gray-600 text-xl font-extrabold">{t('manageBookings.noBookings', { status: '' })}</Text>
                        <Text className="text-gray-400 text-center mt-2 px-10">
                            You haven't made any bookings yet
                        </Text>
                    </View>
                }
                renderItem={renderItem}
            />
        </View>
    );
}
