import sequelize from './config/database';
import User from './models/User';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import './models'; // Init models

dotenv.config();

const seed = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: true }); // Reset DB

        console.log('Database synced. Seeding data...');

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('Admin@123', salt);
        const userPassword = await bcrypt.hash('123456', salt);

        // Admin
        await User.create({
            fullName: 'Society Admin',
            email: 'admin@society.com',
            password: password,
            phoneNumber: '9999999999',
            role: 'admin',
            isActive: true,
        } as any);

        // Residents (Flat A-E)
        // Assuming A-101 to A-105
        for (let i = 1; i <= 5; i++) {
            await User.create({
                fullName: `Resident ${i}`,
                email: `resident${i}@society.com`,
                password: userPassword,
                phoneNumber: `987654320${i}`,
                role: 'resident',
                flatNumber: `A-10${i}`,
                isActive: true,
            } as any);
        }

        // Staff
        const staffRoles = ['Plumber', 'Electrician'];
        for (let i = 0; i < 2; i++) {
            await User.create({
                fullName: `Staff ${staffRoles[i]}`,
                email: `staff${i + 1}@society.com`,
                password: userPassword,
                phoneNumber: `912345670${i}`,
                role: 'staff',
                isActive: true,
            } as any);
        }

        // Emergency Contacts
        const emergencyContacts = [
            { name: 'Local Police Station', designation: 'Emergency Services', phoneNumber: '100', category: 'emergency' },
            { name: 'City Hospital', designation: 'Medical Emergency', phoneNumber: '102', category: 'emergency' },
            { name: 'Fire Brigade', designation: 'Fire Emergency', phoneNumber: '101', category: 'emergency' },
            { name: 'Ambulance', designation: 'Health Emergency', phoneNumber: '108', category: 'emergency' },
        ];

        for (const contact of emergencyContacts) {
            await (sequelize.models.Contact as any).create(contact);
        }

        console.log('Seeding completed.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
