import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Linking, Alert, ScrollView, TextInput } from 'react-native';
import { useFocusEffect, Stack, useRouter } from 'expo-router';
import { Phone, Search, Shield, Wrench, Building2, ChevronLeft, X, Contact2, HeartPulse, MessageSquare } from 'lucide-react-native';
import { contactService } from '../services/contactService';
import { Contact } from '../types';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

export default function EmergencyContactsScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchContacts = async () => {
        try {
            const data = await contactService.fetchContacts();
            setContacts(data);
        } catch (error) {
            console.error('Failed to fetch contacts:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchContacts();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchContacts();
    };

    const handleCall = (number: string) => {
        const url = `tel:${number}`;
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Alert.alert(t('common.error'), 'Unable to initiate call');
            }
        });
    };

    const categories = [
        { id: 'all', label: t('contacts.all'), icon: Search },
        { id: 'emergency', label: t('contacts.emergency'), icon: HeartPulse },
        { id: 'maintenance', label: t('contacts.maintenance'), icon: Wrench },
        { id: 'administration', label: t('contacts.administration'), icon: Building2 },
    ];

    const filteredContacts = (activeCategory === 'all'
        ? contacts
        : contacts.filter(c => {
            if (activeCategory === 'maintenance') {
                return c.category === 'maintenance' || c.category === 'service';
            }
            return c.category === activeCategory;
        })
    ).filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.designation.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getCategoryStyles = (category: string) => {
        switch (category) {
            case 'emergency':
                return {
                    bg: 'bg-rose-50',
                    icon: HeartPulse,
                    color: '#f43f5e',
                    label: t('contacts.emergency')
                };
            case 'maintenance':
            case 'service':
                return {
                    bg: 'bg-amber-50',
                    icon: Wrench,
                    color: '#d97706',
                    label: t('contacts.maintenance')
                };
            case 'administration':
                return {
                    bg: 'bg-blue-50',
                    icon: Building2,
                    color: '#1e40af',
                    label: t('contacts.administration')
                };
            default:
                return {
                    bg: 'bg-slate-50',
                    icon: Contact2,
                    color: '#64748b',
                    label: 'Other'
                };
        }
    };

    if (loading && !refreshing) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color="#1e40af" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Header */}
            <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                className="px-6 pt-16 pb-8 shadow-sm border-b border-slate-100"
            >
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-3xl font-black text-slate-900 tracking-tight">{t('contacts.title')}</Text>
                        <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{t('contacts.subtitle')}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm border border-slate-100 ml-4 active:bg-slate-50"
                    >
                        <Icon icon={X} color="#0f172a" size={24} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="mt-6 flex-row items-center bg-white rounded-2xl px-4 py-2 border border-slate-100 shadow-sm">
                    <Icon icon={Search} color="#94a3b8" size={20} />
                    <TextInput
                        className="flex-1 ml-3 h-12 text-slate-900 font-bold text-base"
                        placeholder={t('contacts.searchContacts')}
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

            {/* Category Filter */}
            <View className="py-4">
                <FlatList
                    horizontal
                    data={categories}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => {
                        const isSelected = activeCategory === item.id;
                        return (
                            <TouchableOpacity
                                onPress={() => setActiveCategory(item.id)}
                                className={`mr-3 px-6 py-2.5 rounded-2xl border-2 ${isSelected
                                        ? 'bg-blue-800 border-blue-800 shadow-lg shadow-blue-200'
                                        : 'bg-white border-slate-100'
                                    }`}
                                activeOpacity={0.7}
                            >
                                <Icon
                                    icon={item.icon}
                                    color={isSelected ? 'white' : '#64748b'}
                                    size={16}
                                />
                                <Text className={`ml-2 text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-white' : 'text-slate-500'
                                    }`}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            <FlatList
                data={filteredContacts}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1e40af" />
                }
                ListEmptyComponent={
                    <View className="items-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
                        <View className="bg-slate-50 w-20 h-20 rounded-full items-center justify-center mb-6">
                            <Icon icon={Contact2} color="#cbd5e1" size={40} />
                        </View>
                        <Text className="text-slate-900 font-black text-lg uppercase tracking-tight">{t('contacts.noContacts')}</Text>
                        <Text className="text-slate-400 font-bold text-xs mt-1">Try a different category or search term</Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const styles = getCategoryStyles(item.category);
                    return (
                        <Card className="mb-4 overflow-hidden border-slate-100">
                            <TouchableOpacity
                                onPress={() => handleCall(item.phoneNumber)}
                                activeOpacity={0.8}
                                className="p-5 flex-row items-center"
                            >
                                <View className={`w-14 h-14 rounded-[20px] justify-center items-center mr-4 border border-slate-50 shadow-sm ${styles.bg}`}>
                                    <Icon icon={styles.icon} color={styles.color} size={26} />
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row items-center mb-0.5">
                                        <Text className="text-lg font-black text-slate-900 leading-tight">{item.name}</Text>
                                        <View className={`${styles.bg} px-2 py-0.5 rounded-lg ml-2`}>
                                            <Text className="text-[8px] font-black uppercase tracking-widest" style={{ color: styles.color }}>{styles.label}</Text>
                                        </View>
                                    </View>
                                    <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">{item.designation}</Text>
                                    <Text className="text-blue-600 font-black text-sm">{item.phoneNumber}</Text>
                                </View>
                                <View className="bg-emerald-500 w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-emerald-500/30">
                                    <Icon icon={Phone} color="white" size={20} />
                                </View>
                            </TouchableOpacity>
                        </Card>
                    );
                }}
            />
        </View>
    );
}

