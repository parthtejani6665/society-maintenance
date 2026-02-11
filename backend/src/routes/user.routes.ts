import { Router } from 'express';
import { createUser, getUsers, deleteUser, updateProfile, getUserById } from '../controllers/user.controller';
import authMiddleware from '../middlewares/auth';
import roleMiddleware from '../middlewares/role';

const router = Router();

router.use(authMiddleware);

// Profile route - accessible to all authenticated users
router.put('/profile', updateProfile);

// Admin only routes
router.use(roleMiddleware(['admin']));

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.delete('/:id', deleteUser);

export default router;
