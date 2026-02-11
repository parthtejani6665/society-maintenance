import { Router } from 'express';
import { createComplaint, getComplaints, getComplaintById, assignComplaint, updateStatus } from '../controllers/complaint.controller';
import authMiddleware from '../middlewares/auth';
import roleMiddleware from '../middlewares/role';
import upload from '../middlewares/upload';

const router = Router();

// Resident: Create
router.post('/', authMiddleware, roleMiddleware(['resident']), upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), createComplaint);

// All: View (Filtered by logic)
router.get('/', authMiddleware, getComplaints);
router.get('/:id', authMiddleware, getComplaintById);

// Admin: Assign
router.patch('/:id/assign', authMiddleware, roleMiddleware(['admin']), assignComplaint);

// Staff: Update Status
router.patch('/:id/status', authMiddleware, roleMiddleware(['staff']), upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), updateStatus);

export default router;
