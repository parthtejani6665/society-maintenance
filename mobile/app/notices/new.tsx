import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Info, AlertTriangle, Calendar as CalendarIcon, ChevronLeft, Save } from 'lucide-react-native';
import { noticeService } from '../../services/noticeService';
import { useTranslation } from 'react-i18next';

function TabBarIcon(props: { icon: any; color: string; size?: number }) {
    const { icon: Icon, color, size = 24 } = props;
    return <Icon size={size} color={color} />;
}

export default function NewNoticeScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState<'info' | 'warning' | 'event'>('info');

    const handleCreate = async () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert(t('common.error'), t('common.fillAllFields'));
            return;
        }

        setLoading(true);
        try {
            await noticeService.createNotice({
                title,
                content,
                type,
                isPublic: true
            });
            Alert.alert(t('common.success'), t('notices.postSuccess'));
            router.back();
        } catch (error) {
            console.error('Failed to create notice:', error);
            Alert.alert(t('common.error'), t('notices.postError'));
        } finally {
            setLoading(false);
        }
    };

    const typeOptions = [
        { id: 'info', label: t('notices.info'), icon: Info, color: '#3b82f6', activeBg: 'bg-blue-600', inactiveBg: 'bg-blue-50', activeText: 'text-white', inactiveText: 'text-blue-600' },
        { id: 'warning', label: t('notices.warning'), icon: AlertTriangle, color: '#ef4444', activeBg: 'bg-red-600', inactiveBg: 'bg-red-50', activeText: 'text-white', inactiveText: 'text-red-600' },
        { id: 'event', label: t('notices.event'), icon: CalendarIcon, color: '#a855f7', activeBg: 'bg-purple-600', inactiveBg: 'bg-purple-50', activeText: 'text-white', inactiveText: 'text-purple-600' },
    ];

    return (
        <View className="flex-1 bg-gradient-to-b from-purple-50 to-white">
            {/* Header */}
            <View className="bg-white pt-14 pb-5 px-6 shadow-lg shadow-gray-200/50 flex-row items-center">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-gray-100 p-2.5 rounded-xl mr-4 active:bg-gray-200"
                >
                    <TabBarIcon icon={ChevronLeft} color="#374151" size={22} />
                </TouchableOpacity>
                <View>
                    <Text className="text-2xl font-extrabold text-gray-900">{t('notices.newNotice')}</Text>
                    <Text className="text-gray-500 text-sm mt-0.5">{t('notices.createSubtitle')}</Text>
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                <View className="bg-blue-50 p-4 rounded-2xl mb-6 border border-blue-100">
                    <Text className="text-blue-800 text-sm leading-6">
                        {t('notices.visibilityWarning')}
                    </Text>
                </View>

                {/* Type Selection */}
                <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
                    <Text className="text-gray-700 font-extrabold mb-4 text-base">{t('notices.typeLabel')} *</Text>
                    <View className="flex-row gap-3">
                        {typeOptions.map((opt) => (
                            <TouchableOpacity
                                key={opt.id}
                                onPress={() => setType(opt.id as any)}
                                className={`flex-1 p-4 rounded-2xl items-center border-2 ${type === opt.id
                                    ? 'border-transparent shadow-lg ' + opt.activeBg
                                    : 'border-gray-200 ' + opt.inactiveBg
                                    }`}
                                activeOpacity={0.7}
                            >
                                <TabBarIcon icon={opt.icon} color={type === opt.id ? 'white' : opt.color} size={24} />
                                <Text className={`text-xs font-extrabold mt-2 ${type === opt.id ? 'text-white' : opt.inactiveText}`}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Title */}
                <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
                    <Text className="text-gray-700 font-extrabold mb-3 text-base">{t('notices.titleLabel')} *</Text>
                    <TextInput
                        className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800 font-medium text-base"
                        placeholder={t('notices.titlePlaceholder')}
                        value={title}
                        onChangeText={setTitle}
                        placeholderTextColor="#9ca3af"
                    />
                </View>

                {/* Content */}
                <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <Text className="text-gray-700 font-extrabold mb-3 text-base">{t('notices.contentLabel')} *</Text>
                    <TextInput
                        className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800 min-h-[160px] text-base"
                        placeholder={t('notices.contentPlaceholder')}
                        value={content}
                        onChangeText={setContent}
                        multiline
                        textAlignVertical="top"
                        placeholderTextColor="#9ca3af"
                    />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleCreate}
                    disabled={loading}
                    className={`bg-blue-600 p-5 rounded-2xl flex-row justify-center items-center shadow-xl shadow-blue-500/30 active:bg-blue-700 ${loading ? 'opacity-70' : ''
                        }`}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <>
                            <TabBarIcon icon={Save} color="white" size={22} />
                            <Text className="text-white font-extrabold text-lg ml-2">{t('notices.postButton')}</Text>
                        </>
                    )}
                </TouchableOpacity>

                <Text className="text-center text-gray-400 text-xs mt-4">
                    {t('notices.notifyAll')}
                </Text>
            </ScrollView>
        </View>
    );
}
