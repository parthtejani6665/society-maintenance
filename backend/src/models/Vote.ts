import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface VoteAttributes {
    id: string;
    pollId: string;
    userId: string;
    optionId: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface VoteCreationAttributes extends Optional<VoteAttributes, 'id'> { }

class Vote extends Model<VoteAttributes, VoteCreationAttributes> implements VoteAttributes {
    public id!: string;
    public pollId!: string;
    public userId!: string;
    public optionId!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Vote.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        pollId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'polls',
                key: 'id',
            },
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        optionId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'poll_options',
                key: 'id',
            },
        },
    },
    {
        sequelize,
        tableName: 'votes',
        indexes: [
            {
                unique: true,
                fields: ['pollId', 'userId'],
            },
        ],
    }
);

export default Vote;
