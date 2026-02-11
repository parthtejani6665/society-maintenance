import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ContactAttributes {
    id: string;
    name: string;
    designation: string;
    phoneNumber: string;
    category: 'emergency' | 'maintenance' | 'administration' | 'service';
    isVisible: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface ContactCreationAttributes extends Optional<ContactAttributes, 'id' | 'isVisible'> { }

class Contact extends Model<ContactAttributes, ContactCreationAttributes> implements ContactAttributes {
    public id!: string;
    public name!: string;
    public designation!: string;
    public phoneNumber!: string;
    public category!: 'emergency' | 'maintenance' | 'administration' | 'service';
    public isVisible!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Contact.init(
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
        designation: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        category: {
            type: DataTypes.ENUM('emergency', 'maintenance', 'administration', 'service'),
            defaultValue: 'emergency',
        },
        isVisible: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'contacts',
    }
);

export default Contact;
