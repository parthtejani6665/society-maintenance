import Amenity from '../src/models/Amenity';
import sequelize from '../src/config/database';

const seedAmenities = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected...');

        const amenities = [
            {
                name: 'Club House',
                description: 'Spacious hall for parties and events.',
                capacity: 50,
                startTime: '08:00',
                endTime: '22:00',
                requiresApproval: true,
                isActive: true
            },
            {
                name: 'Gym',
                description: 'Fully equipped gymnasium.',
                capacity: 10,
                startTime: '06:00',
                endTime: '22:00',
                requiresApproval: false,
                isActive: true
            },
            {
                name: 'Swimming Pool',
                description: 'Outdoor swimming pool.',
                capacity: 15,
                startTime: '06:00',
                endTime: '20:00',
                requiresApproval: false,
                isActive: true
            },
            {
                name: 'Tennis Court',
                description: 'Standard hard court.',
                capacity: 2,
                startTime: '06:00',
                endTime: '21:00',
                requiresApproval: false,
                isActive: true
            }
        ];

        for (const data of amenities) {
            const exists = await Amenity.findOne({ where: { name: data.name } });
            if (!exists) {
                await Amenity.create(data);
                console.log(`Created amenity: ${data.name}`);
            } else {
                console.log(`Amenity already exists: ${data.name}`);
            }
        }

        console.log('Seeding completed.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding amenities:', error);
        process.exit(1);
    }
};

seedAmenities();
