import api from './api';
import { Notice } from '../types';

export const noticeService = {
    fetchNotices: async (): Promise<Notice[]> => {
        const response = await api.get('/notices');
        return response.data;
    },

    createNotice: async (data: Partial<Notice>): Promise<Notice> => {
        const response = await api.post('/notices', data);
        return response.data;
    },

    updateNotice: async (id: string, data: Partial<Notice>): Promise<Notice> => {
        const response = await api.put(`/notices/${id}`, data);
        return response.data;
    },

    deleteNotice: async (id: string): Promise<void> => {
        await api.delete(`/notices/${id}`);
    }
};
