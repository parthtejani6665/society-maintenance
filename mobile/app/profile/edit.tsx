import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, User, Phone, Home, Mail, Save } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { useTranslation } from 'react-i18next';

function TabBarIcon(props: { icon: any; color: string; size?: number }) {
    const { icon: Icon, color, size = 24 } = props;
    return <Icon size={size} color={color} />;
}

export default function EditProfile() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user, signIn } = useAuth();

    // Initialize state with current user data
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
    const [flatNumber, setFlatNumber] = useState(user?.flatNumber || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!fullName.trim()) {
            Alert.alert(t('common.error'), t('profile.fullNameRequired'));
            return;
        }

        setLoading(true);
        try {
            const updatedUser = await userService.updateProfile({
                fullName,
                phoneNumber,
                flatNumber: user?.role === 'resident' ? flatNumber : undefined,
            });

            // Update local user context
            // We need to re-login or simpler, just update the user state in context
            // The signIn method takes (token, userData). We can reuse the existing token.
            // But we need the token. AuthContext doesn't expose it directly, but we can assume it's stored.
            // Actually signIn updates both token and user. If we pass the same token, it should work.
            // However, we don't have the token here readily unless we store it in a state or fetch it.
            // Let's check AuthContext again. It uses SecureStore.
            // For now, let's just show success and maybe the context will reload on app restart, 
            // OR we should ideally add an `updateUser` method to AuthContext.
            // But `signIn` updates the user state. We can fetch the token from SecureStore?
            // "import * as SecureStore from 'expo-secure-store';" is needed.

            // Re-fetching token to update context
            const token = await import('expo-secure-store').then(s => s.getItemAsync('token'));
            if (token) {
                await signIn(token, updatedUser);
            }

            Alert.alert(t('common.success'), t('profile.updateSuccess'), [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert(t('common.error'), t('profile.updateFailed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-gradient-to-b from-blue-50 to-white">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="bg-white px-6 pt-14 pb-5 shadow-lg shadow-gray-200/50 flex-row items-center">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-gray-100 p-2.5 rounded-xl mr-4 active:bg-gray-200"
                >
                    <TabBarIcon icon={ChevronLeft} color="#374151" size={22} />
                </TouchableOpacity>
                <View>
                    <Text className="text-2xl font-extrabold text-gray-900">{t('profile.editProfile')}</Text>
                    <Text className="text-gray-500 text-sm mt-0.5">{t('profile.updateInfo')}</Text>
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                {/* Full Name */}
                <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
                    <View className="flex-row items-center mb-3">
                        <View className="bg-blue-50 p-2 rounded-lg mr-3">
                            <TabBarIcon icon={User} color="#2563eb" size={20} />
                        </View>
                        <Text className="text-gray-700 font-bold text-base">{t('profile.fullName')} *</Text>
                    </View>
                    <TextInput
                        className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800 text-base"
                        placeholder={t('profile.enterFullName')}
                        placeholderTextColor="#9ca3af"
                        value={fullName}
                        onChangeText={setFullName}
                    />
                </View>

                {/* Phone Number */}
                <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
                    <View className="flex-row items-center mb-3">
                        <View className="bg-green-50 p-2 rounded-lg mr-3">
                            <TabBarIcon icon={Phone} color="#16a34a" size={20} />
                        </View>
                        <Text className="text-gray-700 font-bold text-base">{t('profile.phoneNumber')}</Text>
                    </View>
                    <TextInput
                        className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800 text-base"
                        placeholder={t('profile.enterPhoneNumber')}
                        placeholderTextColor="#9ca3af"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                    />
                </View>

                {/* Flat Number (Residents only) */}
                {user?.role === 'resident' && (
                    <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
                        <View className="flex-row items-center mb-3">
                            <View className="bg-purple-50 p-2 rounded-lg mr-3">
                                <TabBarIcon icon={Home} color="#a855f7" size={20} />
                            </View>
                            <Text className="text-gray-700 font-bold text-base">{t('profile.flatNumber')}</Text>
                        </View>
                        <TextInput
                            className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 text-gray-800 text-base"
                            placeholder={t('profile.enterFlatNumber')}
                            placeholderTextColor="#9ca3af"
                            value={flatNumber}
                            onChangeText={setFlatNumber}
                        />
                    </View>
                )}

                {/* Email (Read-only) */}
                <View className="bg-gray-100 p-5 rounded-2xl border border-gray-200 mb-6">
                    <View className="flex-row items-center mb-3">
                        <View className="bg-gray-200 p-2 rounded-lg mr-3">
                            <TabBarIcon icon={Mail} color="#6b7280" size={20} />
                        </View>
                        <Text className="text-gray-600 font-bold text-base">{t('profile.emailAddress')}</Text>
                    </View>
                    <TextInput
                        className="border-2 border-gray-300 rounded-xl p-4 bg-gray-200 text-gray-600 text-base"
                        value={user?.email}
                        editable={false}
                    />
                    <View className="flex-row items-center mt-3 bg-yellow-50 p-3 rounded-lg">
                        <Text className="text-yellow-700 text-xs">{t('profile.emailLocked')}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    className={`bg-blue-800 p-5 rounded-2xl items-center shadow-xl shadow-blue-800/20 flex-row justify-center ${loading ? 'opacity-70' : ''
                        }`}
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <>
                            <TabBarIcon icon={Save} color="white" size={22} />
                            <Text className="text-white font-extrabold text-lg ml-2">{t('profile.saveChanges')}</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
