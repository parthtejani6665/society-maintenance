import User from './User';
import Complaint from './Complaint';
import Maintenance from './Maintenance';
import Notification from './Notification';
import Contact from './Contact';
import Notice from './Notice';
import Comment from './Comment';
import Poll from './Poll';
import PollOption from './PollOption';
import Vote from './Vote';
import Amenity from './Amenity';
import Booking from './Booking';

// User Relationships
User.hasMany(Complaint, { foreignKey: 'residentId', as: 'complaints' });
User.hasMany(Complaint, { foreignKey: 'assignedToId', as: 'assignedTasks' });
User.hasMany(Maintenance, { foreignKey: 'residentId', as: 'maintenanceRecords' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
User.hasMany(Notice, { foreignKey: 'createdBy', as: 'notices' });
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
User.hasMany(Poll, { foreignKey: 'createdBy', as: 'polls' });
User.hasMany(Vote, { foreignKey: 'userId', as: 'votes' });
User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });

// Complaint Relationships
Complaint.belongsTo(User, { foreignKey: 'residentId', as: 'resident' });
Complaint.belongsTo(User, { foreignKey: 'assignedToId', as: 'assignedStaff' });
Complaint.hasMany(Comment, { foreignKey: 'complaintId', as: 'comments' });

// Maintenance Relationships
Maintenance.belongsTo(User, { foreignKey: 'residentId', as: 'resident' });

// Notification Relationships
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Notice Relationships
Notice.belongsTo(User, { foreignKey: 'createdBy', as: 'author' });

// Comment Relationships
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });
Comment.belongsTo(Complaint, { foreignKey: 'complaintId', as: 'complaint' });

// Poll Relationships
Poll.belongsTo(User, { foreignKey: 'createdBy', as: 'author' });
Poll.hasMany(PollOption, { foreignKey: 'pollId', as: 'options' });
Poll.hasMany(Vote, { foreignKey: 'pollId', as: 'votes' });

// PollOption Relationships
PollOption.belongsTo(Poll, { foreignKey: 'pollId', as: 'poll' });
PollOption.hasMany(Vote, { foreignKey: 'optionId', as: 'votes' });

// Vote Relationships
Vote.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Vote.belongsTo(Poll, { foreignKey: 'pollId', as: 'poll' });
Vote.belongsTo(PollOption, { foreignKey: 'optionId', as: 'option' });

// Amenity Relationships
Amenity.hasMany(Booking, { foreignKey: 'amenityId', as: 'bookings' });

// Booking Relationships
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Booking.belongsTo(Amenity, { foreignKey: 'amenityId', as: 'amenity' });

export {
    User,
    Complaint,
    Maintenance,
    Notification,
    Contact,
    Notice,
    Comment,
    Poll,
    PollOption,
    Vote,
    Amenity,
    Booking
};

