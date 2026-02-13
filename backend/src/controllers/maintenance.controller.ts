import { Request, Response } from 'express';
import Maintenance from '../models/Maintenance';
import User from '../models/User';
import { sendPushNotification, sendToMultipleUsers } from '../utils/notificationSender';
import Notification from '../models/Notification';

interface AuthRequest extends Request {
    user?: User;
}

// Generate Dues (Admin)
export const generateDues = async (req: Request, res: Response) => {
    try {
        const { month, year, amount } = req.body;

        // Get all residents
        const residents = await User.findAll({ where: { role: 'resident', isActive: true } });

        const maintenanceRecords = [];
        const notifications = [];

        for (const resident of residents) {
            // Check if already exists
            const exists = await Maintenance.findOne({
                where: { residentId: resident.id, month, year },
            });

            if (!exists) {
                maintenanceRecords.push({
                    residentId: resident.id,
                    flatNumber: resident.flatNumber || 'Unknown',
                    amount,
                    month,
                    year,
                    status: 'due',
                });

                notifications.push({
                    userId: resident.id,
                    title: 'Maintenance Due Generated',
                    message: `Maintenance for ${month} ${year} of ₹${amount} is generated via system.`,
                    type: 'maintenance',
                });
            }
        }

        if (maintenanceRecords.length > 0) {
            await Maintenance.bulkCreate(maintenanceRecords as any);
            await Notification.bulkCreate(notifications as any);

            // Send Push Notifications
            const userIds = maintenanceRecords.map(r => r.residentId);
            sendToMultipleUsers(
                userIds,
                '📋 Maintenance Due',
                `Maintenance bill for ${month} ${year} of ₹${amount} is generated for your flat.`,
                { screen: 'maintenance' }
            );
        }

        res.json({ message: `Generated dues for ${maintenanceRecords.length} residents.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Maintenance Records
export const getMaintenanceRecords = async (req: AuthRequest, res: Response) => {
    try {
        const { role, id } = req.user!;
        let whereClause = {};

        if (role === 'staff') {
            res.status(403).json({ message: 'Access denied. Staff cannot view maintenance records.' });
            return;
        }

        if (role === 'resident') {
            whereClause = { residentId: id };
        }
        // Admin sees all

        const records = await Maintenance.findAll({
            where: whereClause,
            include: [{ model: User, as: 'resident', attributes: ['fullName', 'flatNumber'] }],
            order: [['year', 'DESC'], ['month', 'DESC']],
        });

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Mark as Paid (Admin/Staff/Resident-payment-mock)
export const markAsPaid = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const record = await Maintenance.findByPk(id as string);
        if (!record) {
            res.status(404).json({ message: 'Maintenance record not found' });
            return;
        }

        const user = (req as any).user;
        if (user.role === 'staff') {
            res.status(403).json({ message: 'Access denied. Staff cannot pay maintenance.' });
            return;
        }

        if (user.role === 'resident' && record.residentId !== user.id) {
            res.status(403).json({ message: 'Access denied. You can only pay your own maintenance.' });
            return;
        }

        if (record.status === 'paid') {
            res.status(400).json({ message: 'Maintenance already paid' });
            return;
        }

        record.status = 'paid';
        record.paidAt = new Date();
        await record.save();

        // Notify Resident
        sendPushNotification(
            record.residentId,
            '✅ Payment Successful',
            `Your maintenance payment of ₹${record.amount} for ${record.month} ${record.year} was received.`,
            { screen: 'maintenance' }
        );

        res.json({ message: 'Maintenance marked as paid', record });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
