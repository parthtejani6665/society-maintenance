import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, RefreshControl } from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { userService } from '../../services/userService';
import { ChevronRight, Search, User as UserIcon, Shield, Briefcase, Home, Filter, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { LinearGradient } from 'expo-linear-gradient';

interface User {
    id: string;
    fullName: string;
    email: string;
    role: string;
    flatNumber?: string;
    isActive: boolean;
}

export default function UsersList() {
    const { t } = useTranslation();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filterRole, setFilterRole] = useState<string | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchUsers = async (showRefreshing = false) => {
        if (showRefreshing) setRefreshing(true);
        else setLoading(true);

        try {
            const data = await userService.fetchAllUsers(filterRole);
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            // Alert.alert(t('common.error'), t('users.noUsers'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchUsers();
        }, [filterRole])
    );

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.flatNumber && user.flatNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return Shield;
            case 'staff': return Briefcase;
            default: return Home;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return '#f43f5e'; // rose-500
            case 'staff': return '#8b5cf6'; // violet-500
            default: return '#3b82f6'; // blue-500
        }
    };

    const getRoleBg = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-rose-50';
            case 'staff': return 'bg-violet-50';
            default: return 'bg-blue-50';
        }
    };

    const renderItem = ({ item }: { item: User }) => {
        const RoleIcon = getRoleIcon(item.role);
        const roleColor = getRoleColor(item.role);
        const roleBg = getRoleBg(item.role);

        return (
            <Card className="mb-4 overflow-hidden border-slate-100">
                <TouchableOpacity
                    onPress={() => router.push(`/users/${item.id}`)}
                    activeOpacity={0.8}
                    className="p-5 flex-row items-center"
                >
                    <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${roleBg} border border-slate-50 shadow-sm`}>
                        <Icon icon={RoleIcon} color={roleColor} size={28} />
                    </View>

                    <View className="flex-1">
                        <Text className="text-lg font-black text-slate-900 leading-tight mb-0.5">{item.fullName}</Text>
                        <Text className="text-slate-400 font-bold text-xs mb-2 tracking-tight">{item.email}</Text>

                        <View className="flex-row items-center">
                            <View className={`${roleBg} px-2.5 py-1 rounded-lg mr-2`}>
                                <Text className="text-[9px] font-black uppercase tracking-widest" style={{ color: roleColor }}>
                                    {t(`users.${item.role}`)}
                                </Text>
                            </View>
                            {item.flatNumber && (
                                <View className="bg-slate-50 px-2.5 py-1 rounded-lg flex-row items-center border border-slate-100">
                                    <Icon icon={Home} color="#64748b" size={10} />
                                    <Text className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                        {item.flatNumber}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <View className="w-10 h-10 bg-slate-50 rounded-xl items-center justify-center border border-slate-100">
                        <Icon icon={ChevronRight} color="#cbd5e1" size={20} />
                    </View>
                </TouchableOpacity>
            </Card>
        );
    };

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Header */}
            <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                className="px-6 pt-16 pb-8 shadow-sm border-b border-slate-100"
            >
                <Text className="text-3xl font-black text-slate-900 tracking-tight">{t('users.title')}</Text>
                <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Manage society community</Text>

                {/* Search Bar */}
                <View className="mt-6 flex-row items-center bg-white rounded-2xl px-4 py-2 border border-slate-100 shadow-sm">
                    <Icon icon={Search} color="#94a3b8" size={20} />
                    <TextInput
                        className="flex-1 ml-3 h-12 text-slate-900 font-bold text-base"
                        placeholder={t('users.searchPlaceholder')}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#cbd5e1"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon icon={X} color="#94a3b8" size={18} />
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            {/* Role Filter Chips */}
            <View className="py-4">
                <FlatList
                    horizontal
                    data={['All', 'resident', 'staff', 'admin']}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                    keyExtractor={item => item}
                    renderItem={({ item }) => {
                        const isSelected = (item === 'All' && !filterRole) || filterRole === item;
                        return (
                            <TouchableOpacity
                                onPress={() => setFilterRole(item === 'All' ? undefined : item)}
                                className={`mr-3 px-6 py-2.5 rounded-2xl border-2 ${isSelected
                                        ? 'bg-blue-800 border-blue-800 shadow-lg shadow-blue-200'
                                        : 'bg-white border-slate-100'
                                    }`}
                                activeOpacity={0.7}
                            >
                                <Text className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-slate-500'
                                    }`}>
                                    {item === 'All' ? t('users.allRoles') : t(`users.${item}`)}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            {loading && !refreshing ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#1e40af" />
                </View>
            ) : (
                <FlatList
                    data={filteredUsers}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => fetchUsers(true)} tintColor="#1e40af" />
                    }
                    ListEmptyComponent={
                        <View className="items-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
                            <View className="w-20 h-20 bg-slate-50 rounded-full items-center justify-center mb-6">
                                <Icon icon={UserIcon} color="#cbd5e1" size={40} />
                            </View>
                            <Text className="text-slate-900 font-black text-lg uppercase tracking-tight">{t('users.noUsers')}</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
