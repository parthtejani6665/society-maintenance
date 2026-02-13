import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image as ImageIcon, Video, X, ChevronLeft, Droplet, Building, Sparkles, Shield, Car, AlertCircle, FileText, Send } from 'lucide-react-native';
import { complaintService } from '../../services/complaintService';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Icon } from '../../components/Icon';
import { Theme } from '../../constants/Theme';
import { useTranslation } from 'react-i18next';

const CATEGORIES = [
    { label: 'Water', value: 'water', icon: Droplet, color: '#3b82f6' },
    { label: 'Lift', value: 'lift', icon: Building, color: '#8b5cf6' },
    { label: 'Cleaning', value: 'cleaning', icon: Sparkles, color: '#10b981' },
    { label: 'Security', value: 'security', icon: Shield, color: '#ef4444' },
    { label: 'Parking', value: 'parking', icon: Car, color: '#f59e0b' },
    { label: 'Other', value: 'other', icon: AlertCircle, color: '#6b7280' }
];

export default function NewComplaint() {
    const { t } = useTranslation();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0].value);
    const [image, setImage] = useState<string | null>(null);
    const [video, setVideo] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleMediaPress = (type: 'image' | 'video') => {
        Alert.alert(
            `Add ${type === 'image' ? 'Photo' : 'Video'}`,
            t('complaints.chooseSource'),
            [
                { text: t('common.camera'), onPress: () => pickMedia(type, 'camera') },
                { text: t('common.gallery'), onPress: () => pickMedia(type, 'library') },
                { text: t('common.cancel'), style: 'cancel' }
            ]
        );
    };

    const pickMedia = async (type: 'image' | 'video', source: 'library' | 'camera') => {
        const permission = source === 'library'
            ? await ImagePicker.requestMediaLibraryPermissionsAsync()
            : await ImagePicker.requestCameraPermissionsAsync();

        if (permission.status !== 'granted') {
            Alert.alert(t('complaints.permissionDenied'), t('complaints.permissionMessage'));
            return;
        }

        const options: ImagePicker.ImagePickerOptions = {
            mediaTypes: type === 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        };

        const result = source === 'library'
            ? await ImagePicker.launchImageLibraryAsync(options)
            : await ImagePicker.launchCameraAsync(options);

        if (!result.canceled) {
            if (type === 'image') setImage(result.assets[0].uri);
            else setVideo(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) {
            Alert.alert(t('common.error'), t('common.fillAllFields'));
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', category);

            if (image) {
                const filename = image.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : `image`;
                formData.append('image', { uri: image, name: filename, type } as any);
            }

            if (video) {
                const filename = video.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `video/${match[1]}` : `video`;
                formData.append('video', { uri: video, name: filename, type } as any);
            }

            await complaintService.createComplaint(formData);
            Alert.alert(t('common.success'), t('complaints.submitSuccess'), [
                { text: t('common.ok'), onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert(t('common.error'), t('complaints.submitError'));
        } finally {
            setLoading(false);
        }
    };


    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Enhanced Header */}
            <View className="bg-white px-5 pt-14 pb-5 flex-row items-center border-b border-slate-100 shadow-sm shadow-slate-200/50 z-20">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-slate-50 p-2.5 rounded-xl mr-4 border border-slate-100 active:bg-slate-100"
                >
                    <Icon icon={ChevronLeft} color="#475569" size={24} />
                </TouchableOpacity>
                <View>
                    <Text className="text-2xl font-black text-slate-900">{t('complaints.newComplaint')}</Text>
                    <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-0.5">{t('complaints.newSubtitle')}</Text>
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                {/* Title and Description */}
                <Card className="mb-6 p-6">

                    <Input
                        label={t('complaints.complaintTitle')}
                        placeholder={t('complaints.titlePlaceholderInput')}
                        value={title}
                        onChangeText={setTitle}
                        icon={<Icon icon={AlertCircle} color="#94a3b8" size={20} />}
                        containerClassName="mb-6"
                    />

                    <Text className="text-slate-700 font-bold mb-3 text-sm ml-1">{t('complaints.detailedDescription')}</Text>
                    <View className="bg-slate-50 border border-slate-200 rounded-3xl p-4 min-h-[140px] mb-2 focus:border-blue-500">
                        <TextInput
                            className="flex-1 text-slate-900 text-base leading-6"
                            placeholder={t('complaints.descriptionPlaceholder')}
                            placeholderTextColor="#94a3b8"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>
                </Card>


                {/* Category Selection */}
                <Card className="mb-6 p-6">
                    <Text className="text-slate-900 font-black text-lg mb-5">{t('complaints.categorizeIssue')}</Text>
                    <View className="flex-row flex-wrap gap-3">
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.value}
                                onPress={() => setCategory(cat.value)}
                                className={`flex-row items-center px-4 py-3 rounded-2xl border-2 ${category === cat.value
                                    ? 'border-blue-800 bg-blue-50'
                                    : 'bg-white border-slate-100'
                                    }`}
                                activeOpacity={0.7}
                            >
                                <Icon
                                    icon={cat.icon}
                                    color={category === cat.value ? Theme.colors.primary : '#94a3b8'}
                                    size={18}
                                />
                                <Text
                                    className={`ml-2 ${category === cat.value ? 'text-blue-900 font-black' : 'text-slate-500 font-bold'
                                        } text-[13px] tracking-tight`}
                                >
                                    {t(`complaints.categories.${cat.value}`)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Card>

                {/* Media Attachments */}
                <Card className="mb-8 p-6">
                    <Text className="text-slate-900 font-black text-lg mb-5">{t('complaints.keepEvidence')}</Text>
                    <View className="flex-row gap-4 mb-6">
                        <TouchableOpacity
                            onPress={() => handleMediaPress('image')}
                            className={`flex-1 h-32 rounded-[32px] justify-center items-center border-2 border-dashed ${image ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-200'} active:opacity-75`}
                        >
                            <View className={`w-12 h-12 rounded-2xl items-center justify-center mb-2 ${image ? 'bg-blue-800' : 'bg-slate-200'}`}>
                                <Icon icon={ImageIcon} color={image ? 'white' : '#94a3b8'} size={24} />
                            </View>
                            <Text className={`text-[10px] font-black uppercase tracking-widest ${image ? 'text-blue-800' : 'text-slate-400'}`}>
                                {image ? t('complaints.photoAdded') : t('complaints.addPhoto')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => handleMediaPress('video')}
                            className={`flex-1 h-32 rounded-[32px] justify-center items-center border-2 border-dashed ${video ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-200'} active:opacity-75`}
                        >
                            <View className={`w-12 h-12 rounded-2xl items-center justify-center mb-2 ${video ? 'bg-blue-800' : 'bg-slate-200'}`}>
                                <Icon icon={Video} color={video ? 'white' : '#94a3b8'} size={24} />
                            </View>
                            <Text className={`text-[10px] font-black uppercase tracking-widest ${video ? 'text-blue-800' : 'text-slate-400'}`}>
                                {video ? t('complaints.videoAdded') : t('complaints.addVideo')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Media Previews */}
                    {(image || video) && (
                        <View className="flex-row flex-wrap gap-4 pt-6 border-t border-slate-100">
                            {image && (
                                <View className="relative">
                                    <View className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm">
                                        <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => setImage(null)}
                                        className="absolute -top-2 -right-2 bg-slate-900 rounded-xl p-1.5 shadow-lg"
                                    >
                                        <Icon icon={X} color="white" size={12} />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {video && (
                                <View className="relative">
                                    <View className="w-24 h-24 rounded-2xl bg-slate-900 items-center justify-center border-2 border-white shadow-sm">
                                        <Icon icon={Video} color="white" size={28} />
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => setVideo(null)}
                                        className="absolute -top-2 -right-2 bg-slate-900 rounded-xl p-1.5 shadow-lg"
                                    >
                                        <Icon icon={X} color="white" size={12} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                </Card>

                {/* Submit Button */}
                <Button
                    title={t('complaints.submitComplaint')}
                    onPress={handleSubmit}
                    loading={loading}
                    variant="primary"
                    className="h-16 bg-blue-800 rounded-3xl shadow-xl shadow-blue-800/20"
                    icon={<Icon icon={Send} color="white" size={20} />}
                />

                <Text className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-6">
                    {t('complaints.resolutionPromise')}
                </Text>
            </ScrollView>
        </View>
    );
}

