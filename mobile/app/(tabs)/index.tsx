import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { complaintService } from '../../services/complaintService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Phone, Megaphone, CheckCircle2, Calendar, Users,
    FileText, LogOut, ChevronRight, BarChart2,
    PlusCircle, ShieldAlert, CreditCard
} from 'lucide-react-native';
import { Card } from '../../components/Card';
import { Theme } from '../../constants/Theme';
import { Icon } from '../../components/Icon';

export default function Dashboard() {
    const { t } = useTranslation();
    const { user, signOut } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [stats, setStats] = useState({ active: 0, resolved: 0 });
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        if (user?.role === 'admin') {
            try {
                const complaints = await complaintService.fetchComplaints();
                const active = complaints.filter(c => c.status === 'pending' || c.status === 'in_progress').length;
                const resolved = complaints.filter(c => c.status === 'resolved').length;
                setStats({ active, resolved });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, [user?.role])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    };

    const QuickAction = ({ icon: LucideIcon, label, color, onPress, size = 'large' }: any) => (
        <TouchableOpacity
            onPress={onPress}
            className={`items-center justify-center rounded-3xl shadow-sm border border-slate-100 ${size === 'large' ? 'bg-white w-[30%] aspect-square mb-2' : 'bg-white flex-1 p-4'
                }`}
            activeOpacity={0.7}
        >
            <View className="p-3 rounded-2xl mb-2" style={{ backgroundColor: `${color}15` }}>
                <Icon icon={LucideIcon} color={color} size={size === 'large' ? 28 : 22} />
            </View>
            <Text className="text-slate-900 font-bold text-[11px] text-center" numberOfLines={1}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView
            className="flex-1 bg-slate-50"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: insets.top + 20, paddingBottom: 40 }}
        >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-8">
                <View className="flex-1">
                    <Text className="text-slate-500 font-semibold text-sm mb-1">{t('dashboard.welcomeBack')}</Text>
                    <Text className="text-3xl font-extrabold text-slate-900">{user?.fullName}</Text>
                </View>
                <TouchableOpacity
                    onPress={signOut}
                    className="bg-rose-50 p-3 rounded-2xl border border-rose-100"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Icon icon={LogOut} color={Theme.colors.status.danger} size={22} />
                </TouchableOpacity>
            </View>

            {/* Admin Overview */}
            {user?.role === 'admin' && (
                <View className="mb-8">
                    <Text className="text-xl font-extrabold text-slate-900 mb-4">{t('dashboard.societyOverview')}</Text>
                    <View className="flex-row gap-4 mb-4">
                        <TouchableOpacity
                            onPress={() => router.push({ pathname: '/complaints', params: { status: 'pending' } })}
                            className="flex-1"
                            activeOpacity={0.8}
                        >
                            <Card className="p-5 border-l-4 border-amber-500">
                                <View className="bg-amber-50 w-10 h-10 rounded-xl items-center justify-center mb-3">
                                    <Icon icon={ShieldAlert} color={Theme.colors.status.warning} size={20} />
                                </View>
                                <Text className="text-3xl font-extrabold text-slate-900">{stats.active}</Text>
                                <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">{t('dashboard.pending')}</Text>
                            </Card>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push({ pathname: '/complaints', params: { status: 'resolved' } })}
                            className="flex-1"
                            activeOpacity={0.8}
                        >
                            <Card className="p-5 border-l-4 border-emerald-500">
                                <View className="bg-emerald-50 w-10 h-10 rounded-xl items-center justify-center mb-3">
                                    <Icon icon={CheckCircle2} color={Theme.colors.status.success} size={20} />
                                </View>
                                <Text className="text-3xl font-extrabold text-slate-900">{stats.resolved}</Text>
                                <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">{t('dashboard.resolved')}</Text>
                            </Card>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Role Header */}
            <Card className="mb-8 flex-row items-center bg-blue-800 border-0 p-5 shadow-blue-800/20">
                <View className="bg-white/20 w-14 h-14 rounded-2xl items-center justify-center mr-4">
                    <Icon icon={Users} color="white" size={28} />
                </View>
                <View className="flex-1">
                    <Text className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">{t('dashboard.yourRole')}</Text>
                    <Text className="text-xl font-extrabold text-white capitalize">{user?.role}</Text>
                    {user?.flatNumber && (
                        <Text className="text-blue-200 text-sm font-medium">Room: {user.flatNumber}</Text>
                    )}
                </View>
                <TouchableOpacity
                    onPress={() => router.push('/profile')}
                    className="bg-white/10 p-2 rounded-xl"
                >
                    <Icon icon={ChevronRight} color="white" size={20} />
                </TouchableOpacity>
            </Card>

            {/* Quick Actions Grid */}
            <View className="mb-8">
                <Text className="text-xl font-extrabold text-slate-900 mb-4">{t('dashboard.quickActions')}</Text>
                <View className="flex-row flex-wrap gap-3 justify-between">
                    {user?.role === 'resident' && (
                        <QuickAction
                            icon={PlusCircle}
                            label={t('dashboard.newIssue')}
                            color={Theme.colors.secondary}
                            onPress={() => router.push('/complaints/new')}
                        />
                    )}
                    <QuickAction
                        icon={Megaphone}
                        label={t('dashboard.notices')}
                        color={Theme.colors.primary}
                        onPress={() => router.push('/notices')}
                    />
                    <QuickAction
                        icon={Calendar}
                        label={t('dashboard.amenities')}
                        color="#6366f1"
                        onPress={() => router.push('/amenities')}
                    />
                    <QuickAction
                        icon={CreditCard}
                        label="Payment"
                        color={Theme.colors.status.success}
                        onPress={() => router.push('/maintenance')}
                    />
                    <QuickAction
                        icon={BarChart2}
                        label={t('dashboard.polls')}
                        color="#8b5cf6"
                        onPress={() => router.push('/polls')}
                    />
                    <QuickAction
                        icon={Phone}
                        label={t('dashboard.emergency')}
                        color={Theme.colors.status.danger}
                        onPress={() => router.push('/contacts')}
                    />
                </View>
            </View>

            {/* Management Section for Admins */}
            {user?.role === 'admin' && (
                <View>
                    <Text className="text-xl font-extrabold text-slate-900 mb-4">Management</Text>
                    <View className="gap-3">
                        <TouchableOpacity onPress={() => router.push('/users')} activeOpacity={0.7}>
                            <Card className="flex-row items-center p-4">
                                <View className="bg-sky-50 p-3 rounded-2xl mr-4">
                                    <Icon icon={Users} color={Theme.colors.status.info} size={22} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-slate-900 font-bold text-base">Users & Residents</Text>
                                    <Text className="text-slate-500 text-xs">Manage approvals and roles</Text>
                                </View>
                                <Icon icon={ChevronRight} color="#cbd5e1" size={20} />
                            </Card>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

