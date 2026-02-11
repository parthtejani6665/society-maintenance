import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Calendar as CalendarIcon, Clock, CheckCircle2, Info, ChevronLeft, ShieldCheck, MapPin, Users } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import { amenityService } from '../../services/amenityService';
import { bookingService } from '../../services/bookingService';
import { Amenity } from '../../types';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/Button';
import { Theme } from '../../constants/Theme';

export default function AmenityBookingScreen() {
    const { t } = useTranslation();
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [amenity, setAmenity] = useState<Amenity | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Date Selection (Next 7 days)
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Time Slots
    const [bookedSlots, setBookedSlots] = useState<{ startTime: string; endTime: string }[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => {
        fetchAmenityDetails();
    }, [id]);

    useEffect(() => {
        if (amenity) {
            fetchBookings();
        }
    }, [selectedDate, amenity]);

    const fetchAmenityDetails = async () => {
        try {
            const all = await amenityService.fetchAmenities();
            const found = all.find(a => a.id === id);
            setAmenity(found || null);
        } catch (error) {
            console.error('Failed to fetch amenity:', error);
            Alert.alert(t('common.error'), t('amenities.bookingError'));
        } finally {
            setLoading(false);
        }
    };

    const getLocalDateString = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const fetchBookings = async () => {
        if (!amenity) return;
        setLoadingSlots(true);
        try {
            const dateStr = getLocalDateString(selectedDate);
            const bookings = await bookingService.fetchAmenityBookings(amenity.id, dateStr);
            setBookedSlots(bookings);
            generateSlots(bookings);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoadingSlots(false);
        }
    };

    const generateSlots = (bookings: { startTime: string; endTime: string }[]) => {
        if (!amenity) return;

        const parseHour = (timeStr: string) => {
            if (!timeStr) return 0;
            return parseInt(timeStr.split(':')[0], 10);
        };

        const start = parseHour(amenity.startTime);
        const end = parseHour(amenity.endTime);
        const slots: string[] = [];

        for (let i = start; i < end; i++) {
            const hourStr = i.toString().padStart(2, '0');
            const slotStart = `${hourStr}:00`;
            slots.push(slotStart);
        }
        setAvailableSlots(slots);
    };

    const handleBook = async () => {
        if (!selectedSlot || !amenity) return;

        setSubmitting(true);
        try {
            const dateStr = getLocalDateString(selectedDate);
            const startHour = parseInt(selectedSlot.split(':')[0]);
            const endTime = `${(startHour + 1).toString().padStart(2, '0')}:00`;

            await bookingService.createBooking({
                amenityId: amenity.id,
                date: dateStr,
                startTime: selectedSlot,
                endTime: endTime
            });

            Alert.alert(
                t('common.success'),
                amenity.requiresApproval ? t('amenities.bookingSuccess') + ' (Approval needed)' : t('amenities.bookingSuccess'),
                [{ text: 'OK', onPress: () => router.push('/amenities/my-bookings') }]
            );
        } catch (error: any) {
            Alert.alert(t('common.error'), error.response?.data?.message || t('amenities.bookingError'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color={Theme.colors.primary} />
            </View>
        );
    }

    if (!amenity) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>{t('amenities.noAmenities')}</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen options={{
                title: 'Book Facility',
                headerShown: true,
                headerStyle: { backgroundColor: 'white' },
                headerTitleStyle: { fontFamily: 'System', fontWeight: '900', fontSize: 18 },
                headerShadowVisible: false,
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Icon icon={ChevronLeft} color="#000" size={24} />
                    </TouchableOpacity>
                )
            }} />

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
                {/* Amenity Overview Card */}
                <View className="p-5">
                    <Card className="px-6 py-5 mb-6 overflow-hidden border-l-4 border-blue-600">
                        <Text className="text-3xl font-black text-slate-900 leading-tight mb-2">{amenity.name}</Text>
                        <View className="flex-row items-center mb-4">
                            <Icon icon={MapPin} color="#94a3b8" size={14} />
                            <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest ml-1">Main Clubhouse • Ground Floor</Text>
                        </View>
                        <View className="flex-row items-center bg-blue-50 self-start px-3 py-1.5 rounded-xl border border-blue-100">
                            <Icon icon={ShieldCheck} color={Theme.colors.primary} size={14} />
                            <Text className="text-blue-700 text-[10px] font-black uppercase tracking-widest ml-2">
                                {amenity.requiresApproval ? 'Approval Required' : 'Instant Confirmation'}
                            </Text>
                        </View>
                    </Card>

                    {/* Enhanced Date Picker */}
                    <Text className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-3 ml-1">Select Date</Text>
                    <Card className="p-2 mb-6 shadow-sm shadow-slate-200/50">
                        <Calendar
                            current={getLocalDateString(selectedDate)}
                            minDate={getLocalDateString(new Date())}
                            markedDates={{
                                [getLocalDateString(selectedDate)]: {
                                    selected: true,
                                    selectedColor: Theme.colors.primary,
                                    selectedTextColor: 'white'
                                }
                            }}
                            onDayPress={(day: any) => {
                                const newDate = new Date(day.year, day.month - 1, day.day);
                                setSelectedDate(newDate);
                                setSelectedSlot(null);
                            }}
                            theme={{
                                calendarBackground: 'transparent',
                                todayTextColor: Theme.colors.primary,
                                arrowColor: Theme.colors.primary,
                                textDayFontWeight: '600',
                                textMonthFontWeight: '900',
                                textDayHeaderFontWeight: '700',
                                textDayFontSize: 14,
                                textMonthFontSize: 16,
                                textDayHeaderFontSize: 11,
                                dayTextColor: '#1e293b',
                                monthTextColor: '#1e293b',
                                textSectionTitleColor: '#94a3b8'
                            }}
                        />
                    </Card>

                    {/* Slots Grid */}
                    <View className="flex-row items-center justify-between mb-4 px-1">
                        <Text className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Available Slots</Text>
                        <View className="flex-row items-center">
                            <Icon icon={Users} color="#94a3b8" size={12} />
                            <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest ml-1">Limit: {amenity.capacity}</Text>
                        </View>
                    </View>

                    {loadingSlots ? (
                        <View className="py-20">
                            <ActivityIndicator size="large" color={Theme.colors.primary} />
                        </View>
                    ) : availableSlots.length === 0 ? (
                        <Card className="p-10 items-center bg-slate-50 border-dashed border-slate-200 shadow-none">
                            <View className="bg-white w-16 h-16 rounded-full items-center justify-center mb-4 shadow-sm border border-slate-100">
                                <Icon icon={Clock} color="#cbd5e1" size={32} />
                            </View>
                            <Text className="text-slate-900 font-black text-base uppercase tracking-tight">No Slots Available</Text>
                            <Text className="text-slate-400 font-bold text-xs mt-1 text-center">
                                Operating hours: {amenity.startTime} - {amenity.endTime}
                            </Text>
                        </Card>
                    ) : (
                        <View className="flex-row flex-wrap gap-4">
                            {availableSlots.map((time) => {
                                const hour = parseInt(time.split(':')[0]);
                                const isBooked = bookedSlots.some(b => parseInt(b.startTime.split(':')[0]) === hour);

                                const now = new Date();
                                const isToday = selectedDate.getDate() === now.getDate() &&
                                    selectedDate.getMonth() === now.getMonth() &&
                                    selectedDate.getFullYear() === now.getFullYear();
                                const isPast = isToday && hour <= now.getHours();

                                const isDisabled = isBooked || isPast;
                                const isSelected = selectedSlot === time;

                                return (
                                    <TouchableOpacity
                                        key={time}
                                        onPress={() => !isDisabled && setSelectedSlot(time)}
                                        disabled={isDisabled}
                                        className={`w-[30.5%] h-16 rounded-2xl items-center justify-center border-2 ${isSelected
                                                ? 'bg-blue-800 border-blue-800 shadow-lg shadow-blue-800/20'
                                                : isDisabled
                                                    ? 'bg-slate-100 border-slate-100'
                                                    : 'bg-white border-slate-100'
                                            }`}
                                        activeOpacity={0.7}
                                    >
                                        <Text className={`font-black text-base ${isSelected
                                                ? 'text-white'
                                                : isBooked
                                                    ? 'text-slate-400 line-through'
                                                    : isPast
                                                        ? 'text-slate-300'
                                                        : 'text-slate-700'
                                            }`}>
                                            {time}
                                        </Text>
                                        {isBooked && (
                                            <Text className="text-[8px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">Booked</Text>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}

                    {/* Booking Guidelines */}
                    <View className="bg-blue-50/50 p-5 rounded-[32px] flex-row items-start border border-blue-100/50 mt-8">
                        <View className="bg-blue-600/10 p-2.5 rounded-xl mr-4">
                            <Icon icon={Info} color={Theme.colors.primary} size={20} />
                        </View>
                        <View className="flex-1">
                            <Text className="text-slate-900 font-bold text-sm mb-1">Booking Policy</Text>
                            <Text className="text-slate-500 text-xs leading-5 font-bold">
                                • Bookings are for 1-hour slots.
                                • Cancellation allowed 24h prior.
                                • Security clearance required at venue.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Floating Action Button */}
            <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 pb-10 shadow-2xl z-30">
                <Button
                    title={selectedSlot ? `${t('amenities.bookNow')} @ ${selectedSlot}` : t('amenities.selectSlot')}
                    onPress={handleBook}
                    disabled={!selectedSlot || submitting}
                    loading={submitting}
                    variant="primary"
                    className="h-16 rounded-3xl bg-blue-800 shadow-xl shadow-blue-800/20"
                    icon={<Icon icon={CheckCircle2} color="white" size={20} />}
                />
            </View>
        </View>
    );
}
