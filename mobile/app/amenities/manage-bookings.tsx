import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Stack, Redirect, useRouter } from 'expo-router';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Filter, ChevronLeft, User as UserIcon, MapPin } from 'lucide-react-native';
import { bookingService } from '../../services/bookingService';
import { Booking } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { Theme } from '../../constants/Theme';

export default function ManageBookingsScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('pending');

    if (user?.role !== 'admin') {
        return <Redirect href="/(tabs)" />;
    }

    const fetchBookings = async () => {
        try {
            const data = await bookingService.fetchAllBookings(filterStatus === 'all' ? undefined : filterStatus);
            setBookings(data);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            Alert.alert(t('common.error'), t('manageBookings.noBookings', { status: '' }));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBookings();
        }, [filterStatus])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const handleUpdateStatus = async (id: string, status: 'confirmed' | 'rejected') => {
        setProcessingId(id);
        try {
            await bookingService.updateBookingStatus(id, status);
            fetchBookings();
            Alert.alert(t('common.success'), t('manageBookings.statusUpdated'));
        } catch (error) {
            Alert.alert(t('common.error'), 'Failed to update status');
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'confirmed':
                return {
                    bg: 'bg-emerald-50',
                    text: 'text-emerald-700',
                    border: 'border-emerald-100',
                    icon: CheckCircle2
                };
            case 'pending':
                return {
                    bg: 'bg-amber-50',
                    text: 'text-amber-700',
                    border: 'border-amber-100',
                    icon: Clock
                };
            case 'rejected':
                return {
                    bg: 'bg-rose-50',
                    text: 'text-rose-700',
                    border: 'border-rose-100',
                    icon: XCircle
                };
            default:
                return {
                    bg: 'bg-slate-50',
                    text: 'text-slate-500',
                    border: 'border-slate-100',
                    icon: AlertCircle
                };
        }
    };

    const renderItem = ({ item }: { item: Booking }) => {
        const styles = getStatusStyles(item.status);
        return (
            <Card className="mb-5 overflow-hidden">
                <View className="p-6">
                    <View className="flex-row justify-between items-start mb-6">
                        <View className="flex-1 mr-4">
                            <Text className="text-xl font-black text-slate-900 leading-tight mb-1">{item.amenity?.name}</Text>
                            <View className="flex-row items-center bg-blue-50/50 self-start px-2 py-1 rounded-lg">
                                <Icon icon={UserIcon} color={Theme.colors.primary} size={10} />
                                <Text className="text-blue-800 text-[9px] font-black uppercase tracking-widest ml-1">
                                    {item.user?.fullName || item.User?.fullName} • {item.user?.flatNumber || item.User?.flatNumber || 'Staff'}
                                </Text>
                            </View>
                        </View>
                        <View className={`${styles.bg} ${styles.border} border px-3 py-1.5 rounded-xl flex-row items-center`}>
                            <Icon icon={styles.icon} color={styles.text.replace('text-', '') === 'emerald-700' ? '#059669' : styles.text.replace('text-', '') === 'amber-700' ? '#d97706' : '#64748b'} size={12} />
                            <Text className={`${styles.text} text-[10px] font-black uppercase tracking-widest ml-2`}>
                                {t(`manageBookings.${item.status}`)}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center justify-between mb-8">
                        <View className="items-center flex-1 bg-slate-50 p-4 rounded-[24px] border border-slate-100/50">
                            <Text className="text-slate-400 font-black text-[9px] uppercase tracking-widest mb-1.5 text-center">{t('manageBookings.schedule')}</Text>
                            <Text className="text-slate-900 font-black text-xs text-center">
                                {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {item.startTime}
                            </Text>
                        </View>
                    </View>

                    {item.status === 'pending' && (
                        <View className="flex-row gap-4">
                            <TouchableOpacity
                                onPress={() => handleUpdateStatus(item.id, 'confirmed')}
                                disabled={!!processingId}
                                className="flex-1 bg-emerald-500 py-4 rounded-2xl items-center flex-row justify-center shadow-lg shadow-emerald-500/20"
                                activeOpacity={0.8}
                            >
                                {processingId === item.id ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <>
                                        <Icon icon={CheckCircle2} color="white" size={18} />
                                        <Text className="text-white font-black text-xs uppercase tracking-widest ml-2">{t('manageBookings.approve')}</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleUpdateStatus(item.id, 'rejected')}
                                disabled={!!processingId}
                                className="flex-1 bg-white border border-rose-200 py-4 rounded-2xl items-center flex-row justify-center active:bg-rose-50"
                                activeOpacity={0.7}
                            >
                                <Icon icon={XCircle} color="#e11d48" size={18} />
                                <Text className="text-rose-600 font-black text-xs uppercase tracking-widest ml-2">{t('manageBookings.reject')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </Card>
        );
    };

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen options={{
                title: t('manageBookings.title'),
                headerShown: true,
                headerStyle: { backgroundColor: 'white' },
                headerTitleStyle: { fontFamily: 'System', fontWeight: '900', fontSize: 20 },
                headerShadowVisible: false,
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} className="mr-2">
                        <Icon icon={ChevronLeft} color="#000" size={24} />
                    </TouchableOpacity>
                )
            }} />

            {/* Premium Filter Tabs */}
            <View className="bg-white border-b border-slate-100 pb-5 pt-2 shadow-sm shadow-slate-200/50 z-20">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5">
                    {['pending', 'confirmed', 'rejected', 'all'].map((status) => (
                        <TouchableOpacity
                            key={status}
                            onPress={() => setFilterStatus(status)}
                            className={`px-6 py-2.5 rounded-2xl mr-3 border-2 ${filterStatus === status
                                ? 'bg-blue-800 border-blue-800 shadow-lg shadow-blue-800/20'
                                : 'bg-slate-50 border-slate-100'
                                }`}
                        >
                            <Text className={`text-[10px] font-black uppercase tracking-widest ${filterStatus === status ? 'text-white' : 'text-slate-500'}`}>
                                {t(`manageBookings.${status}`)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading && !refreshing ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color={Theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={bookings}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListHeaderComponent={
                        <View className="mb-8">
                            <Text className="text-3xl font-black text-slate-900 tracking-tight">{t('manageBookings.reviewQueue')}</Text>
                            <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
                                {t('manageBookings.requestsSubtitle', { status: filterStatus === 'all' ? t('manageBookings.all') : t(`manageBookings.${filterStatus}`) })}
                            </Text>
                        </View>
                    }
                    ListEmptyComponent={
                        <View className="items-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
                            <View className="bg-slate-50 w-20 h-20 rounded-full items-center justify-center mb-6">
                                <Icon icon={AlertCircle} color="#cbd5e1" size={40} />
                            </View>
                            <Text className="text-slate-900 font-black text-lg uppercase tracking-tight">{t('manageBookings.noRequests')}</Text>
                            <Text className="text-slate-400 font-bold text-xs mt-1">{t('manageBookings.filteringBy', { status: filterStatus })}</Text>
                        </View>
                    }
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

