import api from './api';
import { Amenity, Booking } from '../types';

export const amenityService = {
    // Amenities
    fetchAmenities: async (): Promise<Amenity[]> => {
        const response = await api.get('/amenities');
        return response.data;
    },
};
