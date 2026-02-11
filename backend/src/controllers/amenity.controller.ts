import { Request, Response } from 'express';
import Amenity from '../models/Amenity';

// Get All Amenities
export const getAllAmenities = async (req: Request, res: Response) => {
    try {
        const amenities = await Amenity.findAll({
            where: { isActive: true },
            order: [['name', 'ASC']],
        });
        res.json(amenities);
    } catch (error) {
        console.error('Error fetching amenities:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create Amenity (Admin)
export const createAmenity = async (req: Request, res: Response) => {
    try {
        const { name, description, capacity, startTime, endTime, requiresApproval } = req.body;

        const amenity = await Amenity.create({
            name,
            description,
            capacity,
            startTime,
            endTime,
            requiresApproval,
            isActive: true,
        });

        res.status(201).json(amenity);
    } catch (error) {
        console.error('Error creating amenity:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Amenity (Admin)
export const updateAmenity = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const amenity = await Amenity.findByPk(id as string);

        if (!amenity) {
            res.status(404).json({ message: 'Amenity not found' });
            return;
        }

        await amenity.update(req.body);
        res.json(amenity);
    } catch (error) {
        console.error('Error updating amenity:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete Amenity (Admin - Soft Delete)
export const deleteAmenity = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const amenity = await Amenity.findByPk(id as string);

        if (!amenity) {
            res.status(404).json({ message: 'Amenity not found' });
            return;
        }

        amenity.isActive = false;
        await amenity.save();
        res.json({ message: 'Amenity deleted successfully' });
    } catch (error) {
        console.error('Error deleting amenity:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
