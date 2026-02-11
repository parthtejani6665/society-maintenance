import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface MaintenanceAttributes {
    id: string;
    residentId: string;
    flatNumber: string;
    amount: number;
    month: string;
    year: number;
    status: 'paid' | 'due';
    paidAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

interface MaintenanceCreationAttributes extends Optional<MaintenanceAttributes, 'id' | 'paidAt'> { }

class Maintenance extends Model<MaintenanceAttributes, MaintenanceCreationAttributes> implements MaintenanceAttributes {
    public id!: string;
    public residentId!: string;
    public flatNumber!: string;
    public amount!: number;
    public month!: string;
    public year!: number;
    public status!: 'paid' | 'due';
    public paidAt!: Date;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Maintenance.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        residentId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
        },
        flatNumber: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        month: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('paid', 'due'),
            defaultValue: 'due',
        },
        paidAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'maintenance_records',
    }
);

export default Maintenance;
