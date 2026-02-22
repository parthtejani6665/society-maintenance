import api from './api';

export const maintenanceService = {
    fetchMaintenanceRecords: async () => {
        const response = await api.get('/maintenance');
        return response.data;
    },

    payMaintenance: async (id: string, method: string) => {
        const response = await api.post(`/maintenance/${id}/pay`, { method });
        return response.data;
    },

    // Admin: Generate monthly dues
    generateDues: async (data: { month: string; year: number; amount: number }) => {
        const response = await api.post('/maintenance/generate', data);
        return response.data;
    }
};
