import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Plus, CheckCircle2, Circle, BarChart2, Calendar, Users } from 'lucide-react-native';
import { pollService } from '../../services/pollService';
import { Poll } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { LinearGradient } from 'expo-linear-gradient';

export default function PollsScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user } = useAuth();
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [voting, setVoting] = useState<string | null>(null);

    const fetchPolls = async () => {
        try {
            const data = await pollService.fetchPolls();
            setPolls(data);
        } catch (error) {
            console.error('Failed to fetch polls:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchPolls();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchPolls();
    };

    const handleVote = async (pollId: string, optionId: string) => {
        setVoting(pollId);
        try {
            await pollService.vote(pollId, optionId);
            Alert.alert(t('common.success'), t('polls.voteSuccess'));
            fetchPolls();
        } catch (error: any) {
            Alert.alert(t('common.error'), error.response?.data?.message || 'Failed to cast vote');
        } finally {
            setVoting(null);
        }
    };

    const calculatePercentage = (count: number, total: number) => {
        if (total === 0) return 0;
        return Math.round((count / total) * 100);
    };

    if (loading && !refreshing) {
        return (
            <View className="flex-1 justify-center items-center bg-slate-50">
                <ActivityIndicator size="large" color="#1e40af" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                className="px-6 pt-16 pb-8 shadow-sm border-b border-slate-100"
            >
                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center flex-1">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm border border-slate-100 mr-4 active:bg-slate-50"
                        >
                            <Icon icon={ChevronLeft} color="#0f172a" size={24} />
                        </TouchableOpacity>
                        <View className="flex-1">
                            <Text className="text-3xl font-black text-slate-900 tracking-tight">{t('polls.title')}</Text>
                            <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{t('polls.voiceOpinion')}</Text>
                        </View>
                    </View>
                    {user?.role === 'admin' && (
                        <TouchableOpacity
                            onPress={() => router.push('/polls/new')}
                            className="w-12 h-12 bg-blue-600 rounded-2xl items-center justify-center shadow-md shadow-blue-200 active:scale-95"
                        >
                            <Icon icon={Plus} color="white" size={24} />
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>

            <FlatList
                data={polls}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 20, paddingTop: 24 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1e40af" />
                }
                ListEmptyComponent={
                    <View className="items-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
                        <View className="w-20 h-20 bg-slate-50 rounded-[30px] items-center justify-center mb-6">
                            <Icon icon={BarChart2} color="#94a3b8" size={32} />
                        </View>
                        <Text className="text-slate-900 text-xl font-black mb-2">{t('polls.noPolls')}</Text>
                        <Text className="text-slate-400 font-bold text-center px-10 leading-5">
                            {t('polls.checkBack')}
                        </Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const hasVoted = item.votes && item.votes.length > 0;
                    const isExpired = new Date() > new Date(item.expiresAt);
                    const totalVotes = item.options.reduce((sum, opt) => sum + (opt.voteCount || 0), 0);

                    return (
                        <Card className="mb-6 p-6 overflow-hidden">
                            <View className="flex-row justify-between items-start mb-6">
                                <View className="flex-1 mr-4">
                                    <View className="flex-row items-center mb-3">
                                        <View className={`w-2.5 h-2.5 rounded-full mr-2.5 ${isExpired ? 'bg-slate-300' : 'bg-emerald-500 animate-pulse'}`} />
                                        <Text className={`text-[10px] font-black uppercase tracking-[2px] ${isExpired ? 'text-slate-400' : 'text-emerald-600'}`}>
                                            {isExpired ? t('polls.closed') : t('polls.active')}
                                        </Text>
                                    </View>
                                    <Text className="text-2xl font-black text-slate-900 leading-tight tracking-tight">{item.question}</Text>
                                </View>
                                {hasVoted && (
                                    <View className="bg-blue-600/10 px-4 py-2 rounded-2xl border border-blue-100">
                                        <Text className="text-blue-600 text-[10px] font-black tracking-widest">{t('polls.voted')}</Text>
                                    </View>
                                )}
                            </View>

                            {item.description && (
                                <View className="bg-slate-50/80 p-5 rounded-3xl mb-6 border border-slate-100">
                                    <Text className="text-slate-600 font-bold text-sm leading-6">{item.description}</Text>
                                </View>
                            )}

                            <View className="space-y-4">
                                {item.options.map((option) => {
                                    const percentage = calculatePercentage(option.voteCount || 0, totalVotes);
                                    const isSelected = hasVoted && item.votes.some((v: any) => v.optionId === option.id);
                                    const showResults = hasVoted || isExpired || user?.role === 'admin';

                                    return (
                                        <TouchableOpacity
                                            key={option.id}
                                            disabled={showResults || voting === item.id}
                                            onPress={() => handleVote(item.id, option.id)}
                                            className={`relative h-16 rounded-[22px] overflow-hidden border-2 ${isSelected
                                                ? 'border-blue-600 bg-blue-50/50'
                                                : 'border-slate-100 bg-slate-50/30'
                                                } ${!showResults ? 'active:bg-slate-100' : ''}`}
                                            activeOpacity={showResults ? 1 : 0.7}
                                        >
                                            {/* Progress Glass Effect */}
                                            {showResults && (
                                                <View
                                                    className={`absolute top-0 bottom-0 left-0 ${isSelected ? 'bg-blue-100' : 'bg-slate-200'}`}
                                                    style={{ width: `${percentage}%`, opacity: 0.5 }}
                                                />
                                            )}

                                            <View className="flex-row fill-current px-5 items-center justify-between h-full z-10">
                                                <Text className={`font-black text-base ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                                                    {option.text}
                                                </Text>

                                                {showResults ? (
                                                    <View className="flex-row items-center">
                                                        <Text className="text-sm font-black text-slate-900 mr-3">{percentage}%</Text>
                                                        {isSelected && (
                                                            <View className="w-6 h-6 bg-blue-600 rounded-full items-center justify-center">
                                                                <Icon icon={CheckCircle2} color="white" size={12} />
                                                            </View>
                                                        )}
                                                    </View>
                                                ) : (
                                                    <Icon icon={Circle} color="#cbd5e1" size={20} />
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            <View className="mt-8 pt-6 border-t border-slate-50 flex-row justify-between items-center">
                                <View className="flex-row items-center bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
                                    <Icon icon={Users} color="#64748b" size={14} />
                                    <Text className="text-xs font-black text-slate-600 ml-2">
                                        {totalVotes} {totalVotes === 1 ? t('polls.vote') : t('polls.votes')}
                                    </Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Icon icon={Calendar} color="#94a3b8" size={14} />
                                    <Text className="text-xs font-bold text-slate-500 ml-2">
                                        {t('polls.ends')}: {new Date(item.expiresAt).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>
                        </Card>
                    );
                }}
            />
        </View>
    );
}
