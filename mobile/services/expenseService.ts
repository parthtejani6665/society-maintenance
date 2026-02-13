import api from './api';

export interface Expense {
    id: string;
    title: string;
    amount: number;
    category: 'Maintenance' | 'Security' | 'Landscaping' | 'Utilities' | 'Repairs' | 'Events' | 'Other';
    date: string;
    description?: string;
    paymentMethod: 'Cash' | 'Bank Transfer' | 'UPI' | 'Cheque';
    gpsCoordinates?: string;
    invoiceUrl?: string;
    gstAmount?: number;
    tdsAmount?: number;
    isVerified: boolean;
    createdAt: string;
}

export interface ExpenseAnalytics {
    total: number;
    income: number;
    byCategory: { category: string; total: number }[];
    recent: Expense[];
}

export const expenseService = {
    createExpense: async (data: Partial<Expense>) => {
        const response = await api.post('/expenses', data);
        return response.data;
    },

    getExpenses: async (filters?: { startDate?: string; endDate?: string; category?: string }) => {
        const response = await api.get('/expenses', { params: filters });
        return response.data;
    },

    getAnalytics: async (): Promise<ExpenseAnalytics> => {
        const response = await api.get('/expenses/analytics');
        return response.data;
    },

    deleteExpense: async (id: string) => {
        const response = await api.delete(`/expenses/${id}`);
        return response.data;
    }
};
