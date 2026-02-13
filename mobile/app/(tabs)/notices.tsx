import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Bell, Info, AlertTriangle, Calendar as CalendarIcon, ChevronRight, Plus, Megaphone, User as UserIcon, X } from 'lucide-react-native';
import { noticeService } from '../../services/noticeService';
import { Notice } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NoticesScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotices = async () => {
        try {
            const data = await noticeService.fetchNotices();
            setNotices(data);
        } catch (error) {
            console.error('Failed to fetch notices:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchNotices();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotices();
    };

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'warning':
                return {
                    bg: 'bg-rose-50',
                    border: 'border-rose-100',
                    icon: AlertTriangle,
                    iconColor: '#f43f5e',
                    text: 'text-rose-700',
                    label: t('notices.warning')
                };
            case 'event':
                return {
                    bg: 'bg-purple-50',
                    border: 'border-purple-100',
                    icon: CalendarIcon,
                    iconColor: '#8b5cf6',
                    text: 'text-purple-700',
                    label: t('notices.event')
                };
            default:
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-100',
                    icon: Info,
                    iconColor: '#2563eb',
                    text: 'text-blue-700',
                    label: t('notices.info')
                };
        }
    };

    if (loading && !refreshing) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#1e40af" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            {/* Premium Header */}
            <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                className="px-6 pb-8 shadow-sm border-b border-slate-100"
                style={{ paddingTop: insets.top + 10 }}
            >
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-3xl font-black text-slate-900 tracking-tight">{t('notices.title')}</Text>
                        <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{t('notices.subtitle')}</Text>
                    </View>
                    {user?.role === 'admin' && (
                        <TouchableOpacity
                            onPress={() => router.push('/notices/new')}
                            className="bg-blue-800 w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-blue-200 active:scale-95"
                        >
                            <Icon icon={Plus} color="white" size={24} />
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            <FlatList
                data={notices}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1e40af" />
                }
                ListEmptyComponent={
                    <View className="items-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
                        <View className="bg-slate-50 w-20 h-20 rounded-full items-center justify-center mb-6">
                            <Icon icon={Megaphone} color="#cbd5e1" size={40} />
                        </View>
                        <Text className="text-slate-900 font-black text-lg uppercase tracking-tight">{t('notices.noNotices')}</Text>
                        <Text className="text-slate-400 font-bold text-xs mt-1 text-center px-16">
                            {t('notices.checkBack')}
                        </Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const styles = getTypeStyles(item.type);
                    return (
                        <Card
                            className="mb-6 overflow-hidden border-l-4"
                            style={{ borderLeftColor: styles.iconColor }}
                        >
                            <TouchableOpacity activeOpacity={0.8} className="p-6">
                                <View className="flex-row items-center justify-between mb-4">
                                    <View className={`${styles.bg} px-3 py-1.5 rounded-xl`}>
                                        <Text className={`text-[10px] font-black uppercase tracking-widest ${styles.text}`}>
                                            {styles.label}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Icon icon={CalendarIcon} color="#94a3b8" size={12} />
                                        <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest ml-1.5">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </Text>
                                    </View>
                                </View>

                                <Text className="text-xl font-black text-slate-900 leading-[28px] mb-3">{item.title}</Text>
                                <Text className="text-slate-500 leading-6 text-sm mb-6" numberOfLines={3}>
                                    {item.content}
                                </Text>

                                <View className="flex-row justify-between items-center pt-5 border-t border-slate-50">
                                    <View className="flex-row items-center">
                                        <View className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center mr-3 border border-slate-100">
                                            <Icon icon={UserIcon} color="#64748b" size={16} />
                                        </View>
                                        <View>
                                            <Text className="text-slate-400 font-black text-[8px] uppercase tracking-widest mb-0.5">{t('notices.management')}</Text>
                                            <Text className="text-slate-900 font-black text-xs">
                                                {item.author?.fullName || t('notices.officialAdmin')}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                        <Icon icon={ChevronRight} color="#cbd5e1" size={16} />
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Card>
                    );
                }}
            />
        </View>
    );
}

