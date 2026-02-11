import { Router } from 'express';
import { getContacts, createContact, updateContact, deleteContact } from '../controllers/contact.controller';
import authMiddleware from '../middlewares/auth';
import roleMiddleware from '../middlewares/role';

const router = Router();

// Everyone (Resident, Admin, Staff): View
router.get('/', authMiddleware, roleMiddleware(['admin', 'resident', 'staff']), getContacts);

// Admin only: Create, Update, Delete
router.post('/', authMiddleware, roleMiddleware(['admin']), createContact);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), updateContact);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), deleteContact);

export default router;
