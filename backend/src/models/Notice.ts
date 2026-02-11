import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface NoticeAttributes {
    id: string;
    title: string;
    content: string;
    type: 'info' | 'warning' | 'event';
    createdBy: string;
    isPublic: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface NoticeCreationAttributes extends Optional<NoticeAttributes, 'id' | 'isPublic'> { }

class Notice extends Model<NoticeAttributes, NoticeCreationAttributes> implements NoticeAttributes {
    public id!: string;
    public title!: string;
    public content!: string;
    public type!: 'info' | 'warning' | 'event';
    public createdBy!: string;
    public isPublic!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Notice.init(
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
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('info', 'warning', 'event'),
            defaultValue: 'info',
        },
        createdBy: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
        },
        isPublic: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        sequelize,
        tableName: 'notices',
    }
);

export default Notice;
