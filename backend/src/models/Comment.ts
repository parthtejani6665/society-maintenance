import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';
import Complaint from './Complaint';

interface CommentAttributes {
    id: string;
    complaintId: string;
    userId: string;
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface CommentCreationAttributes extends Optional<CommentAttributes, 'id'> { }

class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
    public id!: string;
    public complaintId!: string;
    public userId!: string;
    public content!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    // Associations
    public readonly author?: User;
}

Comment.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        complaintId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'complaints',
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
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: 'comments',
    }
);

export default Comment;
