import { Request, Response } from 'express';
import Notification from '../models/Notification';
import User from '../models/User';

interface AuthRequest extends Request {
    user?: User;
}

export const getNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const notifications = await Notification.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const markRead = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;

        const notification = await Notification.findOne({ where: { id, userId } });
        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }

        notification.isRead = true;
        await notification.save();
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
