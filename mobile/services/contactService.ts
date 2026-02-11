import api from './api';
import { Contact } from '../types';

export const contactService = {
    fetchContacts: async (): Promise<Contact[]> => {
        const response = await api.get('/contacts');
        return response.data;
    },

    createContact: async (data: Partial<Contact>): Promise<Contact> => {
        const response = await api.post('/contacts', data);
        return response.data;
    },

    updateContact: async (id: string, data: Partial<Contact>): Promise<Contact> => {
        const response = await api.put(`/contacts/${id}`, data);
        return response.data;
    },

    deleteContact: async (id: string): Promise<void> => {
        await api.delete(`/contacts/${id}`);
    }
};
