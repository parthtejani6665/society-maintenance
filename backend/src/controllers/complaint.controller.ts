import { Request, Response } from 'express';
import Complaint from '../models/Complaint';
import User from '../models/User';
import { sendPushNotification, sendToMultipleUsers } from '../utils/notificationSender';

interface AuthRequest extends Request {
    user?: User;
}

// Create Complaint
export const createComplaint = async (req: AuthRequest, res: Response) => {
    try {
        const { title, category, description } = req.body;
        const residentId = req.user!.id;
        const residentName = req.user!.fullName;

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const imageUrl = files?.image?.[0] ? files.image[0].path : null;
        const videoUrl = files?.video?.[0] ? files.video[0].path : null;

        const complaint = await Complaint.create({
            title,
            category,
            description,
            imageUrl: imageUrl as string,
            videoUrl: videoUrl as string,
            residentId,
            status: 'pending',
        } as any);

        // Notify Admins
        const admins = await User.findAll({ where: { role: 'admin' }, attributes: ['id'] });
        const adminIds = admins.map(a => a.id);
        sendToMultipleUsers(
            adminIds,
            'New Complaint Filed',
            `${residentName} raised a new complaint: ${title}`,
            { screen: 'complaint-details', id: complaint.id }
        );

        res.status(201).json(complaint);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Complaints
export const getComplaints = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user!;
        const role = user.role;
        const id = user.id;

        let whereClause: any = {};

        console.log(`[DEBUG] getComplaints - User: ${id} Role: ${role}`);

        if (role === 'resident') {
            whereClause = { residentId: String(id) };
        } else if (role === 'staff') {
            whereClause = { assignedToId: String(id) };
        } else if (role === 'admin') {
            whereClause = {};
        } else {
            // Unknown role - deny access
            console.warn(`[WARN] Unknown role ${role} for user ${id}. Denying access.`);
            return res.json([]);
        }

        // Filter by status if provided
        const { status } = req.query;
        if (status) {
            console.log(`[DEBUG] Filtering by status: ${status}`);
            whereClause.status = status;
        }

        console.log(`[DEBUG] WhereClause:`, JSON.stringify(whereClause));

        const complaints = await Complaint.findAll({
            where: whereClause,
            include: [
                { model: User, as: 'resident', attributes: ['fullName', 'flatNumber', 'phoneNumber'] },
                { model: User, as: 'assignedStaff', attributes: ['fullName', 'phoneNumber'] },
            ],
            order: [['createdAt', 'DESC']],
        });

        console.log(`[DEBUG] Found ${complaints.length} complaints`);
        res.json(complaints);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Complaint by ID
export const getComplaintById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const complaint = await Complaint.findByPk(id as string, {
            include: [
                { model: User, as: 'resident', attributes: ['fullName', 'flatNumber', 'phoneNumber'] },
                { model: User, as: 'assignedStaff', attributes: ['fullName', 'phoneNumber'] },
            ],
        });

        if (!complaint) {
            res.status(404).json({ message: 'Complaint not found' });
            return;
        }


        const user = req.user!;

        console.log(`[DEBUG] User: ${user.id} (${user.role}) is accessing Complaint: ${complaint.id} (Resident: ${complaint.residentId})`);

        // Access Control
        if (user.role === 'resident' && String(complaint.residentId) !== String(user.id)) {
            console.log(`[DEBUG] Access denied for resident. complaint.residentId (${complaint.residentId}) !== user.id (${user.id})`);
            res.status(403).json({ message: 'Access denied' });
            return;
        }

        // Staff can only see complaints assigned to them, or unassigned complaints (to pick them up)
        if (user.role === 'staff' && complaint.assignedToId && String(complaint.assignedToId) !== String(user.id)) {
            console.log(`[DEBUG] Access denied for staff. complaint.assignedToId (${complaint.assignedToId}) !== user.id (${user.id})`);
            res.status(403).json({ message: 'Access denied' });
            return;
        }

        res.json(complaint);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Assign Complaint (Admin)
export const assignComplaint = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { staffId } = req.body;

        const complaint = await Complaint.findByPk(id as string);
        if (!complaint) {
            res.status(404).json({ message: 'Complaint not found' });
            return;
        }

        const staff = await User.findByPk(staffId);
        if (!staff || staff.role !== 'staff') {
            res.status(400).json({ message: 'Invalid staff user' });
            return;
        }

        complaint.assignedToId = staffId;
        complaint.status = 'in_progress';
        await complaint.save();

        // Notify Staff
        sendPushNotification(
            staffId,
            'New Task Assigned',
            `You have been assigned to complaint: ${complaint.title}`,
            { screen: 'complaint-details', id: complaint.id }
        );

        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Status (Staff)
export const updateStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, resolutionNote } = req.body;

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const resolutionImageUrl = files?.image?.[0] ? files.image[0].path : null;
        const resolutionVideoUrl = files?.video?.[0] ? files.video[0].path : null;

        const complaint = await Complaint.findByPk(id as string);
        if (!complaint) {
            res.status(404).json({ message: 'Complaint not found' });
            return;
        }

        // Check if assigned to this staff (Middleware handles role check, but logic check is good)
        // For MVP assuming staff only sees their tasks or we trust the role middleware covering basic access.

        complaint.status = status;
        if (status === 'resolved') {
            complaint.resolvedAt = new Date();
            if (resolutionNote) complaint.resolutionNote = resolutionNote;
            if (resolutionImageUrl) complaint.resolutionImageUrl = resolutionImageUrl;
            if (resolutionVideoUrl) complaint.resolutionVideoUrl = resolutionVideoUrl;
        }

        await complaint.save();

        // Notify Resident
        const statusLabel = status === 'resolved' ? 'Resolved' : status.replace('_', ' ');
        sendPushNotification(
            complaint.residentId,
            `Complaint ${statusLabel}`,
            `Your complaint "${complaint.title}" is now ${statusLabel}.`,
            { screen: 'complaint-details', id: complaint.id }
        );

        res.json(complaint);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
