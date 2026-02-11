import api from './api';
import { Poll, PollOption } from '../types';

export interface PollResult {
    id: string;
    text: string;
    voteCount: number;
}

export const pollService = {
    fetchPolls: async (): Promise<Poll[]> => {
        const response = await api.get('/polls');
        return response.data;
    },

    createPoll: async (data: {
        question: string;
        description?: string;
        expiresAt: string;
        options: string[];
    }): Promise<Poll> => {
        const response = await api.post('/polls', data);
        return response.data;
    },

    vote: async (pollId: string, optionId: string): Promise<void> => {
        await api.post('/polls/vote', { pollId, optionId });
    },

    getResults: async (pollId: string): Promise<PollResult[]> => {
        const response = await api.get(`/polls/${pollId}/results`);
        return response.data;
    }
};
