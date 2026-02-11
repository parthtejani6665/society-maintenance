import sequelize from './config/database';
import Contact from './models/Contact';
import dotenv from 'dotenv';
import './models';

dotenv.config();

const seedEmergency = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to database.');

        const emergencyContacts = [
            { name: 'Local Police Station', designation: 'Emergency Services', phoneNumber: '100', category: 'emergency' as const },
            { name: 'City Hospital', designation: 'Medical Emergency', phoneNumber: '102', category: 'emergency' as const },
            { name: 'Fire Brigade', designation: 'Fire Emergency', phoneNumber: '101', category: 'emergency' as const },
            { name: 'Ambulance', designation: 'Health Emergency', phoneNumber: '108', category: 'emergency' as const },
        ];

        for (const contact of emergencyContacts) {
            const [item, created] = await Contact.findOrCreate({
                where: { name: contact.name },
                defaults: contact
            });
            if (created) {
                console.log(`Added: ${contact.name}`);
            } else {
                console.log(`Exists: ${contact.name}`);
            }
        }

        console.log('Emergency contacts seeding completed.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedEmergency();
