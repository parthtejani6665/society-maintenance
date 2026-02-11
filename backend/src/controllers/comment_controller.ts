import { Request, Response } from 'express';
import { Comment, User } from '../models';

export const createComment = async (req: Request, res: Response) => {
    try {
        const { complaintId, content } = req.body;
        const userId = (req as any).user.id;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const comment = await Comment.create({
            complaintId,
            userId,
            content,
        });

        // Fetch the comment with author info for the response
        const newComment = await Comment.findByPk(comment.id, {
            include: [{ model: User, as: 'author', attributes: ['fullName'] }],
        });

        res.status(201).json(newComment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getComments = async (req: Request, res: Response) => {
    try {
        const { complaintId } = req.params;
        const comments = await Comment.findAll({
            where: { complaintId },
            include: [{ model: User, as: 'author', attributes: ['fullName'] }],
            order: [['createdAt', 'ASC']],
        });
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;
        const userRole = (req as any).user.role;

        const comment = await Comment.findByPk(id as string);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Only author or admin can delete
        if (comment.userId !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await comment.destroy();
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
