import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Use localhost for Android emulator, specific IP for physical device if needed
// You might want to move this base URL to a config file
const BASE_URL = 'http://192.168.2.49:5000/api';

export const getNearbyServices = async (lat: number, lng: number, type: string) => {
    try {
        const token = await SecureStore.getItemAsync('token');
        const response = await axios.get(`${BASE_URL}/maps/nearby`, {
            params: { lat, lng, type },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data.results;
    } catch (error) {
        console.error('Error fetching nearby services:', error);
        throw error;
    }
};
