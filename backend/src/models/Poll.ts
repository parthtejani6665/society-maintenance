import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import PollOption from './PollOption';

interface PollAttributes {
    id: string;
    question: string;
    description?: string;
    expiresAt: Date;
    createdBy: string;
    createdAt?: Date;
    updatedAt?: Date;
    options?: PollOption[];
}

interface PollCreationAttributes extends Optional<PollAttributes, 'id' | 'description'> { }

class Poll extends Model<PollAttributes, PollCreationAttributes> implements PollAttributes {
    public id!: string;
    public question!: string;
    public description?: string;
    public expiresAt!: Date;
    public createdBy!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public options?: PollOption[];
}

Poll.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        question: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        createdBy: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
    },
    {
        sequelize,
        tableName: 'polls',
    }
);

export default Poll;
