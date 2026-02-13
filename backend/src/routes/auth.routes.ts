import { Router } from 'express';
import { login, getMe, registerPushToken, register } from '../controllers/auth.controller';
import { googleAuth } from '../controllers/googleAuth.controller';
import authMiddleware from '../middlewares/auth';

const router = Router();

router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', authMiddleware, getMe);
router.post('/register-push-token', authMiddleware, registerPushToken);
router.post('/register', register);

export default router;
