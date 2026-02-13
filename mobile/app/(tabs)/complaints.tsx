import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, TextInput, ScrollView, Image } from 'react-native';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Plus, AlertCircle, CheckCircle2, Clock, Search, X, ChevronRight, Filter } from 'lucide-react-native';
import { complaintService } from '../../services/complaintService';
import { Complaint } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { API_ROOT } from '../../services/api';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { Theme } from '../../constants/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Complaints() {
    const router = useRouter();
    const { user } = useAuth();
    const { status } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const fetchComplaints = async () => {
        try {
            const data = await complaintService.fetchComplaints();
            setComplaints(data);
        } catch (error) {
            console.error('Failed to fetch complaints:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchComplaints();
            if (status === 'resolved') {
                setSearchQuery('resolved');
            } else if (status === 'pending') {
                setSearchQuery('pending');
            }
        }, [status])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchComplaints();
    }, []);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'resolved': return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2, color: Theme.colors.status.success };
            case 'in_progress': return { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100', icon: Clock, color: Theme.colors.primary };
            case 'rejected': return { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100', icon: AlertCircle, color: Theme.colors.status.danger };
            default: return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100', icon: Clock, color: Theme.colors.status.warning };
        }
    };

    const getMediaUri = (path: string | null | undefined) => {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `${API_ROOT}/${cleanPath}`;
    };

    const categories = ['All', 'water', 'lift', 'cleaning', 'security', 'parking', 'other'];

    const filteredComplaints = complaints.filter(c => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (c.title?.toLowerCase() || '').includes(query) ||
            (c.description?.toLowerCase() || '').includes(query) ||
            (c.status?.toLowerCase() || '').includes(query);
        const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const renderItem = ({ item }: { item: Complaint }) => {
        const styles = getStatusStyles(item.status);

        return (
            <TouchableOpacity
                onPress={() => router.push(`/complaints/${item.id}`)}
                activeOpacity={0.7}
                className="mb-4"
            >
                <Card className="p-0 overflow-hidden">
                    <View className="flex-row p-4">
                        {item.imageUrl ? (
                            <Image
                                source={{ uri: getMediaUri(item.imageUrl) || '' }}
                                className="w-20 h-20 rounded-2xl mr-4"
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="w-20 h-20 rounded-2xl mr-4 bg-slate-50 items-center justify-center border border-slate-100">
                                <Icon icon={AlertCircle} color="#cbd5e1" size={24} />
                            </View>
                        )}
                        <View className="flex-1 justify-between py-0.5">
                            <View>
                                <View className="flex-row justify-between items-start">
                                    <Text className="text-slate-900 font-extrabold text-lg flex-1 mr-2" numberOfLines={1}>
                                        {item.title}
                                    </Text>
                                    <View className={`px-2.5 py-1 rounded-lg border ${styles.bg} ${styles.border}`}>
                                        <Text className={`text-[10px] font-bold uppercase tracking-wider ${styles.text}`}>
                                            {item.status.replace('_', ' ')}
                                        </Text>
                                    </View>
                                </View>
                                <Text className="text-slate-500 text-sm mt-1" numberOfLines={2}>
                                    {item.description}
                                </Text>
                            </View>
                            <View className="flex-row justify-between items-center mt-3">
                                <View className="flex-row items-center">
                                    <Icon icon={Clock} color="#94a3b8" size={14} />
                                    <Text className="text-slate-400 text-xs font-medium ml-1">
                                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </Text>
                                </View>
                                <View className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                    <Text className="text-slate-500 text-[10px] font-bold uppercase">
                                        {item.category}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-slate-50">
            <View
                className="bg-white px-5 pb-6 shadow-sm shadow-slate-200/50 z-10"
                style={{ paddingTop: insets.top + 10 }}
            >
                <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-3xl font-extrabold text-slate-900">Complaints</Text>
                    <TouchableOpacity className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <Icon icon={Filter} color={Theme.colors.primary} size={20} />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 py-1.5 border border-slate-100 mb-5">
                    <Icon icon={Search} color="#94a3b8" size={18} />
                    <TextInput
                        className="flex-1 ml-3 text-slate-700 font-medium h-10"
                        placeholder="Search complaints..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#94a3b8"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1">
                            <Icon icon={X} color="#94a3b8" size={18} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Category Pills */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setSelectedCategory(cat)}
                            className={`px-5 py-2.5 rounded-2xl mr-3 border-2 ${selectedCategory === cat
                                ? 'bg-blue-800 border-blue-800 shadow-md shadow-blue-800/20'
                                : 'bg-white border-slate-100'
                                }`}
                            activeOpacity={0.8}
                        >
                            <Text className={`capitalize text-xs font-bold tracking-wide ${selectedCategory === cat ? 'text-white' : 'text-slate-600'
                                }`}>
                                {cat}
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
                    data={filteredComplaints}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />
                    }
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center py-24">
                            <View className="bg-slate-100 p-8 rounded-full mb-6">
                                <Icon icon={Search} color="#94a3b8" size={48} />
                            </View>
                            <Text className="text-slate-900 text-xl font-extrabold mb-2">No results found</Text>
                            <Text className="text-slate-500 text-center px-12 leading-5">
                                We couldn't find any complaints matching your current filters.
                            </Text>
                        </View>
                    }
                />
            )}

            {user?.role === 'resident' && (
                <TouchableOpacity
                    className="absolute bottom-8 right-6 w-16 h-16 bg-blue-800 rounded-3xl justify-center items-center shadow-xl shadow-blue-800/40 active:bg-blue-900"
                    onPress={() => router.push('/complaints/new')}
                    style={{ elevation: 8 }}
                >
                    <Icon icon={Plus} color="white" size={32} />
                </TouchableOpacity>
            )}
        </View>
    );
}

