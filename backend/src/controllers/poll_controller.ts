import { Request, Response } from 'express';
import { Poll, PollOption, Vote, User } from '../models';
import sequelize from '../config/database';
import { sendToMultipleUsers } from '../utils/notificationSender';

export const createPoll = async (req: Request, res: Response) => {
    const t = await sequelize.transaction();
    try {
        const { question, description, expiresAt, options } = req.body;
        const userId = (req as any).user.id;

        if (!question || !expiresAt || !options || !Array.isArray(options) || options.length < 2) {
            return res.status(400).json({ message: 'Invalid poll data. Question, expiry, and at least 2 options are required.' });
        }

        const poll = await Poll.create({
            question,
            description,
            expiresAt,
            createdBy: userId,
        }, { transaction: t });

        const pollOptions = options.map((opt: string) => ({
            pollId: poll.id,
            text: opt,
        }));

        await PollOption.bulkCreate(pollOptions, { transaction: t });

        await t.commit();

        const createdPoll = await Poll.findByPk(poll.id, {
            include: [{ model: PollOption, as: 'options' }],
        });

        // Notify All Users
        const users = await User.findAll({ attributes: ['id'] });
        const userIds = users.map(u => u.id);

        sendToMultipleUsers(
            userIds,
            '📊 New Community Poll',
            question,
            { screen: 'polls', id: poll.id }
        );

        res.status(201).json(createdPoll);
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPolls = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const polls = await Poll.findAll({
            include: [
                {
                    model: PollOption,
                    as: 'options',
                    include: [{ model: Vote, as: 'votes', attributes: ['id'] }]
                },
                { model: User, as: 'author', attributes: ['fullName'] },
                {
                    model: Vote,
                    as: 'votes', // Current user's vote
                    where: { userId },
                    required: false,
                }
            ],
            order: [['createdAt', 'DESC']],
        });

        const serializedPolls = polls.map(poll => {
            const p: any = poll.toJSON();
            p.options = (p.options || []).map((opt: any) => ({
                ...opt,
                voteCount: opt.votes ? opt.votes.length : 0,
                votes: undefined // Remove detailed votes array from options to keep response clean
            }));
            return p;
        });

        res.json(serializedPolls);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const vote = async (req: Request, res: Response) => {
    try {
        const { pollId, optionId } = req.body;
        const userId = (req as any).user.id;

        const poll = await Poll.findByPk(pollId);
        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        if (new Date() > new Date(poll.expiresAt)) {
            return res.status(400).json({ message: 'Poll has expired' });
        }

        const existingVote = await Vote.findOne({
            where: { pollId, userId }
        });

        if (existingVote) {
            return res.status(400).json({ message: 'You have already voted in this poll' });
        }

        await Vote.create({
            pollId,
            userId,
            optionId,
        });

        res.status(201).json({ message: 'Vote cast successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPollResults = async (req: Request, res: Response) => {
    try {
        const { pollId } = req.params;
        const options = await PollOption.findAll({
            where: { pollId },
            include: [{ model: Vote, as: 'votes' }],
        });

        const results = options.map(opt => ({
            id: opt.id,
            text: opt.text,
            voteCount: (opt as any).votes.length,
        }));

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
