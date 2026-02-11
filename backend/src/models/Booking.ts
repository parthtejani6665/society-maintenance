import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface BookingAttributes {
    id: string;
    userId: string;
    amenityId: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
}

interface BookingCreationAttributes extends Optional<BookingAttributes, 'id' | 'status'> { }

class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
    public id!: string;
    public userId!: string;
    public amenityId!: string;
    public date!: string;
    public startTime!: string;
    public endTime!: string;
    public status!: 'pending' | 'confirmed' | 'rejected' | 'cancelled';

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Booking.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        amenityId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        startTime: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        endTime: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'confirmed', 'rejected', 'cancelled'),
            defaultValue: 'pending',
        },
    },
    {
        sequelize,
        tableName: 'bookings',
    }
);

export default Booking;
