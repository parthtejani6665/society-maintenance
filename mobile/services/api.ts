import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Use localhost for iOS simulator, special IP for Android emulator
//export const API_ROOT = 'http://192.168.2.49:5000';
export const API_ROOT = 'http://10.31.2.146:5000';
export const BASE_URL = `${API_ROOT}/api`;
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // 10 seconds timeout
});

api.interceptors.request.use(async (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    const token = await SecureStore.getItemAsync('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('API Response Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else if (error.request) {
            console.error('No response received');
        }
        return Promise.reject(error);
    }
);

export default api;
