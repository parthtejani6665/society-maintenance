import { Router } from 'express';
import { createUser, getUsers, deleteUser, updateProfile, getUserById, updateUser, updateProfileImage } from '../controllers/user.controller';
import upload from '../middlewares/upload';
import authMiddleware from '../middlewares/auth';
import roleMiddleware from '../middlewares/role';

const router = Router();

router.use(authMiddleware);

// Profile route - accessible to all authenticated users
router.put('/profile', updateProfile);
router.post('/profile/avatar', upload.single('avatar'), updateProfileImage);

// Admin only routes
router.use(roleMiddleware(['admin']));

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
