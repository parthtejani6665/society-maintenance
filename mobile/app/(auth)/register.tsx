import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { Building2, Mail, Lock, Eye, EyeOff, User, Phone, Home } from 'lucide-react-native';
import api from '../../services/api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Register() {
    const { t } = useTranslation();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [flatNumber, setFlatNumber] = useState('');

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const router = useRouter();
    const { signIn } = useAuth();

    const handleRegister = async () => {
        if (!fullName || !email || !password || !confirmPassword || !phoneNumber || !flatNumber) {
            Alert.alert(t('common.error'), 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert(t('common.error'), t('auth.passwordMismatch'));
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/register', {
                fullName,
                email,
                password,
                phoneNumber,
                flatNumber
            });
            const { token, user } = response.data;
            await signIn(token, user);

            Alert.alert(t('common.success'), t('auth.accountCreated'));
            // Navigation handled by auth context state change or we can force it
            // router.replace('/(tabs)'); 
        } catch (error: any) {
            Alert.alert(t('auth.registrationFailed'), error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-slate-50"
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                className="flex-1"
            >
                <View className="flex-1 justify-center px-6 py-12">
                    {/* Header */}
                    <View className="items-center mb-10">
                        <View className="bg-blue-800 w-20 h-20 rounded-2xl items-center justify-center mb-4 shadow-xl shadow-blue-500/30">
                            <Icon icon={Building2} color="white" size={40} />
                        </View>
                        <Text className="text-3xl font-extrabold text-slate-900 mb-1">{t('auth.createAccount')}</Text>
                        <Text className="text-slate-500 text-center px-4">
                            {t('auth.joinSubtitle')}
                        </Text>
                    </View>

                    {/* Registration Form */}
                    <Card className="shadow-2xl shadow-slate-300">
                        <Input
                            label={t('profile.fullName')}
                            placeholder="John Doe"
                            value={fullName}
                            onChangeText={setFullName}
                            icon={<Icon icon={User} color="#64748b" size={20} />}
                        />

                        <Input
                            label={t('profile.emailAddress')}
                            placeholder="your.email@example.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            icon={<Icon icon={Mail} color="#64748b" size={20} />}
                        />

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Input
                                    label={t('profile.phoneNumber')}
                                    placeholder="9876543210"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                    icon={<Icon icon={Phone} color="#64748b" size={20} />}
                                />
                            </View>
                            <View className="flex-1">
                                <Input
                                    label={t('profile.flatNumber')}
                                    placeholder="A-101"
                                    value={flatNumber}
                                    onChangeText={setFlatNumber}
                                    autoCapitalize="characters"
                                    icon={<Icon icon={Home} color="#64748b" size={20} />}
                                />
                            </View>
                        </View>

                        <View>
                            <Input
                                label={t('auth.password')}
                                placeholder="••••••••"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                icon={<Icon icon={Lock} color="#64748b" size={20} />}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-[48px]"
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                {showPassword ? <Icon icon={EyeOff} color="#64748b" size={20} /> : <Icon icon={Eye} color="#64748b" size={20} />}
                            </TouchableOpacity>
                        </View>

                        <View>
                            <Input
                                label={t('auth.confirmPassword')}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showConfirmPassword}
                                icon={<Icon icon={Lock} color="#64748b" size={20} />}
                                containerClassName="mb-6"
                            />
                            <TouchableOpacity
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-[48px]"
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                {showConfirmPassword ? <Icon icon={EyeOff} color="#64748b" size={20} /> : <Icon icon={Eye} color="#64748b" size={20} />}
                            </TouchableOpacity>
                        </View>

                        <Button
                            title={t('auth.signUp')}
                            onPress={handleRegister}
                            loading={loading}
                            className="bg-blue-800 mb-6"
                        />

                        <View className="flex-row justify-center items-center">
                            <Text className="text-slate-600">{t('auth.haveAccount')} </Text>
                            <TouchableOpacity onPress={() => router.back()}>
                                <Text className="text-blue-800 font-bold">{t('auth.signIn')}</Text>
                            </TouchableOpacity>
                        </View>
                    </Card>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
