import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface ComplaintAttributes {
    id: string;
    title: string;
    category: 'water' | 'lift' | 'cleaning' | 'security' | 'parking' | 'other';
    description?: string;
    imageUrl?: string;
    videoUrl?: string;
    status: 'pending' | 'in_progress' | 'resolved';
    residentId: string;
    assignedToId?: string;
    resolvedAt?: Date;
    resolutionNote?: string;
    resolutionImageUrl?: string;
    resolutionVideoUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface ComplaintCreationAttributes extends Optional<ComplaintAttributes, 'id' | 'status' | 'imageUrl' | 'videoUrl' | 'description' | 'assignedToId' | 'resolvedAt' | 'resolutionNote' | 'resolutionImageUrl' | 'resolutionVideoUrl'> { }

class Complaint extends Model<ComplaintAttributes, ComplaintCreationAttributes> implements ComplaintAttributes {
    public id!: string;
    public title!: string;
    public category!: 'water' | 'lift' | 'cleaning' | 'security' | 'parking' | 'other';
    public description!: string;
    public imageUrl!: string;
    public videoUrl!: string;
    public status!: 'pending' | 'in_progress' | 'resolved';
    public residentId!: string;
    public assignedToId!: string;
    public resolvedAt!: Date;
    public resolutionNote!: string;
    public resolutionImageUrl!: string;
    public resolutionVideoUrl!: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Complaint.init(
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
        category: {
            type: DataTypes.ENUM('water', 'lift', 'cleaning', 'security', 'parking', 'other'),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        videoUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('pending', 'in_progress', 'resolved'),
            defaultValue: 'pending',
        },
        residentId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
        },
        assignedToId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: User,
                key: 'id',
            },
        },
        resolvedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        resolutionNote: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        resolutionImageUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        resolutionVideoUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'complaints',
    }
);

export default Complaint;
