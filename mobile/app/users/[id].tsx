import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { userService } from '../../services/userService';
import { ChevronLeft, ChevronRight, Mail, Phone, Home, Calendar, Shield, Briefcase, User as UserIcon, AlertCircle, Trash2, Edit3 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { LinearGradient } from 'expo-linear-gradient';

interface UserDetail {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    role: string;
    flatNumber?: string;
    isActive: boolean;
    createdAt: string;
}

export default function UserDetails() {
    const { t } = useTranslation();
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                if (id) {
                    const data = await userService.fetchUserById(id as string);
                    setUser(data);
                }
            } catch (error) {
                console.error('Failed to load user details:', error);
                Alert.alert(t('common.error'), 'Failed to load user details');
                router.back();
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return Shield;
            case 'staff': return Briefcase;
            default: return Home;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return '#f43f5e';
            case 'staff': return '#8b5cf6';
            default: return '#3b82f6';
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color="#1e40af" />
            </View>
        );
    }

    if (!user) {
        return (
            <View className="flex-1 justify-center items-center bg-slate-50">
                <Text className="text-slate-400 font-bold">User not found</Text>
            </View>
        );
    }

    const RoleIcon = getRoleIcon(user.role);
    const roleColor = getRoleColor(user.role);

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header / Profile Info */}
            <LinearGradient
                colors={['#1e40af', '#1e3a8a']}
                className="pt-16 pb-12 px-6 rounded-b-[48px] shadow-2xl shadow-blue-900/40"
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center mb-6 self-start border border-white/20"
                >
                    <Icon icon={ChevronLeft} color="white" size={24} />
                </TouchableOpacity>

                <View className="flex-row items-center">
                    <View className="w-24 h-24 bg-white/10 rounded-[32px] items-center justify-center mr-6 border border-white/20 relative">
                        <Text className="text-4xl font-black text-white">
                            {user.fullName.charAt(0).toUpperCase()}
                        </Text>
                        <View className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-xl items-center justify-center border-2 border-[#1e40af] ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                            <View className="w-2 h-2 bg-white rounded-full" />
                        </View>
                    </View>
                    <View className="flex-1">
                        <Text className="text-3xl font-black text-white leading-tight mb-1">{user.fullName}</Text>
                        <View className="flex-row items-center">
                            <View className="bg-white/10 px-3 py-1.5 rounded-xl flex-row items-center border border-white/10">
                                <Icon icon={RoleIcon} color="white" size={14} />
                                <Text className="text-white text-[10px] font-black uppercase tracking-widest ml-2">
                                    {t(`users.${user.role}`)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1 -mt-8" contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
                {/* Stats Card */}
                <View className="flex-row gap-4 mb-6">
                    <View className="flex-1 bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 items-center">
                        <Text className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">{t('users.status')}</Text>
                        <Text className={`text-sm font-black uppercase ${user.isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {user.isActive ? t('common.active') : t('common.inactive')}
                        </Text>
                    </View>
                    {user.flatNumber && (
                        <View className="flex-1 bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 items-center">
                            <Text className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">{t('users.flatNumber')}</Text>
                            <Text className="text-sm font-black text-slate-900">{user.flatNumber}</Text>
                        </View>
                    )}
                </View>

                {/* Details Section */}
                <View className="bg-white rounded-[40px] p-6 shadow-sm border border-slate-100 mb-6">
                    <View className="flex-row items-center mb-6">
                        <View className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center mr-4 border border-slate-100">
                            <Icon icon={Mail} color="#64748b" size={20} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-0.5">{t('users.email')}</Text>
                            <Text className="text-slate-900 font-extrabold text-base leading-tight">{user.email}</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center mb-6">
                        <View className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center mr-4 border border-slate-100">
                            <Icon icon={Phone} color="#64748b" size={20} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-0.5">{t('users.phone')}</Text>
                            <Text className="text-slate-900 font-extrabold text-base leading-tight">{user.phoneNumber || 'Not provided'}</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center">
                        <View className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center mr-4 border border-slate-100">
                            <Icon icon={Calendar} color="#64748b" size={20} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-0.5">Member Since</Text>
                            <Text className="text-slate-900 font-extrabold text-base leading-tight">
                                {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Actions Cards */}
                <View className="gap-4">
                    <TouchableOpacity
                        className="bg-white h-20 rounded-[28px] flex-row px-6 items-center border border-slate-100 shadow-sm active:bg-slate-50"
                        onPress={() => Alert.alert('Coming Soon', 'Edit feature is under development.')}
                    >
                        <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center mr-4">
                            <Icon icon={Edit3} color="#3b82f6" size={20} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-slate-900 font-black text-lg">{t('users.updateUser')}</Text>
                            <Text className="text-slate-400 font-bold text-xs">Modify user details & role</Text>
                        </View>
                        <Icon icon={ChevronRight} color="#cbd5e1" size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-rose-50 h-20 rounded-[28px] flex-row px-6 items-center border border-rose-100 active:bg-rose-100/50"
                        onPress={() => Alert.alert(t('common.error'), t('users.confirmDelete'), [
                            { text: t('common.cancel'), style: 'cancel' },
                            { text: t('users.deleteUser'), style: 'destructive' }
                        ])}
                    >
                        <View className="w-12 h-12 bg-rose-100 rounded-2xl items-center justify-center mr-4">
                            <Icon icon={Trash2} color="#f43f5e" size={20} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-rose-900 font-black text-lg">{t('users.deleteUser')}</Text>
                            <Text className="text-rose-400 font-bold text-xs uppercase tracking-widest">Permanent Action</Text>
                        </View>
                        <Icon icon={AlertCircle} color="#fda4af" size={20} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
