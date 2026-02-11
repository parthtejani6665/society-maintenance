import { Router } from 'express';
import { generateDues, getMaintenanceRecords, markAsPaid } from '../controllers/maintenance.controller';
import authMiddleware from '../middlewares/auth';
import roleMiddleware from '../middlewares/role';

const router = Router();

// Admin: Generate
router.post('/generate', authMiddleware, roleMiddleware(['admin']), generateDues);

// All (Resident/Admin): View
router.get('/', authMiddleware, getMaintenanceRecords);

// Pay (Mock payment for Resident or Admin override)
router.post('/:id/pay', authMiddleware, markAsPaid);

export default router;
