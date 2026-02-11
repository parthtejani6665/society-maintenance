import api from './api';

export const userService = {
    updateProfile: async (data: { fullName: string; phoneNumber?: string; flatNumber?: string }) => {
        const response = await api.put('/users/profile', data);
        return response.data;
    },

    fetchStaff: async () => {
        const response = await api.get('/users?role=staff');
        return response.data;
    },

    fetchAllUsers: async (role?: string) => {
        const url = role ? `/users?role=${role}` : '/users';
        const response = await api.get(url);
        return response.data;
    },

    fetchUserById: async (id: string) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },
};
