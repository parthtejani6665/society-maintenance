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

    updateUser: async (id: string, userData: any) => {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    },

    uploadProfileImage: async (imageUri: string) => {
        const formData = new FormData();
        formData.append('avatar', {
            uri: imageUri,
            name: 'profile.jpg',
            type: 'image/jpeg',
        } as any);

        const response = await api.post('/users/profile/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
