import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

interface PollOptionAttributes {
    id: string;
    pollId: string;
    text: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface PollOptionCreationAttributes extends Optional<PollOptionAttributes, 'id'> { }

class PollOption extends Model<PollOptionAttributes, PollOptionCreationAttributes> implements PollOptionAttributes {
    public id!: string;
    public pollId!: string;
    public text!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

PollOption.init(
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
        text: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'poll_options',
    }
);

export default PollOption;
