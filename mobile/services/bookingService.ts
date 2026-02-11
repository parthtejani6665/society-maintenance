import api from './api';
import { Booking } from '../types';

export const bookingService = {
    fetchUserBookings: async (): Promise<Booking[]> => {
        const response = await api.get('/bookings');
        return response.data;
    },

    fetchAmenityBookings: async (amenityId: string, date: string): Promise<{ startTime: string; endTime: string }[]> => {
        const response = await api.get(`/bookings/amenity/${amenityId}?date=${date}`);
        return response.data;
    },

    createBooking: async (data: { amenityId: string; date: string; startTime: string; endTime: string }): Promise<Booking> => {
        const response = await api.post('/bookings', data);
        return response.data;
    },

    cancelBooking: async (id: string): Promise<void> => {
        await api.put(`/bookings/${id}/cancel`);
    },

    // Admin
    fetchAllBookings: async (status?: string): Promise<Booking[]> => {
        const response = await api.get('/bookings/admin', { params: { status } });
        return response.data;
    },

    updateBookingStatus: async (id: string, status: 'confirmed' | 'rejected'): Promise<Booking> => {
        const response = await api.put(`/bookings/${id}/status`, { status });
        return response.data;
    }
};
