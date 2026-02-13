import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ExpenseAttributes {
    id: string;
    title: string;
    amount: number;
    category: 'Maintenance' | 'Security' | 'Landscaping' | 'Utilities' | 'Repairs' | 'Events' | 'Other';
    date: Date;
    description?: string;
    paymentMethod: 'Cash' | 'Bank Transfer' | 'UPI' | 'Cheque';
    gpsCoordinates?: string; // For location tag
    invoiceUrl?: string;
    gstAmount?: number;
    tdsAmount?: number;
    isVerified: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface ExpenseCreationAttributes extends Optional<ExpenseAttributes, 'id' | 'isVerified'> { }

class Expense extends Model<ExpenseAttributes, ExpenseCreationAttributes> implements ExpenseAttributes {
    public id!: string;
    public title!: string;
    public amount!: number;
    public category!: 'Maintenance' | 'Security' | 'Landscaping' | 'Utilities' | 'Repairs' | 'Events' | 'Other';
    public date!: Date;
    public description?: string;
    public paymentMethod!: 'Cash' | 'Bank Transfer' | 'UPI' | 'Cheque';
    public gpsCoordinates?: string;
    public invoiceUrl?: string;
    public gstAmount?: number;
    public tdsAmount?: number;
    public isVerified!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Expense.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        category: {
            type: DataTypes.ENUM('Maintenance', 'Security', 'Landscaping', 'Utilities', 'Repairs', 'Events', 'Other'),
            allowNull: false,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        paymentMethod: {
            type: DataTypes.ENUM('Cash', 'Bank Transfer', 'UPI', 'Cheque'),
            allowNull: false,
            defaultValue: 'Bank Transfer'
        },
        gpsCoordinates: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        invoiceUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        gstAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0
        },
        tdsAmount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
        tableName: 'expenses',
    }
);

export default Expense;
