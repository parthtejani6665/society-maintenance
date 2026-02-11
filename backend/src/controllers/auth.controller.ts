import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            res.status(400).json({ message: 'Please provide email and password.' });
            return;
        }

        // Check user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials.' });
            return;
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials.' });
            return;
        }

        // Check active
        if (!user.isActive) {
            res.status(403).json({ message: 'Account is deactivated.' });
            return;
        }

        // Generate Token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '30d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                flatNumber: user.flatNumber,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        // req.user is set by authMiddleware
        const user = (req as any).user;
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const registerPushToken = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        const userId = (req as any).user.id;

        if (!token) {
            res.status(400).json({ message: 'Token is required' });
            return;
        }

        await User.update({ pushToken: token }, { where: { id: userId } });

        res.json({ message: 'Push token registered successfully' });
    } catch (error) {
        console.error('Failed to register push token:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
