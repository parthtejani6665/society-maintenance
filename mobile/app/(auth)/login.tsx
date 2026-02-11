import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Building2, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import api from '../../services/api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { signIn } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;
            await signIn(token, user);
        } catch (error: any) {
            Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
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
                    {/* Logo and Header */}
                    <View className="items-center mb-12">
                        <View className="bg-blue-800 w-24 h-24 rounded-3xl items-center justify-center mb-6 shadow-xl shadow-blue-500/30">
                            <Icon icon={Building2} color="white" size={48} />
                        </View>
                        <Text className="text-4xl font-extrabold text-slate-900 mb-2">Digital Dwell</Text>
                        <Text className="text-slate-500 text-lg text-center px-4">
                            Premium Society Management & Services
                        </Text>
                    </View>

                    {/* Login Form */}
                    <Card className="shadow-2xl shadow-slate-300">
                        <Text className="text-2xl font-bold text-slate-900 mb-6">Welcome Back</Text>

                        <Input
                            label="Email Address"
                            placeholder="your.email@example.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            icon={<Icon icon={Mail} color="#64748b" size={20} />}
                        />

                        <View>
                            <Input
                                label="Password"
                                placeholder="••••••••"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                icon={<Icon icon={Lock} color="#64748b" size={20} />}
                                containerClassName="mb-2"
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-[48px]"
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                {showPassword ? <Icon icon={EyeOff} color="#64748b" size={20} /> : <Icon icon={Eye} color="#64748b" size={20} />}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity className="mb-8" activeOpacity={0.7}>
                            <Text className="text-blue-700 font-bold text-right">Forgot Password?</Text>
                        </TouchableOpacity>

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={loading}
                            className="bg-blue-800"
                        />
                    </Card>

                    {/* Footer */}
                    <View className="mt-12 items-center">
                        <Text className="text-slate-400 text-sm font-medium">
                            Society Management System v1.0
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

