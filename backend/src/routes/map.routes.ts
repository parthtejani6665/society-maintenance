import express from 'express';
import { getNearbyServices } from '../controllers/map.controller';
import authMiddleware from '../middlewares/auth'; // Assuming you want this protected

const router = express.Router();

// Protected route to fetch nearby services
// GET /api/maps/nearby?lat=...&lng=...&type=...
router.get('/nearby', authMiddleware, getNearbyServices);

export default router;
