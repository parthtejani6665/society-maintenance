import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Plus, Trash2, BarChart2, Calendar, FileText, LayoutList } from 'lucide-react-native';
import { pollService } from '../../services/pollService';
import { useTranslation } from 'react-i18next';
import { Icon } from '../../components/Icon';
import { LinearGradient } from 'expo-linear-gradient';

export default function NewPollScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [question, setQuestion] = useState('');
    const [description, setDescription] = useState('');
    const [days, setDays] = useState('7');
    const [options, setOptions] = useState<string[]>(['', '']);

    const handleAddOption = () => {
        setOptions([...options, '']);
    };

    const handleRemoveOption = (index: number) => {
        if (options.length <= 2) {
            Alert.alert(t('common.error'), t('polls.optionsRequired'));
            return;
        }
        const newOptions = options.filter((_, i) => i !== index);
        setOptions(newOptions);
    };

    const handleOptionChange = (text: string, index: number) => {
        const newOptions = [...options];
        newOptions[index] = text;
        setOptions(newOptions);
    };

    const handleCreate = async () => {
        if (!question.trim()) {
            Alert.alert(t('common.error'), t('polls.questionRequired'));
            return;
        }

        const validOptions = options.filter(opt => opt.trim());
        if (validOptions.length < 2) {
            Alert.alert(t('common.error'), t('polls.optionsRequired'));
            return;
        }

        setLoading(true);
        try {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + parseInt(days));

            await pollService.createPoll({
                question,
                description,
                expiresAt: expiryDate.toISOString(),
                options: validOptions
            });

            Alert.alert(t('common.success'), t('polls.pollSuccess'));
            router.back();
        } catch (error) {
            console.error('Failed to create poll:', error);
            Alert.alert(t('common.error'), 'Failed to create poll. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                className="px-6 pt-16 pb-8 shadow-sm border-b border-slate-100"
            >
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm border border-slate-100 mr-4 active:bg-slate-50"
                    >
                        <Icon icon={ChevronLeft} color="#0f172a" size={24} />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-3xl font-black text-slate-900 tracking-tight">{t('polls.createPoll')}</Text>
                        <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{t('polls.gatherFeedback')}</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
                {/* Information Card */}
                <View className="bg-blue-600/5 p-6 rounded-[32px] mb-8 border border-blue-100/50 flex-row">
                    <View className="w-12 h-12 bg-blue-600 rounded-2xl items-center justify-center mr-4">
                        <Icon icon={BarChart2} color="white" size={24} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-blue-900 font-black text-base mb-1">Make your voice count</Text>
                        <Text className="text-blue-700/70 font-bold text-xs leading-5">
                            Launch a survey to gather collective decisions from society members.
                        </Text>
                    </View>
                </View>

                {/* Question Section */}
                <View className="mb-8">
                    <View className="flex-row items-center mb-4 ml-1">
                        <Icon icon={FileText} color="#64748b" size={18} />
                        <Text className="text-slate-900 font-black text-lg ml-2">{t('polls.question')}</Text>
                    </View>
                    <View className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                        <TextInput
                            className="p-5 text-slate-900 font-bold text-base bg-white"
                            placeholder={t('polls.placeholderQuestion')}
                            value={question}
                            onChangeText={setQuestion}
                            placeholderTextColor="#94a3b8"
                            multiline
                        />
                    </View>
                </View>

                {/* Description Section */}
                <View className="mb-8">
                    <View className="flex-row items-center mb-4 ml-1">
                        <Icon icon={LayoutList} color="#64748b" size={18} />
                        <Text className="text-slate-900 font-black text-lg ml-2">{t('polls.description')}</Text>
                    </View>
                    <View className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden">
                        <TextInput
                            className="p-5 text-slate-900 font-bold text-base min-h-[120px] bg-white"
                            placeholder={t('polls.placeholderDescription')}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            textAlignVertical="top"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                </View>

                {/* Duration Section */}
                <View className="mb-8">
                    <View className="flex-row items-center mb-4 ml-1">
                        <Icon icon={Calendar} color="#64748b" size={18} />
                        <Text className="text-slate-900 font-black text-lg ml-2">{t('polls.duration')}</Text>
                    </View>
                    <View className="flex-row gap-3">
                        {['3', '7', '14', '30'].map((d) => (
                            <TouchableOpacity
                                key={d}
                                onPress={() => setDays(d)}
                                className={`flex-1 h-20 rounded-[20px] items-center justify-center border-2 ${days === d
                                        ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200'
                                        : 'bg-white border-slate-100'
                                    }`}
                                activeOpacity={0.7}
                            >
                                <Text className={`font-black text-xl ${days === d ? 'text-white' : 'text-slate-900'}`}>
                                    {d}
                                </Text>
                                <Text className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${days === d ? 'text-blue-100' : 'text-slate-400'}`}>
                                    {t('polls.days')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Options Section */}
                <View className="mb-10">
                    <View className="flex-row items-center mb-4 ml-1">
                        <Icon icon={LayoutList} color="#64748b" size={18} />
                        <Text className="text-slate-900 font-black text-lg ml-2">{t('polls.options')}</Text>
                    </View>

                    {options.map((option, index) => (
                        <View key={index} className="flex-row items-center mb-4">
                            <View className="flex-1 flex-row items-center h-16 bg-white rounded-[20px] shadow-sm border border-slate-100 pr-3">
                                <View className="w-10 h-10 bg-slate-50 items-center justify-center rounded-xl ml-3">
                                    <Text className="text-slate-400 font-black text-sm">{index + 1}</Text>
                                </View>
                                <TextInput
                                    className="flex-1 px-4 text-slate-900 font-bold text-base"
                                    placeholder={`Option ${index + 1}`}
                                    value={option}
                                    onChangeText={(text) => handleOptionChange(text, index)}
                                    placeholderTextColor="#cbd5e1"
                                />
                            </View>
                            {options.length > 2 && (
                                <TouchableOpacity
                                    onPress={() => handleRemoveOption(index)}
                                    className="ml-3 w-12 h-12 bg-rose-50 rounded-2xl items-center justify-center border border-rose-100 active:bg-rose-100"
                                >
                                    <Icon icon={Trash2} color="#f43f5e" size={20} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    <TouchableOpacity
                        onPress={handleAddOption}
                        className="flex-row items-center justify-center h-16 border-2 border-dashed border-slate-200 rounded-[24px] bg-slate-50/50 mt-2 active:bg-slate-100"
                        activeOpacity={0.7}
                    >
                        <Icon icon={Plus} color="#64748b" size={20} />
                        <Text className="text-slate-500 font-black ml-2 text-base">{t('polls.addOption')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleCreate}
                    disabled={loading}
                    className={`h-20 bg-blue-600 rounded-[28px] flex-row justify-center items-center shadow-xl shadow-blue-200 ${loading ? 'opacity-80' : ''
                        }`}
                    activeOpacity={0.9}
                >
                    {loading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <>
                            <Icon icon={BarChart2} color="white" size={24} />
                            <Text className="text-white font-black text-xl ml-3 tracking-tight">{t('polls.launchPoll')}</Text>
                        </>
                    )}
                </TouchableOpacity>

                <Text className="text-center text-slate-400 font-bold text-[10px] mt-6 uppercase tracking-widest">
                    All residents will be notified instantly
                </Text>
            </ScrollView>
        </View>
    );
}
