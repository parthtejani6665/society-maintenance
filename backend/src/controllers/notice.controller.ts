import { Request, Response } from 'express';
import Notice from '../models/Notice';
import User from '../models/User';
import { sendToMultipleUsers } from '../utils/notificationSender';

interface AuthRequest extends Request {
    user?: User;
}

// Get all public notices
export const getNotices = async (req: Request, res: Response) => {
    try {
        const notices = await Notice.findAll({
            where: { isPublic: true },
            include: [{ model: User, as: 'author', attributes: ['fullName'] }],
            order: [['createdAt', 'DESC']],
        });
        res.json(notices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new notice (Admin only)
export const createNotice = async (req: AuthRequest, res: Response) => {
    try {
        const { title, content, type } = req.body;
        const createdBy = req.user!.id;

        const notice = await Notice.create({
            title,
            content,
            type,
            createdBy,
        });

        // Notify All Users
        const users = await User.findAll({ attributes: ['id'] });
        const userIds = users.map(u => u.id);

        sendToMultipleUsers(
            userIds,
            '📢 New Notice',
            title,
            { screen: 'notices', id: notice.id }
        );

        res.status(201).json(notice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a notice (Admin only)
export const updateNotice = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, content, type, isPublic } = req.body;

        const notice = await Notice.findByPk(id as string);
        if (!notice) {
            return res.status(404).json({ message: 'Notice not found' });
        }

        await notice.update({
            title,
            content,
            type,
            isPublic,
        });

        res.json(notice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a notice (Admin only)
export const deleteNotice = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const notice = await Notice.findByPk(id as string);
        if (!notice) {
            return res.status(404).json({ message: 'Notice not found' });
        }

        await notice.destroy();
        res.json({ message: 'Notice deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
