import express from 'express';
import { createComment, getComments, deleteComment } from '../controllers/comment_controller';
import authMiddleware from '../middlewares/auth';

const router = express.Router();

router.post('/', authMiddleware, createComment);
router.get('/:complaintId', authMiddleware, getComments);
router.delete('/:id', authMiddleware, deleteComment);

export default router;
