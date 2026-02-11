import { Router } from 'express';
import { getAllAmenities, createAmenity, updateAmenity, deleteAmenity } from '../controllers/amenity.controller';
import { getAmenityBookings } from '../controllers/booking.controller';
import authMiddleware from '../middlewares/auth';
import roleMiddleware from '../middlewares/role';

const router = Router();

// Public (Authenticated)
router.get('/', authMiddleware, getAllAmenities);
router.get('/:amenityId/bookings', authMiddleware, getAmenityBookings);

// Admin Only
router.post('/', authMiddleware, roleMiddleware(['admin']), createAmenity);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateAmenity);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteAmenity);

export default router;
