import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Languages, LogOut, User as UserIcon, Settings, Bell, ChevronRight, CreditCard, Camera } from 'lucide-react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import * as ImagePicker from 'expo-image-picker';
import { userService } from '../../services/userService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Profile() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user, signOut, signIn, refreshUser } = useAuth();
    const insets = useSafeAreaInsets();
    const [uploading, setUploading] = useState(false);

    const changeLanguage = async (lng: string) => {
        await i18n.changeLanguage(lng);
        await AsyncStorage.setItem('user-language', lng);
    };

    const handlePickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert("Permission Required", "You've refused to allow this app to access your photos!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            handleUpload(result.assets[0].uri);
        }
    };

    const handleUpload = async (uri: string) => {
        setUploading(true);
        try {
            const response = await userService.uploadProfileImage(uri);
            Alert.alert("Success", "Profile photo updated successfully!");

            // Update local user state with new avatar
            // Update local user state with new avatar
            // We need to re-sign in or update context to reflect changes immediately
            if (user) {
                await refreshUser();
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to upload profile photo.");
        } finally {
            setUploading(false);
        }
    };

    const SettingItem = ({ icon, label, onPress, color = '#64748b' }: any) => (
        <TouchableOpacity
            className="flex-row items-center py-4 active:opacity-60"
            onPress={onPress}
        >
            <View className="w-10 h-10 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: `${color}15` }}>
                <Icon icon={icon} color={color} size={20} />
            </View>
            <Text className="flex-1 text-slate-800 font-bold text-base">{label}</Text>
            <Icon icon={ChevronRight} color="#cbd5e1" size={18} />
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-slate-50">
            {/* Professional Header */}
            <View
                className="bg-white px-6 pb-6 border-b border-slate-100 shadow-sm shadow-slate-200/50"
                style={{ paddingTop: insets.top + 10 }}
            >
                <Text className="text-3xl font-black text-slate-900">Profile</Text>
                <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">Account & Preferences</Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
                {/* Modern Profile Header */}
                <View className="items-center mb-8">
                    <View className="relative">
                        <TouchableOpacity onPress={handlePickImage} disabled={uploading}>
                            <View className="w-32 h-32 bg-white rounded-[40px] justify-center items-center shadow-xl shadow-blue-500/20 border-4 border-white overflow-hidden">
                                {user?.avatar ? (
                                    <Image source={{ uri: user.avatar }} className="w-full h-full" />
                                ) : (
                                    <View className="w-full h-full bg-blue-50 items-center justify-center">
                                        <Text className="text-5xl font-black text-blue-800">{user?.fullName?.charAt(0)}</Text>
                                    </View>
                                )}
                                {uploading && (
                                    <View className="absolute inset-0 bg-black/30 items-center justify-center">
                                        <ActivityIndicator color="white" />
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handlePickImage}
                            className="absolute bottom-0 right-0 bg-blue-600 w-10 h-10 rounded-full border-4 border-white items-center justify-center shadow-lg"
                        >
                            <Icon icon={Camera} color="white" size={16} />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-2xl font-black text-slate-900 mt-4">{user?.fullName}</Text>
                    <Text className="text-slate-400 font-bold text-sm tracking-tight">{user?.email}</Text>

                    <View className="flex-row mt-4 gap-2">
                        <View className="bg-blue-800 px-4 py-1.5 rounded-full shadow-lg shadow-blue-800/20">
                            <Text className="text-white font-black text-[10px] uppercase tracking-widest">{user?.role}</Text>
                        </View>
                        {user?.flatNumber && (
                            <View className="bg-white border border-slate-200 px-4 py-1.5 rounded-full">
                                <Text className="text-slate-600 font-black text-[10px] uppercase tracking-widest">Flat {user.flatNumber}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Settings Card */}
                <Card className="p-6 mb-6">
                    <Text className="text-slate-900 font-black text-lg mb-4">Account Settings</Text>
                    <SettingItem
                        icon={UserIcon}
                        label={t('profile.editProfile')}
                        onPress={() => router.push('/profile/edit')}
                        color="#2563eb"
                    />
                    <View className="h-[1px] bg-slate-100 ml-14" />
                    <SettingItem
                        icon={Bell}
                        label="Notifications"
                        onPress={() => { }}
                        color="#f59e0b"
                    />
                    <View className="h-[1px] bg-slate-100 ml-14" />
                    <SettingItem
                        icon={CreditCard}
                        label="Payment History"
                        onPress={() => router.push('/(tabs)/maintenance')}
                        color="#10b981"
                    />
                </Card>

                {/* Language Switcher Card */}
                <Card className="p-6 mb-8">
                    <View className="flex-row items-center mb-5">
                        <View className="w-10 h-10 rounded-xl bg-purple-50 items-center justify-center mr-4">
                            <Icon icon={Languages} color="#8b5cf6" size={20} />
                        </View>
                        <Text className="text-slate-900 font-black text-lg">{t('profile.language')}</Text>
                    </View>

                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={() => changeLanguage('en')}
                            className={`flex-1 py-4 rounded-2xl border-2 items-center ${i18n.language === 'en'
                                ? 'bg-blue-800 border-blue-800'
                                : 'bg-slate-50 border-slate-100'
                                }`}
                            activeOpacity={0.8}
                        >
                            <Text className={`font-black uppercase tracking-widest text-[12px] ${i18n.language === 'en' ? 'text-white' : 'text-slate-400'}`}>
                                {t('profile.english')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => changeLanguage('hi')}
                            className={`flex-1 py-4 rounded-2xl border-2 items-center ${i18n.language === 'hi'
                                ? 'bg-blue-800 border-blue-800'
                                : 'bg-slate-50 border-slate-100'
                                }`}
                            activeOpacity={0.8}
                        >
                            <Text className={`font-black uppercase tracking-widest text-[12px] ${i18n.language === 'hi' ? 'text-white' : 'text-slate-400'}`}>
                                {t('profile.hindi')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Card>

                {/* Logout Button */}
                <Button
                    title={t('profile.logout')}
                    onPress={signOut}
                    variant="outline"
                    className="h-16 border-rose-200 bg-rose-50 rounded-3xl mb-10"
                    icon={<Icon icon={LogOut} color="#ef4444" size={20} />}
                />
            </ScrollView>
        </View>
    );
}

