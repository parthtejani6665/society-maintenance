import api from './api';
import { Comment } from '../types';

export const commentService = {
    fetchComments: async (complaintId: string): Promise<Comment[]> => {
        const response = await api.get(`/comments/${complaintId}`);
        return response.data;
    },

    createComment: async (complaintId: string, content: string): Promise<Comment> => {
        const response = await api.post('/comments', { complaintId, content });
        return response.data;
    },

    deleteComment: async (id: string): Promise<void> => {
        await api.delete(`/comments/${id}`);
    }
};
