import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, IndianRupee, Calendar as CalendarIcon, FileText, Check, ChevronDown } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
// Ensure you rebuild the native app (npx expo run:android/ios) after installing this package
import DateTimePicker from '@react-native-community/datetimepicker';
import { expenseService } from '../../services/expenseService';
import { Icon } from '../../components/Icon';

const CATEGORIES = ['Maintenance', 'Security', 'Landscaping', 'Utilities', 'Repairs', 'Events', 'Other'];
const PAYMENT_METHODS = ['Bank Transfer', 'Cash', 'UPI', 'Cheque'];

export default function AddExpense() {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Maintenance',
        date: new Date(),
        description: '',
        paymentMethod: 'Bank Transfer',
        gstAmount: '',
        tdsAmount: ''
    });

    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleSubmit = async () => {
        if (!formData.title || !formData.amount) {
            Alert.alert('Error', 'Please fill in required fields (Title, Amount)');
            return;
        }

        setLoading(true);
        try {
            await expenseService.createExpense({
                title: formData.title,
                amount: parseFloat(formData.amount),
                category: formData.category as any,
                date: formData.date.toISOString(),
                description: formData.description,
                paymentMethod: formData.paymentMethod as any,
                gstAmount: formData.gstAmount ? parseFloat(formData.gstAmount) : 0,
                tdsAmount: formData.tdsAmount ? parseFloat(formData.tdsAmount) : 0,
                isVerified: true
            });
            Alert.alert('Success', 'Expense recorded successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to record expense');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-slate-50"
        >
            <Stack.Screen options={{ headerShown: false }} />

            <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                className="px-6 pt-16 pb-6 shadow-sm border-b border-slate-100 z-10"
            >
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mr-4 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm active:bg-slate-50"
                    >
                        <Icon icon={ChevronLeft} color="#374151" size={24} />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-2xl font-black text-slate-900 tracking-tight">Add Expense</Text>
                        <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Record Transaction</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                {/* Amount Section */}
                <View className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-6">
                    <Text className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Total Amount</Text>
                    <View className="flex-row items-center">
                        <Icon icon={IndianRupee} color="#0f172a" size={32} />
                        <TextInput
                            className="flex-1 text-4xl font-black text-slate-900 ml-2"
                            placeholder="0.00"
                            placeholderTextColor="#cbd5e1"
                            keyboardType="numeric"
                            value={formData.amount}
                            onChangeText={(text) => setFormData({ ...formData, amount: text })}
                        />
                    </View>
                </View>

                {/* Details Form */}
                <View className="mb-2">
                    <Text className="text-slate-900 font-bold text-lg mb-4">Transaction Details</Text>

                    <View className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-4">
                        <Text className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">Title</Text>
                        <TextInput
                            className="text-slate-900 font-bold text-base py-2 border-b border-slate-100"
                            placeholder="e.g., Security Service Payment"
                            value={formData.title}
                            onChangeText={(text) => setFormData({ ...formData, title: text })}
                        />
                    </View>

                    <View className="flex-row justify-between mb-4">
                        {/* Date Picker Trigger */}
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(true)}
                            className="flex-1 mr-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
                        >
                            <Text className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">Date</Text>
                            <View className="flex-row items-center">
                                <Icon icon={CalendarIcon} color="#64748b" size={16} />
                                <Text className="text-slate-900 font-bold text-base ml-2">
                                    {formData.date.toLocaleDateString()}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Category Selector (Simple ScrollView for now or just first item) */}
                        {/* Implementing a simple Category selector UI is better than native picker for consistency */}
                        <View className="flex-1 ml-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <Text className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">Category</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View className="flex-row items-center">
                                    <Text className="text-slate-900 font-bold text-base mr-2">{formData.category}</Text>
                                    {/* In a real app, this would open a modal */}
                                </View>
                            </ScrollView>
                        </View>
                    </View>

                    {/* Category Selection Chips (Better UX) */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setFormData({ ...formData, category: cat })}
                                className={`mr-2 px-4 py-2 rounded-xl border ${formData.category === cat
                                    ? 'bg-blue-600 border-blue-600'
                                    : 'bg-white border-slate-200'
                                    }`}
                            >
                                <Text className={`text-xs font-bold ${formData.category === cat ? 'text-white' : 'text-slate-500'
                                    }`}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-4">
                        <Text className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-2">Description</Text>
                        <TextInput
                            className="text-slate-900 font-medium text-sm py-2 h-20"
                            placeholder="Add notes..."
                            multiline
                            textAlignVertical="top"
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                        />
                    </View>

                    {/* Tax Details */}
                    <Text className="text-slate-900 font-bold text-lg mb-4 mt-2">Tax & Audit</Text>
                    <View className="flex-row mb-6">
                        <View className="flex-1 mr-2 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">GST Amount</Text>
                            <TextInput
                                className="text-slate-900 font-bold text-base"
                                placeholder="0.00"
                                keyboardType="numeric"
                                value={formData.gstAmount}
                                onChangeText={(text) => setFormData({ ...formData, gstAmount: text })}
                            />
                        </View>
                        <View className="flex-1 ml-2 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-wider mb-1">TDS Deducted</Text>
                            <TextInput
                                className="text-slate-900 font-bold text-base"
                                placeholder="0.00"
                                keyboardType="numeric"
                                value={formData.tdsAmount}
                                onChangeText={(text) => setFormData({ ...formData, tdsAmount: text })}
                            />
                        </View>
                    </View>
                </View>

                <View className="h-32" />
            </ScrollView>

            {/* Bottom Action Bar */}
            <View className="absolute bottom-0 left-0 right-0 bg-white px-6 py-6 border-t border-slate-100">
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    className="bg-blue-600 py-4 rounded-2xl shadow-lg shadow-blue-300 flex-row items-center justify-center"
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Text className="text-white font-black text-base uppercase tracking-wider mr-2">Save Expense</Text>
                            <Icon icon={Check} color="white" size={20} />
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={formData.date}
                    mode="date"
                    display="default"
                    onChange={(event: any, selectedDate?: Date) => {
                        setShowDatePicker(false);
                        if (selectedDate) setFormData({ ...formData, date: selectedDate });
                    }}
                />
            )}
        </KeyboardAvoidingView>
    );
}
