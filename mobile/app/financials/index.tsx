import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronLeft,
    Plus,
    TrendingUp,
    PieChart,
    FileText,
    Calendar,
    IndianRupee,
    Briefcase,
    Shield,
    Trees,
    Zap,
    Wrench,
    PartyPopper,
    HelpCircle
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { expenseService, ExpenseAnalytics } from '../../services/expenseService';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';

export default function FinancialsDashboard() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user } = useAuth();
    const [analytics, setAnalytics] = useState<ExpenseAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAnalytics = async () => {
        try {
            const data = await expenseService.getAnalytics();
            setAnalytics(data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAnalytics();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchAnalytics();
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Maintenance': return Briefcase;
            case 'Security': return Shield;
            case 'Landscaping': return Trees;
            case 'Utilities': return Zap;
            case 'Repairs': return Wrench;
            case 'Events': return PartyPopper;
            default: return HelpCircle;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Maintenance': return '#3b82f6';
            case 'Security': return '#ef4444';
            case 'Landscaping': return '#22c55e';
            case 'Utilities': return '#eab308';
            case 'Repairs': return '#f97316';
            case 'Events': return '#8b5cf6';
            default: return '#64748b';
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen options={{ headerShown: false }} />

            <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                className="px-6 pt-16 pb-6 shadow-sm border-b border-slate-100"
            >
                <View className="flex-row items-center justify-between mb-4">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm active:bg-slate-50"
                    >
                        <Icon icon={ChevronLeft} color="#374151" size={24} />
                    </TouchableOpacity>

                    {user?.role === 'admin' && (
                        <TouchableOpacity
                            onPress={() => router.push('/financials/add')}
                            className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200 active:bg-blue-700"
                        >
                            <Icon icon={Plus} color="white" size={24} />
                        </TouchableOpacity>
                    )}
                </View>

                <Text className="text-3xl font-black text-slate-900 tracking-tight">Financials</Text>
                <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Society Expense Tracker</Text>
            </LinearGradient>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            ) : (
                <ScrollView
                    className="flex-1 p-6"
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />}
                >
                    {/* Financial Overview Cards */}
                    <View className="flex-row justify-between mb-6">
                        {/* Income Card */}
                        <Card className="flex-1 mr-2 p-4 bg-emerald-600 border-emerald-500">
                            <View className="bg-emerald-500/30 w-8 h-8 rounded-lg items-center justify-center mb-2">
                                <Icon icon={IndianRupee} color="white" size={16} />
                            </View>
                            <Text className="text-emerald-100 text-[10px] font-bold uppercase tracking-wider mb-1">Total Income</Text>
                            <Text className="text-white text-xl font-black">₹{analytics?.income?.toLocaleString() || '0'}</Text>
                        </Card>

                        {/* Expense Card */}
                        <Card className="flex-1 ml-2 p-4 bg-rose-600 border-rose-500">
                            <View className="bg-rose-500/30 w-8 h-8 rounded-lg items-center justify-center mb-2">
                                <Icon icon={TrendingUp} color="white" size={16} />
                            </View>
                            <Text className="text-rose-100 text-[10px] font-bold uppercase tracking-wider mb-1">Total Expense</Text>
                            <Text className="text-white text-xl font-black">₹{analytics?.total?.toLocaleString() || '0'}</Text>
                        </Card>
                    </View>

                    {/* Net Balance (Highlight) */}
                    <Card className="p-6 mb-6 bg-slate-900 border-slate-800">
                        <View className="flex-row justify-between items-center">
                            <View>
                                <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Net Balance</Text>
                                <Text className={`text-3xl font-black ${(analytics?.income || 0) - (analytics?.total || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    ₹{((analytics?.income || 0) - (analytics?.total || 0)).toLocaleString()}
                                </Text>
                            </View>
                            <View className={`w-12 h-12 rounded-full items-center justify-center ${(analytics?.income || 0) - (analytics?.total || 0) >= 0 ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                                <Icon
                                    icon={(analytics?.income || 0) - (analytics?.total || 0) >= 0 ? TrendingUp : TrendingUp}
                                    color={(analytics?.income || 0) - (analytics?.total || 0) >= 0 ? '#34d399' : '#fb7185'}
                                    size={24}
                                />
                            </View>
                        </View>
                    </Card>

                    {/* Category Breakdown */}
                    <View className="mb-6">
                        <Text className="text-slate-900 font-bold text-lg mb-4">Expense Breakdown</Text>
                        <View className="flex-row flex-wrap justify-between">
                            {analytics?.byCategory.map((item, index) => {
                                const CategoryIcon = getCategoryIcon(item.category);
                                const color = getCategoryColor(item.category);
                                return (
                                    <View key={index} className="w-[48%] mb-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <View className="flex-row justify-between items-start mb-3">
                                            <View style={{ backgroundColor: `${color}15` }} className="p-2.5 rounded-xl">
                                                <Icon icon={CategoryIcon} color={color} size={20} />
                                            </View>
                                        </View>
                                        <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1" numberOfLines={1}>{item.category}</Text>
                                        <Text className="text-slate-900 text-xl font-black">₹{Number(item.total).toLocaleString()}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    {/* Recent Transactions */}
                    <View className="mb-8">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-slate-900 font-bold text-lg">Recent Transactions</Text>
                            {/* <TouchableOpacity>
                                <Text className="text-blue-600 font-bold text-sm">See All</Text>
                            </TouchableOpacity> */}
                        </View>

                        {analytics?.recent.map((expense) => {
                            const CategoryIcon = getCategoryIcon(expense.category);
                            const color = getCategoryColor(expense.category);
                            return (
                                <Card key={expense.id} className="mb-3 p-4 flex-row items-center">
                                    <View style={{ backgroundColor: `${color}15` }} className="w-12 h-12 rounded-xl items-center justify-center mr-4">
                                        <Icon icon={CategoryIcon} color={color} size={24} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-slate-900 font-bold text-base mb-0.5">{expense.title}</Text>
                                        <View className="flex-row items-center">
                                            <Icon icon={Calendar} color="#94a3b8" size={12} />
                                            <Text className="text-slate-400 text-xs font-medium ml-1">
                                                {new Date(expense.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </Text>
                                            <Text className="text-slate-300 mx-1">•</Text>
                                            <Text className="text-slate-500 text-xs font-medium">{expense.category}</Text>
                                        </View>
                                    </View>
                                    <Text className="text-slate-900 font-black text-lg">-₹{Number(expense.amount).toLocaleString()}</Text>
                                </Card>
                            );
                        })}

                        {analytics?.recent.length === 0 && (
                            <View className="items-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
                                <Text className="text-slate-400 font-medium">No expenses recorded yet</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            )}
        </View>
    );
}
