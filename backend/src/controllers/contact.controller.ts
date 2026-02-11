import { Request, Response } from 'express';
import Contact from '../models/Contact';

// Get all visible contacts
export const getContacts = async (req: Request, res: Response) => {
    try {
        const contacts = await Contact.findAll({
            where: { isVisible: true },
            order: [['category', 'ASC'], ['name', 'ASC']],
        });
        res.json(contacts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create a new contact (Admin only)
export const createContact = async (req: Request, res: Response) => {
    try {
        const { name, designation, phoneNumber, category } = req.body;
        const contact = await Contact.create({
            name,
            designation,
            phoneNumber,
            category,
        });
        res.status(201).json(contact);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a contact (Admin only)
export const updateContact = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, designation, phoneNumber, category, isVisible } = req.body;

        const contact = await Contact.findByPk(id as string);
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        await contact.update({
            name,
            designation,
            phoneNumber,
            category,
            isVisible,
        });

        res.json(contact);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a contact (Admin only)
export const deleteContact = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const contact = await Contact.findByPk(id as string);
        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        await contact.destroy();
        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
