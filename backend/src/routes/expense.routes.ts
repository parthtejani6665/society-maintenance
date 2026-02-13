import { Router } from 'express';
import { createExpense, getExpenses, getAnalytics, deleteExpense } from '../controllers/expense.controller';
import authMiddleware from '../middlewares/auth';
import roleMiddleware from '../middlewares/role';

const router = Router();

// Public/Resident routes (Analytics might be visible to residents for transparency)
router.get('/', authMiddleware, getExpenses);
router.get('/analytics', authMiddleware, getAnalytics);

// Admin only routes
router.post('/', authMiddleware, roleMiddleware(['admin']), createExpense);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteExpense);

export default router;
