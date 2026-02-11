import { Router } from 'express';
import { getNotifications, markRead } from '../controllers/notification.controller';
import authMiddleware from '../middlewares/auth';

const router = Router();

router.get('/', authMiddleware, getNotifications);
router.patch('/:id/read', authMiddleware, markRead);

export default router;
