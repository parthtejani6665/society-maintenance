import { Router } from 'express';
import { getNotices, createNotice, updateNotice, deleteNotice } from '../controllers/notice.controller';
import authMiddleware from '../middlewares/auth';
import roleMiddleware from '../middlewares/role';

const router = Router();

// Everyone: View
router.get('/', authMiddleware, getNotices);

// Admin only: Create, Update, Delete
router.post('/', authMiddleware, roleMiddleware(['admin']), createNotice);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateNotice);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteNotice);

export default router;
