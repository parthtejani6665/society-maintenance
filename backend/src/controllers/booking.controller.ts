import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Booking from '../models/Booking';
import Amenity from '../models/Amenity';
import User from '../models/User';
import { sendPushNotification, sendToMultipleUsers } from '../utils/notificationSender';

interface AuthRequest extends Request {
    user?: User;
}

// Get User Bookings
export const getUserBookings = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.user!;
        const bookings = await Booking.findAll({
            where: { userId: id },
            include: [{ model: Amenity, as: 'amenity', attributes: ['name'] }],
            order: [['date', 'DESC'], ['startTime', 'DESC']],
        });
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get All Bookings (Admin)
export const getAllBookings = async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.query;
        const where: any = {};
        if (status) {
            where.status = status as string;
        }

        const bookings = await Booking.findAll({
            where,
            include: [
                { model: Amenity, as: 'amenity', attributes: ['name'] },
                { model: User, as: 'user', attributes: ['id', 'fullName', 'flatNumber'] }
            ],
            order: [['date', 'DESC'], ['startTime', 'DESC']],
        });
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Booking Status (Admin)
export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['confirmed', 'rejected'].includes(status)) {
            res.status(400).json({ message: 'Invalid status' });
            return;
        }

        const booking = await Booking.findByPk(id as string);
        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }

        booking.status = status;
        await booking.save();

        // Notify Resident
        const amenity = await Amenity.findByPk(booking.amenityId);
        const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
        sendPushNotification(
            booking.userId,
            `Booking ${statusLabel}`,
            `Your booking for ${amenity?.name || 'facility'} on ${booking.date} is ${status}.`,
            { screen: 'amenities/my-bookings' }
        );

        res.json(booking);
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create Booking
export const createBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { amenityId, date, startTime, endTime } = req.body;
        const userId = req.user!.id;

        const amenity = await Amenity.findByPk(amenityId);
        if (!amenity) {
            res.status(404).json({ message: 'Amenity not found' });
            return;
        }

        // Check operating hours
        if (startTime < amenity.startTime || endTime > amenity.endTime) {
            res.status(400).json({ message: `Amenity is only available between ${amenity.startTime} and ${amenity.endTime}` });
            return;
        }

        // Check capacity / overlapping bookings
        const overlappingBookings = await Booking.count({
            where: {
                amenityId,
                date,
                status: { [Op.in]: ['pending', 'confirmed'] },
                [Op.or]: [
                    {
                        startTime: { [Op.lt]: endTime },
                        endTime: { [Op.gt]: startTime },
                    },
                ],
            },
        });

        if (overlappingBookings >= amenity.capacity) {
            res.status(400).json({ message: 'Slot is fully booked.' });
            return;
        }

        const isAdmin = req.user!.role === 'admin';
        const initialStatus = (amenity.requiresApproval && !isAdmin) ? 'pending' : 'confirmed';

        const booking = await Booking.create({
            userId,
            amenityId,
            date,
            startTime,
            endTime,
            status: initialStatus,
        });

        // Notify Admins if approval is required and booking is pending
        if (amenity.requiresApproval && initialStatus === 'pending') {
            const admins = await User.findAll({ where: { role: 'admin' }, attributes: ['id'] });
            const adminIds = admins.map(a => a.id);
            const userName = req.user!.fullName;

            sendToMultipleUsers(
                adminIds,
                'New Booking Request',
                `${userName} requested to book ${amenity.name} on ${date}.`,
                { screen: 'amenities/manage-bookings' }
            );
        }

        res.status(201).json(booking);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Cancel Booking
export const cancelBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;

        const booking = await Booking.findByPk(id as string);

        if (!booking) {
            res.status(404).json({ message: 'Booking not found' });
            return;
        }

        if (booking.userId !== userId) {
            res.status(403).json({ message: 'Access denied' });
            return;
        }

        if (booking.status === 'cancelled' || booking.status === 'rejected') {
            res.status(400).json({ message: 'Booking is already cancelled or rejected' });
            return;
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Bookings for a specific amenity and date (for calendar view)
export const getAmenityBookings = async (req: Request, res: Response) => {
    try {
        const { amenityId } = req.params;
        const { date } = req.query;

        if (!date) {
            res.status(400).json({ message: 'Date is required' });
            return;
        }

        const bookings = await Booking.findAll({
            where: {
                amenityId,
                date: date as string,
                status: { [Op.in]: ['pending', 'confirmed'] },
            },
            attributes: ['startTime', 'endTime'], // Only send time slots, not user details for privacy
        });

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching amenity bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
