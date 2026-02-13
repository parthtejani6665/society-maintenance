import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import admin from '../config/firebase';
import User from '../models/User';

export const googleAuth = async (req: Request, res: Response) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            res.status(400).json({ message: 'Google ID token is required.' });
            return;
        }

        // Verify Google ID Token via Firebase Admin
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { email, name, picture, uid } = decodedToken;

        if (!email) {
            res.status(400).json({ message: 'Email not provided by Google.' });
            return;
        }

        // Find or create user
        let user = await User.findOne({ where: { email } });

        if (user) {
            // Update googleId and avatar if not present
            if (!user.googleId || !user.avatar) {
                await user.update({
                    googleId: uid,
                    avatar: picture
                });
            }
        } else {
            // Create new resident user
            user = await User.create({
                email,
                fullName: name || 'Google User',
                googleId: uid,
                avatar: picture,
                role: 'resident',
                isActive: true,
                phoneNumber: '' // Can be updated later by user
            } as any);
        }

        // Check if deactivated
        if (!user.isActive) {
            res.status(403).json({ message: 'Account is deactivated.' });
            return;
        }

        // Generate Digital Dwell JWT Token
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
                avatar: user.avatar
            },
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ message: 'Invalid Google token.' });
    }
};
