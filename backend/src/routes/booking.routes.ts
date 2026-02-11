import { Router } from 'express';
import { getUserBookings, createBooking, cancelBooking, getAllBookings, updateBookingStatus, getAmenityBookings } from '../controllers/booking.controller';
import authMiddleware from '../middlewares/auth';
import roleMiddleware from '../middlewares/role';

const router = Router();

// Admin Routes
router.get('/admin', authMiddleware, roleMiddleware(['admin']), getAllBookings);
router.put('/:id/status', authMiddleware, roleMiddleware(['admin']), updateBookingStatus);

// All Authenticated Users
router.get('/', authMiddleware, getUserBookings);
router.get('/amenity/:amenityId', authMiddleware, getAmenityBookings);
router.post('/', authMiddleware, createBooking);
router.put('/:id/cancel', authMiddleware, cancelBooking);

export default router;
