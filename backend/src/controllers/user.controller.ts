import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';

// Create User (Admin only)
export const createUser = async (req: Request, res: Response) => {
    try {
        const { fullName, email, password, phoneNumber, role, flatNumber } = req.body;

        // Validation
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists.' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            phoneNumber,
            role,
            flatNumber: role === 'resident' ? flatNumber : null,
            isActive: true,
        } as any);

        res.status(201).json({
            id: newUser.id,
            fullName: newUser.fullName,
            email: newUser.email,
            role: newUser.role,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Profile (Logged-in User)
export const updateProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user!.id;
        const { fullName, phoneNumber, flatNumber } = req.body;

        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        user.fullName = fullName || user.fullName;
        user.phoneNumber = phoneNumber || user.phoneNumber;

        // Only resident can update flat number, or maybe they shouldn't?
        // Let's allow it for now as per plan.
        if (user.role === 'resident' && flatNumber) {
            user.flatNumber = flatNumber;
        }

        await user.save();

        res.json({
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            flatNumber: user.flatNumber,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Users (Admin only)
export const getUsers = async (req: Request, res: Response) => {
    try {
        const { role } = req.query;
        let whereClause = {};
        if (role) {
            whereClause = { role };
        }

        const users = await User.findAll({
            where: whereClause,
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']],
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete User (Admin only)
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id as string);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Soft delete or Hard delete? Using isActive for now as per requirement (Deactivated users cannot login)
        // But requirement said "Delete /api/users/:id". Let's do hard delete or toggle active.
        // "Deactivated users cannot login". Let's toggle.
        // user.isActive = !user.isActive;
        // await user.save();

        // Actually, let's do hard delete for now but ensure related data like Active Complaints are handled (or we just let them cascade/set null).
        // For MVP, user.destroy() is fine.
        await user.destroy();

        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get User by ID (Admin only)
export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id as string, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
