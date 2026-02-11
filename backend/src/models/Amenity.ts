import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AmenityAttributes {
    id: string;
    name: string;
    description?: string;
    capacity: number;
    startTime: string; // "06:00"
    endTime: string;   // "22:00"
    requiresApproval: boolean;
    isActive: boolean;
}

interface AmenityCreationAttributes extends Optional<AmenityAttributes, 'id'> { }

class Amenity extends Model<AmenityAttributes, AmenityCreationAttributes> implements AmenityAttributes {
    public id!: string;
    public name!: string;
    public description?: string;
    public capacity!: number;
    public startTime!: string;
    public endTime!: string;
    public requiresApproval!: boolean;
    public isActive!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Amenity.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        capacity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        startTime: {
            type: DataTypes.STRING, // Store as "HH:mm"
            allowNull: false,
        },
        endTime: {
            type: DataTypes.STRING, // Store as "HH:mm"
            allowNull: false,
        },
        requiresApproval: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'amenities',
    }
);

export default Amenity;
