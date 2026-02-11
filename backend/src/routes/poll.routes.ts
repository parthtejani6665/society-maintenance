import express from 'express';
import { createPoll, getPolls, vote, getPollResults } from '../controllers/poll_controller';
import authMiddleware from '../middlewares/auth';
import roleMiddleware from '../middlewares/role';

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware(['admin']), createPoll);
router.get('/', authMiddleware, getPolls);
router.post('/vote', authMiddleware, vote);
router.get('/:pollId/results', authMiddleware, getPollResults);

export default router;
