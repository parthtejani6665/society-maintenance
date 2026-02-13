import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Image, Alert, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ChevronRight, Clock, Users, CalendarDays, Plus, ShieldCheck, CalendarClock, LayoutGrid, Info, ChevronLeft } from 'lucide-react-native';
import { amenityService } from '../../services/amenityService';
import { Amenity } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { Theme } from '../../constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Map amenity names to placeholder images (in a real app, use URLs from DB)
const getAmenityImage = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('gym') || n.includes('fitness')) return 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop';
    if (n.includes('pool') || n.includes('swimming')) return 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=1000&auto=format&fit=crop';
    if (n.includes('hall') || n.includes('club')) return 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1000&auto=format&fit=crop';
    if (n.includes('tennis') || n.includes('court')) return 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=1000&auto=format&fit=crop';
    return 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1000&auto=format&fit=crop'; // Default
};

export default function AmenitiesScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAmenities = async () => {
        try {
            const data = await amenityService.fetchAmenities();
            setAmenities(data);
        } catch (error: any) {
            console.error('Failed to fetch amenities:', error);
            Alert.alert(t('common.error'), error.message || t('amenities.bookingError'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAmenities();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchAmenities();
    };

    if (loading && !refreshing) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color={Theme.colors.primary} />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Custom Header with Safe Area */}
            <View
                className="bg-white px-6 pb-4 border-b border-slate-100 shadow-sm shadow-slate-200/50 z-10"
                style={{ paddingTop: insets.top + 10 }}
            >
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)')}
                            className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center border border-slate-100"
                        >
                            <Icon icon={ChevronLeft} color="#0f172a" size={24} />
                        </TouchableOpacity>
                        <Text className="text-3xl font-black text-slate-900 tracking-tight">{t('amenities.title')}</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        {user?.role === 'admin' && (
                            <TouchableOpacity
                                onPress={() => router.push('/amenities/manage-bookings')}
                                className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center border border-slate-100"
                            >
                                <Icon icon={ShieldCheck} color={Theme.colors.primary} size={20} />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={() => router.push('/amenities/my-bookings')}
                            className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center border border-slate-100"
                        >
                            <Icon icon={CalendarClock} color={Theme.colors.primary} size={20} />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest pl-1">{t('amenities.selectAmenity')}</Text>
            </View>

            <FlatList
                data={amenities}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 20 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View className="items-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
                        <View className="bg-slate-50 w-20 h-20 rounded-full items-center justify-center mb-6">
                            <Icon icon={LayoutGrid} color="#cbd5e1" size={40} />
                        </View>
                        <Text className="text-slate-900 font-black text-lg uppercase tracking-tight">{t('amenities.noAmenities')}</Text>
                        <Text className="text-slate-400 font-bold text-xs mt-1">{t('amenities.checkBack')}</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <Card className="mb-6 overflow-hidden">
                        <TouchableOpacity
                            onPress={() => router.push(`/amenities/${item.id}`)}
                            activeOpacity={0.9}
                        >
                            <View className="relative">
                                <Image
                                    source={{ uri: getAmenityImage(item.name) }}
                                    className="w-full h-52"
                                    resizeMode="cover"
                                />
                                <View className="absolute top-4 right-4 bg-white/90 px-3 py-1.5 rounded-xl shadow-sm border border-white/20">
                                    <Text className="text-slate-900 text-[10px] font-black uppercase tracking-widest">
                                        {item.requiresApproval ? t('amenities.approvalRequired') : t('amenities.instantBooking')}
                                    </Text>
                                </View>
                            </View>

                            <View className="p-6">
                                <View className="flex-row justify-between items-center mb-3">
                                    <Text className="text-2xl font-black text-slate-900 flex-1 mr-2 tracking-tight">{item.name}</Text>
                                    <View className="bg-blue-50 p-2 rounded-xl">
                                        <Icon icon={ChevronRight} color={Theme.colors.primary} size={18} />
                                    </View>
                                </View>

                                {item.description && (
                                    <Text className="text-slate-500 leading-5 text-sm mb-6" numberOfLines={2}>
                                        {item.description}
                                    </Text>
                                )}

                                <View className="flex-row items-center justify-between pt-5 border-t border-slate-50">
                                    <View className="flex-row items-center bg-slate-50 px-3 py-2 rounded-xl">
                                        <Icon icon={Clock} color="#64748b" size={14} />
                                        <Text className="text-slate-500 text-[11px] font-bold ml-2">
                                            {item.startTime} - {item.endTime}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center bg-slate-50 px-3 py-2 rounded-xl">
                                        <Icon icon={Users} color="#64748b" size={14} />
                                        <Text className="text-slate-500 text-[11px] font-bold ml-2">
                                            {t('amenities.capacity', { count: item.capacity })}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Card>
                )}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

