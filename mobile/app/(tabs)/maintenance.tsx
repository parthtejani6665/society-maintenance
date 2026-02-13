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

    const fetchRecords = async () => {
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
            if (error.response && error.response.status === 403) {
                setAccessDenied(true);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchRecords();
        }, [user])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchRecords();
    }, []);

    const formatCardNumber = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        const matched = cleaned.match(/.{1,4}/g);
        return matched ? matched.join(' ') : cleaned;
    };

    const formatExpiry = (text: string) => {
        const cleaned = text.replace(/\D/g, '');
        if (cleaned.length > 2) {
            return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
        }
        return cleaned;
    };

    const openPaymentApp = async (method: string, amount: string) => {
        const upiId = 'society@upi';
        const name = 'Society Maintenance';
        const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;

        let appUrl = upiUrl;
        if (method === 'Google Pay') {
            appUrl = `tez://upi/pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;
        } else if (method === 'Paytm') {
            appUrl = `paytmmp://upi/pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;
        }

        try {
            const canOpen = await Linking.canOpenURL(appUrl);
            if (canOpen) {
                await Linking.openURL(appUrl);
            } else {
                const canOpenGeneric = await Linking.canOpenURL(upiUrl);
                if (canOpenGeneric) {
                    await Linking.openURL(upiUrl);
                } else {
                    Alert.alert(t('common.error'), `Neither ${method} nor a generic UPI app was found on this device.`);
                    return false;
                }
            }
            return true;
        } catch (error) {
            console.error('Redirection error:', error);
            Alert.alert(t('common.error'), 'Failed to open the payment app');
            return false;
        }
    };

    const handleDownloadReceipt = async (record: MaintenanceRecord) => {
        setDownloadingId(record.id);
        try {
            await receiptService.generateAndSave({
                id: record.id,
                month: record.month,
                year: record.year,
                amount: record.amount,
                paidAt: record.paidAt!,
                residentName: record.resident.fullName,
                flatNumber: record.resident.flatNumber
            });
        } catch (error) {
            console.error('MaintenanceScreen: Receipt download failed:', error);
            Alert.alert(t('common.error'), 'Failed to generate receipt');
        } finally {
            setDownloadingId(null);
        }
    };

    const processPayment = async (id: string, method: string) => {
        const record = records.find(r => r.id === id);
        if (!record) return;

        if (method === 'Debit Card' || method === 'Credit Card') {
            setShowPaymentModal(false);
            setShowCardForm(true);
            return;
        }

        setShowPaymentModal(false);

        if (method === 'Google Pay' || method === 'Paytm') {
            const success = await openPaymentApp(method, record.amount);
            if (!success) return;
        }

        setProcessingId(id);
        try {
            await maintenanceService.payMaintenance(id);
            Alert.alert(t('common.success'), t('maintenance.paymentProcessed', { method }));
            fetchRecords();
        } catch (error) {
            Alert.alert(t('common.error'), t('maintenance.paymentFailed'));
        } finally {
            setProcessingId(null);
            setSelectedRecord(null);
        }
    };

    const handleCardPayment = async () => {
        if (!cardName || cardNumber.length < 19 || expiry.length < 5 || cvv.length < 3) {
            Alert.alert(t('maintenance.invalidDetails'), t('maintenance.fillAllDetails'));
            return;
        }

        setIsProcessingCard(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (selectedRecord) {
                await maintenanceService.payMaintenance(selectedRecord.id);
                Alert.alert(t('common.success'), t('maintenance.paymentSuccess'));
                setShowCardForm(false);
                setCardName('');
                setCardNumber('');
                setExpiry('');
                setCvv('');
                fetchRecords();
            }
        } catch (error) {
            Alert.alert(t('common.error'), t('maintenance.cardPaymentFailed'));
        } finally {
            setIsProcessingCard(false);
            setSelectedRecord(null);
        }
    };

    const handlePay = (id: string, amount: string) => {
        setSelectedRecord({ id, amount });
        setShowPaymentModal(true);
    };

    const PaymentOption = ({ title, subtitle, icon, onPress, color = '#2563eb' }: { title: string, subtitle: string, icon: any, onPress: () => void, color?: string }) => (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center p-4 bg-slate-50 rounded-[28px] mb-3 border border-slate-100 active:bg-slate-100"
        >
            <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm border border-slate-50">
                <Icon icon={icon} color={color} size={24} />
            </View>
            <View className="ml-4 flex-1">
                <Text className="text-slate-900 font-black text-base tracking-tight">{title}</Text>
                <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{subtitle}</Text>
            </View>
            <Icon icon={ChevronRight} color="#cbd5e1" size={18} />
        </TouchableOpacity>
    );

    const filteredRecords = records.filter(r => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (r.month?.toLowerCase() || '').includes(query) ||
            r.year?.toString().includes(searchQuery) ||
            (r.resident?.fullName?.toLowerCase() || '').includes(query);
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const renderItem = ({ item }: { item: MaintenanceRecord }) => {
        const isPaid = item.status === 'paid';

        return (
            <Card className="mb-6 overflow-hidden">
                <View className="p-6">
                    <View className="flex-row justify-between items-start mb-6">
                        <View>
                            <Text className="text-2xl font-black text-slate-900 leading-tight">
                                {item.month} {item.year}
                            </Text>
                            <View className="flex-row items-center mt-2">
                                <View className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 mr-2">
                                    <Text className="text-slate-500 font-black text-[9px] uppercase tracking-widest">
                                        {t('maintenance.flat')} {item.resident.flatNumber}
                                    </Text>
                                </View>
                                <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                    {item.resident.fullName}
                                </Text>
                            </View>
                        </View>
                        <View className={`px-4 py-1.5 rounded-xl border ${isPaid ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                            <Text className={`text-[10px] font-black uppercase tracking-widest ${isPaid ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {t(`maintenance.${item.status}`)}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center mb-6">
                        <View className="w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center mr-4 border border-slate-100">
                            <Icon icon={IndianRupee} color="#1e293b" size={20} />
                        </View>
                        <View>
                            <Text className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-0.5">{t('maintenance.amountDue')}</Text>
                            <Text className="text-3xl font-black text-slate-900 tracking-tight">₹{item.amount}</Text>
                        </View>
                    </View>

                    {isPaid ? (
                        <View className="flex-row items-center py-4 px-5 bg-slate-50 rounded-[20px] border border-slate-100">
                            <View className="w-8 h-8 bg-emerald-100 rounded-full items-center justify-center mr-3">
                                <Icon icon={CheckCircle2} color="#059669" size={16} />
                            </View>
                            <Text className="flex-1 text-slate-600 text-xs font-bold leading-tight mr-3">
                                {t('maintenance.paidOn', { date: new Date(item.paidAt!).toLocaleDateString() })}
                            </Text>
                            <TouchableOpacity
                                onPress={() => handleDownloadReceipt(item)}
                                disabled={downloadingId === item.id}
                                className="bg-blue-50 p-2 rounded-xl border border-blue-100"
                            >
                                {downloadingId === item.id ? (
                                    <ActivityIndicator size="small" color="#2563eb" />
                                ) : (
                                    <Icon icon={Download} color="#2563eb" size={16} />
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        user?.role === 'resident' && (
                            <TouchableOpacity
                                onPress={() => handlePay(item.id, item.amount)}
                                disabled={processingId === item.id}
                                className="h-16 bg-blue-800 rounded-2xl shadow-lg shadow-blue-200 flex-row items-center justify-center px-6 active:scale-[0.98]"
                            >
                                {processingId === item.id ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Icon icon={IndianRupee} color="white" size={20} />
                                        <Text className="text-white font-black text-base ml-2 uppercase tracking-widest">{t('maintenance.payMaintenance')}</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        )
                    )}
                </View>
                {!isPaid && (
                    <View className="bg-amber-50 py-3 px-6 flex-row items-center border-t border-amber-100">
                        <Icon icon={Clock} color="#d97706" size={14} />
                        <Text className="text-amber-700 text-[10px] font-black uppercase tracking-widest ml-2">{t('maintenance.dueByEnd')}</Text>
                    </View>
                )}
            </Card>
        );
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Premium Header */}
            <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                className="px-6 pb-8 shadow-sm border-b border-slate-100"
                style={{ paddingTop: insets.top + 10 }}
            >
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-3xl font-black text-slate-900 tracking-tight">{t('maintenance.title')}</Text>
                        <Text className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{t('maintenance.subtitle')}</Text>
                    </View>
                    <View className="bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                        <Text className="text-blue-800 font-black text-[10px] uppercase tracking-widest">{t('maintenance.digitalReceipts')}</Text>
                    </View>
                </View>

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

