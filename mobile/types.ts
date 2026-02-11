export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';

export type ComplaintCategory = 'water' | 'lift' | 'cleaning' | 'security' | 'parking' | 'other';

export interface Complaint {
    id: string;
    title: string;
    description: string;
    category: ComplaintCategory;
    status: ComplaintStatus;
    userId: number;
    adminId?: number;
    imageUrl?: string;
    videoUrl?: string;
    resolutionImageUrl?: string;
    resolutionVideoUrl?: string;
    resolutionNote?: string;
    resolvedAt?: string;
    createdAt: string;
    updatedAt: string;
    User?: {
        fullName: string;
        flatNumber: string;
    };
    assignedStaff?: {
        id: string;
        fullName: string;
        phoneNumber: string;
    };
}

export interface Contact {
    id: string;
    name: string;
    designation: string;
    phoneNumber: string;
    category: 'emergency' | 'maintenance' | 'administration' | 'service';
    isVisible: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Notice {
    id: string;
    title: string;
    content: string;
    type: 'info' | 'warning' | 'event';
    createdBy: string;
    isPublic: boolean;
    author?: {
        fullName: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Comment {
    id: string;
    complaintId: string;
    userId: string;
    content: string;
    author?: {
        fullName: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface PollOption {
    id: string;
    pollId: string;
    text: string;
    voteCount?: number;
}

export interface Poll {
    id: string;
    question: string;
    description?: string;
    expiresAt: string;
    createdBy: string;
    options: PollOption[];
    votes: any[];
    author?: {
        fullName: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Amenity {
    id: string;
    name: string;
    description?: string;
    capacity: number;
    startTime: string;
    endTime: string;
    requiresApproval: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Booking {
    id: string;
    userId: string;
    amenityId: string;
    date: string;
    startTime: string;
    endTime: string;
    status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
    amenity?: {
        name: string;
    };
    User?: {
        fullName: string;
        flatNumber: string;
    };
    createdAt: string;
    updatedAt: string;
}
