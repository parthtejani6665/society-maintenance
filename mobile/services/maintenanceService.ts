import api from './api';

export const maintenanceService = {
    fetchMaintenanceRecords: async () => {
        const response = await api.get('/maintenance');
        return response.data;
    },

    payMaintenance: async (id: string) => {
        const response = await api.post(`/maintenance/${id}/pay`);
        return response.data;
    },
};
