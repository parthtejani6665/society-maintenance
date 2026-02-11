import { Router } from 'express';
import { login, getMe, registerPushToken } from '../controllers/auth.controller';
import authMiddleware from '../middlewares/auth';

const router = Router();

router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.post('/register-push-token', authMiddleware, registerPushToken);

export default router;
