import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Modal, Pressable, TextInput, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { CheckCircle2, IndianRupee, CreditCard, Wallet, Smartphone, X, Info, Search, ChevronRight, Clock, AlertCircle, ShieldCheck } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { maintenanceService } from '../../services/maintenanceService';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { receiptService } from '../../services/receiptService';
import { Download } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface MaintenanceRecord {
    id: string;
    month: string;
    year: number;
    amount: string;
    status: 'paid' | 'due';
    paidAt: string | null;
    createdAt: string;
    resident: {
        fullName: string;
        flatNumber: string;
    };
}

export default function MaintenanceScreen() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [records, setRecords] = useState<MaintenanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showCardForm, setShowCardForm] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<{ id: string, amount: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'due'>('all');

    // Card Details State
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');


    const [isProcessingCard, setIsProcessingCard] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [accessDenied, setAccessDenied] = useState(false);

    // Admin Generate Dues State
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [genMonth, setGenMonth] = useState('');
    const [genYear, setGenYear] = useState(new Date().getFullYear().toString());
    const [genAmount, setGenAmount] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const fetchRecords = async () => {
        // ... existing fetchRecords code ...
        // Note: I will need to ensure this doesn't block Admin from seeing the screen if that was the issue. 
        // The original fetchRecords had a check: if (user?.role === 'staff') setAccessDenied...
        // Admin should be fine.
        if (user?.role === 'staff') {
            setAccessDenied(true);
            setLoading(false);
            return;
        }

        try {
            setAccessDenied(false);
            const data = await maintenanceService.fetchMaintenanceRecords();
            setRecords(data);
        } catch (error: any) {
            console.error('Failed to fetch maintenance records:', error);
            // ...
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchRecords();
        }, [])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchRecords();
    }, []);

    const handleGenerateDues = async () => {
        if (!genMonth || !genYear || !genAmount) {
            Alert.alert(t('common.error'), 'Please fill all fields');
            return;
        }

        setIsGenerating(true);
        try {
            await maintenanceService.generateDues({
                month: genMonth,
                year: parseInt(genYear),
                amount: parseFloat(genAmount)
            });
            Alert.alert(t('common.success'), 'Maintenance dues generated successfully');
            setShowGenerateModal(false);
            setGenAmount('');
            setGenMonth('');
            fetchRecords();
        } catch (error) {
            Alert.alert(t('common.error'), 'Failed to generate dues');
        } finally {
            setIsGenerating(false);
        }
    };

    const formatCardNumber = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        const groups = cleaned.match(/.{1,4}/g);
        return groups ? groups.join(' ') : cleaned;
    };

    const formatExpiry = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
        }
        return cleaned;
    };

    const processPayment = async (recordId: string, method: string) => {
        try {
            setProcessingId(recordId);
            await maintenanceService.payMaintenance(recordId, method);

            Alert.alert(t('common.success'), t('maintenance.paymentSuccess'));
            setShowPaymentModal(false);
            setShowCardForm(false);
            fetchRecords();
        } catch (error) {
            console.error(error);
            Alert.alert(t('common.error'), t('maintenance.paymentFailed'));
        } finally {
            setProcessingId(null);
            setIsProcessingCard(false);
        }
    };

    const handleCardPayment = () => {
        if (!cardNumber || !expiry || !cvv || !cardName) {
            Alert.alert(t('common.error'), 'Please fill all card details');
            return;
        }

        setIsProcessingCard(true);
        if (selectedRecord) {
            processPayment(selectedRecord.id, 'Credit Card');
        }
    };

    const handlePayNow = (record: MaintenanceRecord) => {
        setSelectedRecord({ id: record.id, amount: record.amount });
        setShowPaymentModal(true);
    };

    const handleDownloadReceipt = async (record: MaintenanceRecord) => {
        try {
            setDownloadingId(record.id);
            if (!record.paidAt) throw new Error('Payment date missing');

            await receiptService.generateAndSave({
                id: record.id,
                month: record.month,
                year: record.year,
                amount: record.amount,
                paidAt: record.paidAt,
                residentName: record.resident.fullName,
                flatNumber: record.resident.flatNumber
            });
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert(t('common.error'), t('maintenance.receiptDownloadFailed'));
        } finally {
            setDownloadingId(null);
        }
    };

    const filteredRecords = records.filter(record => {
        const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
            record.month.toLowerCase().includes(searchLower) ||
            record.year.toString().includes(searchLower) ||
            record.amount.includes(searchLower);

        return matchesStatus && matchesSearch;
    });

    const renderItem = ({ item }: { item: MaintenanceRecord }) => (
        <View className="mb-4">
            <Card className="p-5 border-l-4 border-l-blue-500 rounded-2xl bg-white shadow-sm">
                <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                        <View className="flex-row items-center mb-2">
                            <View className={`px-2.5 py-1 rounded-lg ${item.status === 'paid' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                                <Text className={`text-[10px] font-black uppercase tracking-widest ${item.status === 'paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                                    {item.status === 'paid' ? t('maintenance.paid') : t('maintenance.due')}
                                </Text>
                            </View>
                            <Text className="text-slate-400 text-xs font-bold ml-2">
                                {item.month} {item.year}
                            </Text>
                        </View>
                        <View className="flex-row items-center mb-1">
                            <Icon icon={IndianRupee} size={20} color="#0f172a" strokeWidth={2.5} />
                            <Text className="text-3xl font-black text-slate-900 ml-1">
                                {item.amount}
                            </Text>
                        </View>
                        {item.status === 'paid' && item.paidAt && (
                            <View className="flex-row items-center mt-1">
                                <Icon icon={CheckCircle2} size={12} color="#10b981" />
                                <Text className="text-emerald-600 text-[10px] font-bold ml-1">
                                    {t('maintenance.paidOn', { date: new Date(item.paidAt).toLocaleDateString() })}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View>
                        {item.status === 'due' ? (
                            user?.role !== 'admin' ? (
                                <TouchableOpacity
                                    onPress={() => handlePayNow(item)}
                                    className="bg-blue-600 px-4 py-2 rounded-xl shadow-lg shadow-blue-200 active:bg-blue-700"
                                >
                                    <Text className="text-white font-black text-xs uppercase tracking-widest">
                                        {t('maintenance.payNow')}
                                    </Text>
                                </TouchableOpacity>
                            ) : null
                        ) : (
                            <TouchableOpacity
                                onPress={() => handleDownloadReceipt(item)}
                                disabled={downloadingId === item.id}
                                className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 active:bg-slate-200"
                            >
                                {downloadingId === item.id ? (
                                    <ActivityIndicator size="small" color="#64748b" />
                                ) : (
                                    <Icon icon={Download} size={18} color="#64748b" />
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Card>
        </View>
    );

    return (
        <View className="flex-1 bg-slate-50">
            {/* Premium Header */}
            <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                className="px-6 pb-8 shadow-sm border-b border-slate-100"
                style={{ paddingTop: insets.top + 10 }}
            >
                <View className="flex-row justify-between items-start mb-6">
                    <View className="flex-1 mr-4">
                        <Text className="text-3xl font-black text-slate-900 tracking-tight" numberOfLines={1} adjustsFontSizeToFit>{t('maintenance.title')}</Text>
                        <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{t('maintenance.subtitle')}</Text>
                    </View>
                    <View className="flex-row gap-2 flex-shrink-0">
                        {/* Admin Generate Button */}
                        {user?.role === 'admin' && (
                            <TouchableOpacity
                                onPress={() => setShowGenerateModal(true)}
                                className="bg-blue-600 px-3 py-1.5 rounded-xl border border-blue-700 active:bg-blue-700"
                            >
                                <Text className="text-white font-black text-[10px] uppercase tracking-widest">+ Generate</Text>
                            </TouchableOpacity>
                        )}
                        <View className="bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                            <Text className="text-blue-800 font-black text-[10px] uppercase tracking-widest">{t('maintenance.digitalReceipts')}</Text>
                        </View>
                    </View>
                </View>

                {/* ... Search Bar & Filters ... */}
                {/* Search Bar */}
                <View className="flex-row items-center bg-white border border-slate-100 rounded-2xl px-4 h-14 shadow-sm mb-6">
                    <Icon icon={Search} color="#94a3b8" size={20} />
                    <TextInput
                        className="flex-1 ml-3 text-slate-900 font-bold text-base"
                        placeholder={t('maintenance.searchPlaceholder')}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#cbd5e1"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon icon={X} color="#94a3b8" size={18} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Status Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {(['all', 'paid', 'due'] as const).map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            onPress={() => setStatusFilter(filter)}
                            className={`px-6 py-2.5 rounded-2xl mr-3 border-2 ${statusFilter === filter
                                ? 'bg-blue-800 border-blue-800 shadow-lg shadow-blue-200'
                                : 'bg-white border-slate-100'
                                }`}
                            activeOpacity={0.7}
                        >
                            <Text className={`text-[10px] font-black uppercase tracking-widest ${statusFilter === filter ? 'text-white' : 'text-slate-400'
                                }`}>
                                {t(`maintenance.${filter}`)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </LinearGradient>

            <View className="flex-1">
                {loading && !refreshing ? (
                    <View className="flex-1 justify-center items-center">
                        <ActivityIndicator size="large" color="#1e40af" />
                    </View>
                ) : accessDenied ? (
                    <View className="flex-1 justify-center items-center p-6">
                        <View className="bg-rose-50 w-24 h-24 rounded-full items-center justify-center mb-6 border border-rose-100">
                            <Icon icon={ShieldCheck} color="#f43f5e" size={48} />
                        </View>
                        <Text className="text-slate-900 font-black text-xl mb-2 text-center">{t('maintenance.accessRestricted')}</Text>
                        <Text className="text-slate-500 font-bold text-sm text-center">
                            {t('maintenance.staffRestricted')}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredRecords}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1e40af" />
                        }
                        ListEmptyComponent={
                            <View className="flex-1 justify-center items-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
                                <View className="bg-slate-50 w-20 h-20 rounded-full items-center justify-center mb-6">
                                    <Icon icon={AlertCircle} color="#cbd5e1" size={40} />
                                </View>
                                <Text className="text-slate-900 font-black text-lg uppercase tracking-tight">{t('maintenance.noRecords')}</Text>
                                <Text className="text-slate-400 font-bold text-xs mt-1">{t('maintenance.everythingUpToDate')}</Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* ... Existing Modals ... */}

            {/* Admin Generate Dues Modal */}
            <Modal
                visible={showGenerateModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowGenerateModal(false)}
            >
                <View className="flex-1 bg-slate-900/95 justify-center p-6">
                    <Card className="p-8 shadow-2xl border-white/10 bg-slate-800 rounded-[40px]">
                        <View className="flex-row justify-between items-center mb-10">
                            <View className="bg-blue-600/20 px-4 py-2 rounded-xl border border-blue-500/30">
                                <Text className="text-blue-400 font-black text-[10px] uppercase tracking-widest">Generate Dues</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowGenerateModal(false)}
                                className="bg-slate-700 p-2.5 rounded-xl active:bg-slate-600"
                            >
                                <Icon icon={X} color="#cbd5e1" size={20} />
                            </TouchableOpacity>
                        </View>

                        <View className="space-y-6">
                            <View>
                                <Text className="text-slate-400 text-[9px] font-black mb-2.5 uppercase tracking-widest ml-1">Month</Text>
                                <TextInput
                                    className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white text-base font-bold"
                                    placeholder="e.g. October"
                                    placeholderTextColor="#475569"
                                    value={genMonth}
                                    onChangeText={setGenMonth}
                                />
                            </View>
                            <View>
                                <Text className="text-slate-400 text-[9px] font-black mb-2.5 uppercase tracking-widest ml-1">Year</Text>
                                <TextInput
                                    className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white text-base font-bold"
                                    placeholder="e.g. 2024"
                                    placeholderTextColor="#475569"
                                    value={genYear}
                                    keyboardType="numeric"
                                    onChangeText={setGenYear}
                                />
                            </View>
                            <View>
                                <Text className="text-slate-400 text-[9px] font-black mb-2.5 uppercase tracking-widest ml-1">Amount</Text>
                                <TextInput
                                    className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white text-base font-bold"
                                    placeholder="e.g. 1500"
                                    placeholderTextColor="#475569"
                                    value={genAmount}
                                    keyboardType="numeric"
                                    onChangeText={setGenAmount}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleGenerateDues}
                                disabled={isGenerating}
                                className="h-16 bg-blue-600 rounded-3xl mt-8 shadow-xl shadow-blue-900 flex-row items-center justify-center active:scale-[0.98]"
                            >
                                {isGenerating ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-black text-base uppercase tracking-widest">Generate & Notify</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </Card>
                </View>
            </Modal>

            {/* General Payment Modal */}
            <Modal
                visible={showPaymentModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowPaymentModal(false)}
            >
                <Pressable
                    className="flex-1 bg-slate-900/60 justify-end"
                    onPress={() => setShowPaymentModal(false)}
                >
                    <Pressable className="bg-white rounded-t-[48px] p-8 shadow-2xl">
                        <View className="w-12 h-1.5 bg-slate-100 rounded-full self-center mb-10" />

                        <View className="flex-row justify-between items-start mb-10">
                            <View>
                                <Text className="text-3xl font-black text-slate-900 leading-tight">{t('maintenance.selectMethod')}</Text>
                                <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1.5">
                                    {t('maintenance.confirmPayment', { amount: selectedRecord?.amount })}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowPaymentModal(false)}
                                className="bg-slate-50 p-3 rounded-2xl border border-slate-100"
                            >
                                <Icon icon={X} color="#64748b" size={24} />
                            </TouchableOpacity>
                        </View>

                        <View className="mb-6">
                            <PaymentOption
                                title={t('maintenance.googlePay')}
                                subtitle={t('maintenance.instantUpi')}
                                icon={Smartphone}
                                onPress={() => selectedRecord && processPayment(selectedRecord.id, 'Google Pay')}
                                color="#2563eb"
                            />
                            <PaymentOption
                                title={t('maintenance.paytm')}
                                subtitle={t('maintenance.walletNetbanking')}
                                icon={Wallet}
                                onPress={() => selectedRecord && processPayment(selectedRecord.id, 'Paytm')}
                                color="#00baf2"
                            />
                            <PaymentOption
                                title={t('maintenance.card')}
                                subtitle={t('maintenance.cardSubtitle')}
                                icon={CreditCard}
                                onPress={() => selectedRecord && processPayment(selectedRecord.id, 'Credit Card')}
                                color="#8b5cf6"
                            />
                        </View>

                        <View className="mt-4 flex-row items-center justify-center bg-emerald-50 py-4 rounded-[24px] border border-emerald-100">
                            <Icon icon={ShieldCheck} color="#10b981" size={16} />
                            <Text className="text-emerald-700 text-[10px] font-black uppercase tracking-widest ml-2">
                                {t('maintenance.pciSecure')}
                            </Text>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Premium Card Entry Modal */}
            <Modal
                visible={showCardForm}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowCardForm(false)}
            >
                <View className="flex-1 bg-slate-900/95 justify-center p-6">
                    <Card className="p-8 shadow-2xl border-white/10 bg-slate-800 rounded-[40px]">
                        <View className="flex-row justify-between items-center mb-10">
                            <View className="bg-blue-600/20 px-4 py-2 rounded-xl border border-blue-500/30">
                                <Text className="text-blue-400 font-black text-[10px] uppercase tracking-widest">{t('maintenance.cardDetails')}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowCardForm(false)}
                                className="bg-slate-700 p-2.5 rounded-xl active:bg-slate-600"
                            >
                                <Icon icon={X} color="#cbd5e1" size={20} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View className="space-y-6">
                                <View>
                                    <Text className="text-slate-400 text-[9px] font-black mb-2.5 uppercase tracking-widest ml-1">{t('maintenance.cardholderName')}</Text>
                                    <TextInput
                                        className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white text-base font-bold"
                                        placeholder="Full Name"
                                        placeholderTextColor="#475569"
                                        value={cardName}
                                        onChangeText={setCardName}
                                    />
                                </View>

                                <View className="mt-6">
                                    <Text className="text-slate-400 text-[9px] font-black mb-2.5 uppercase tracking-widest ml-1">{t('maintenance.cardNumber')}</Text>
                                    <TextInput
                                        className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white text-base font-bold"
                                        placeholder="0000 0000 0000 0000"
                                        placeholderTextColor="#475569"
                                        keyboardType="numeric"
                                        maxLength={19}
                                        value={cardNumber}
                                        onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                                    />
                                </View>

                                <View className="flex-row gap-4 mt-6">
                                    <View className="flex-1">
                                        <Text className="text-slate-400 text-[9px] font-black mb-2.5 uppercase tracking-widest ml-1">{t('maintenance.expiry')}</Text>
                                        <TextInput
                                            className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white text-base font-bold"
                                            placeholder="MM/YY"
                                            placeholderTextColor="#475569"
                                            keyboardType="numeric"
                                            maxLength={5}
                                            value={expiry}
                                            onChangeText={(text) => setExpiry(formatExpiry(text))}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-slate-400 text-[9px] font-black mb-2.5 uppercase tracking-widest ml-1">{t('maintenance.cvv')}</Text>
                                        <TextInput
                                            className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white text-base font-bold"
                                            placeholder="000"
                                            placeholderTextColor="#475569"
                                            keyboardType="numeric"
                                            maxLength={3}
                                            secureTextEntry
                                            value={cvv}
                                            onChangeText={setCvv}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={handleCardPayment}
                                    disabled={isProcessingCard}
                                    className="h-16 bg-blue-600 rounded-3xl mt-12 shadow-xl shadow-blue-900 flex-row items-center justify-center active:scale-[0.98]"
                                >
                                    {isProcessingCard ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-white font-black text-base uppercase tracking-widest">{t('maintenance.completePayment')}</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </Card>
                </View>
            </Modal>
        </View>
    );
}

interface PaymentOptionProps {
    title: string;
    subtitle: string;
    icon: any;
    onPress: () => void;
    color: string;
}

const PaymentOption = ({ title, subtitle, icon: IconComponent, onPress, color }: PaymentOptionProps) => (
    <TouchableOpacity
        onPress={onPress}
        className="flex-row items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-3 active:bg-blue-50 active:border-blue-100"
    >
        <View className={`w-12 h-12 rounded-full items-center justify-center mr-4`} style={{ backgroundColor: `${color}15` }}>
            <IconComponent size={24} color={color} />
        </View>
        <View className="flex-1">
            <Text className="text-slate-900 font-bold text-base">{title}</Text>
            <Text className="text-slate-400 text-xs font-medium">{subtitle}</Text>
        </View>
        <Icon icon={ChevronRight} size={20} color="#94a3b8" />
    </TouchableOpacity>
);

