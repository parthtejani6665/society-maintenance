import api from './api';
import { Complaint } from '../types';

export const complaintService = {
    async fetchComplaints(): Promise<Complaint[]> {
        const response = await api.get('/complaints');
        return response.data;
    },

    async fetchComplaintById(id: string): Promise<Complaint> {
        const response = await api.get(`/complaints/${id}`);
        return response.data;
    },

    async createComplaint(data: FormData): Promise<Complaint> {
        const response = await api.post('/complaints', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    async assignComplaint(id: string, staffId: string): Promise<Complaint> {
        const response = await api.patch(`/complaints/${id}/assign`, { staffId });
        return response.data;
    },

    async updateStatus(id: string, data: FormData): Promise<Complaint> {
        const response = await api.patch(`/complaints/${id}/status`, data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};
