
import { v4 as uuidv4 } from 'uuid';
import Contact from '../models/Contact';

const services = [
    {
        name: 'John Doe',
        designation: 'Plumber',
        phoneNumber: '+919876543210',
        category: 'service'
    },
    {
        name: 'Jane Smith',
        designation: 'Electrician',
        phoneNumber: '+919876543211',
        category: 'service'
    },
    {
        name: 'Mike Johnson',
        designation: 'Carpenter',
        phoneNumber: '+919876543212',
        category: 'service'
    },
    {
        name: 'Robert Brown',
        designation: 'Lift Technician',
        phoneNumber: '+919876543213',
        category: 'service'
    },
    {
        name: 'Sarah Wilson',
        designation: 'Security Supervisor',
        phoneNumber: '+919876543214',
        category: 'service'
    },
    {
        name: 'David Lee',
        designation: 'Internet/CCTV',
        phoneNumber: '+919876543215',
        category: 'service'
    },
    {
        name: 'Emily Davis',
        designation: 'Pest Control',
        phoneNumber: '+919876543216',
        category: 'service'
    },
    {
        name: 'Tom Wilson',
        designation: 'Gardener',
        phoneNumber: '+919876543217',
        category: 'service'
    }
];

export const seedServiceContacts = async () => {
    try {
        console.log('Seeding service contacts...');

        for (const service of services) {
            const existingContact = await Contact.findOne({
                where: {
                    phoneNumber: service.phoneNumber,
                    category: 'service'
                }
            });

            if (!existingContact) {
                await Contact.create({
                    id: uuidv4(),
                    ...service,
                    category: 'service' as any, // Cast to any to avoid type issues if model not yet updated in runtime
                    isVisible: true
                });
            }
        }

        console.log('Service contacts seeded successfully.');
    } catch (error) {
        console.error('Error seeding service contacts:', error);
    }
};

if (require.main === module) {
    const sequelize = require('../config/database').default;
    sequelize.sync().then(() => {
        seedServiceContacts().then(() => process.exit());
    });
}
