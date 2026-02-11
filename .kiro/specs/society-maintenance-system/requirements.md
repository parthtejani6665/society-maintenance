# Requirements Document

## Introduction

The Society Maintenance & Complaint Management System is a full-stack mobile application designed to streamline communication and management within residential societies. The system provides role-based access control for three user types: administrators/committee members who manage the entire system, residents who can raise complaints and view payment information, and maintenance staff who handle assigned tasks. The application uses React Native with Expo for the frontend and Node.js with Express and PostgreSQL for the backend.

## Glossary

- **System**: The Society Maintenance & Complaint Management System
- **Admin**: A user with administrative privileges (committee member)
- **Resident**: A user who lives in the society and can raise complaints
- **Staff**: Maintenance staff who handle assigned complaints
- **Complaint**: A reported issue or problem within the society
- **Maintenance_Record**: A payment record for monthly society maintenance fees
- **Notification**: A system-generated message sent to users
- **JWT**: JSON Web Token used for authentication
- **Active_User**: A user account with isActive status set to true
- **Resolved_Complaint**: A complaint with status set to 'resolved'
- **Assignment**: The act of linking a complaint to a staff member
- **Announcement**: A society-wide notice or message posted by admins
- **Document**: A file uploaded to the system for sharing (rules, minutes, etc.)
- **Visitor**: A guest entering the society premises
- **Amenity**: A common facility that can be booked (clubhouse, gym, pool, etc.)
- **Booking**: A reservation for an amenity during a specific time slot
- **Emergency_Contact**: Contact information for emergency services or personnel
- **Poll**: A voting mechanism for society decisions
- **Vote**: A single user's response to a poll
- **Expense**: A financial transaction or cost incurred by the society
- **Comment**: A message or update added to an existing complaint
- **Password_Reset_Token**: A temporary token used for password reset verification
- **Search_Query**: User input for filtering or searching records
- **Report**: An aggregated data summary for a specific time period
- **Language_Preference**: A user's selected language for the interface

## Requirements

### Requirement 1: User Authentication

**User Story:** As a user, I want to securely log in and log out of the system, so that my account and data remain protected.

#### Acceptance Criteria

1. WHEN a user submits valid credentials, THE System SHALL generate a JWT token and return it to the client
2. WHEN a user submits invalid credentials, THE System SHALL reject the login attempt and return an authentication error
3. WHEN an authenticated user logs out, THE System SHALL invalidate their session
4. WHEN a user with isActive set to false attempts to login, THE System SHALL reject the login attempt
5. WHEN a JWT token is generated, THE System SHALL include the user's id, email, and role in the token payload
6. WHEN a protected endpoint is accessed, THE System SHALL validate the JWT token before processing the request

### Requirement 2: Role-Based Access Control

**User Story:** As a system administrator, I want users to have different access levels based on their roles, so that sensitive operations are restricted appropriately.

#### Acceptance Criteria

1. WHEN an Admin accesses any endpoint, THE System SHALL grant access to all system features
2. WHEN a Resident attempts to access admin-only endpoints, THE System SHALL deny access and return an authorization error
3. WHEN a Staff member attempts to access admin-only endpoints, THE System SHALL deny access and return an authorization error
4. WHEN a Resident accesses their own data, THE System SHALL grant access only to their personal records
5. WHEN a Staff member accesses complaint data, THE System SHALL grant access only to complaints assigned to them
6. WHEN a user's role is verified, THE System SHALL use the role claim from the validated JWT token

### Requirement 3: User Management

**User Story:** As an Admin, I want to create and manage user accounts for residents and staff, so that I can control who has access to the system.

#### Acceptance Criteria

1. WHEN an Admin creates a new user, THE System SHALL hash the password using bcrypt before storing it
2. WHEN an Admin creates a new user with an existing email, THE System SHALL reject the creation and return a validation error
3. WHEN an Admin updates a user's information, THE System SHALL validate all input fields before persisting changes
4. WHEN an Admin deactivates a user, THE System SHALL set the isActive field to false
5. WHEN an Admin retrieves the user list, THE System SHALL return all users with their details excluding password hashes
6. THE System SHALL generate a UUID for each new user as their primary key

### Requirement 4: Complaint Creation and Management

**User Story:** As a Resident, I want to create complaints with descriptions and images, so that I can report issues in the society.

#### Acceptance Criteria

1. WHEN a Resident creates a complaint, THE System SHALL set the status to 'pending' and store the residentId
2. WHEN a Resident uploads an image with a complaint, THE System SHALL validate the file type and size before storing it
3. WHEN a complaint is created, THE System SHALL generate a UUID as the complaint's primary key
4. WHEN a Resident views complaints, THE System SHALL return only complaints created by that resident
5. WHEN an Admin views complaints, THE System SHALL return all complaints in the system
6. THE System SHALL require title, category, and description fields for all new complaints

### Requirement 5: Complaint Assignment

**User Story:** As an Admin, I want to assign complaints to staff members, so that issues are handled by appropriate personnel.

#### Acceptance Criteria

1. WHEN an Admin assigns a complaint to a staff member, THE System SHALL update the assignedToId field with the staff member's id
2. WHEN an Admin assigns a complaint, THE System SHALL verify that the assignedToId corresponds to a user with role 'staff'
3. WHEN a complaint is assigned, THE System SHALL create a notification for the assigned staff member
4. WHEN an Admin attempts to assign a resolved complaint, THE System SHALL reject the assignment and return an error
5. WHEN a complaint assignment is updated, THE System SHALL record the updatedAt timestamp

### Requirement 6: Complaint Status Updates

**User Story:** As a Staff member, I want to update the status of complaints assigned to me, so that I can track my progress on resolving issues.

#### Acceptance Criteria

1. WHEN a Staff member updates a complaint status to 'in_progress', THE System SHALL verify the complaint is assigned to that staff member
2. WHEN a Staff member updates a complaint status to 'resolved', THE System SHALL set the resolvedAt timestamp to the current date and time
3. WHEN a Staff member attempts to update an unassigned complaint, THE System SHALL reject the update and return an authorization error
4. WHEN a complaint status is updated to 'resolved', THE System SHALL create a notification for the resident who created the complaint
5. WHEN a Staff member attempts to modify a resolved complaint, THE System SHALL reject the modification and return an error

### Requirement 7: Maintenance Payment Management

**User Story:** As an Admin, I want to generate and track monthly maintenance payment records, so that I can monitor payment collection.

#### Acceptance Criteria

1. WHEN an Admin generates maintenance records, THE System SHALL create a record for each active resident with status 'due'
2. WHEN a maintenance record is created, THE System SHALL include the month, year, flatNumber, and amount fields
3. WHEN an Admin marks a maintenance payment as paid, THE System SHALL update the status to 'paid' and set the paidAt timestamp
4. WHEN a Resident views maintenance records, THE System SHALL return only records associated with their residentId
5. WHEN an Admin views payment reports, THE System SHALL return aggregated payment statistics including total collected and outstanding amounts
6. THE System SHALL generate a UUID for each maintenance record as its primary key

### Requirement 8: Dashboard Data Aggregation

**User Story:** As a user, I want to see role-specific dashboard information, so that I can quickly understand relevant metrics and tasks.

#### Acceptance Criteria

1. WHEN an Admin accesses the dashboard, THE System SHALL return total complaint counts, pending and resolved counts, staff workload distribution, and payment summary
2. WHEN a Resident accesses the dashboard, THE System SHALL return their complaint history and payment due amounts
3. WHEN a Staff member accesses the dashboard, THE System SHALL return assigned complaint counts and task completion statistics
4. WHEN dashboard data is requested, THE System SHALL calculate all metrics in real-time from the database
5. THE System SHALL filter all dashboard queries based on the authenticated user's role and id

### Requirement 9: Notification System

**User Story:** As a user, I want to receive notifications about important events, so that I stay informed about system activities.

#### Acceptance Criteria

1. WHEN a complaint is assigned to a staff member, THE System SHALL create a notification with type 'complaint' for that staff member
2. WHEN a complaint status changes to 'resolved', THE System SHALL create a notification with type 'complaint' for the resident who created it
3. WHEN a user retrieves notifications, THE System SHALL return all notifications for that user ordered by creation date
4. WHEN a user marks a notification as read, THE System SHALL update the isRead field to true
5. THE System SHALL include title and message fields in all notifications
6. THE System SHALL generate a UUID for each notification as its primary key

### Requirement 10: Data Validation and Security

**User Story:** As a system administrator, I want all user inputs to be validated and sanitized, so that the system remains secure and data integrity is maintained.

#### Acceptance Criteria

1. WHEN any API endpoint receives input, THE System SHALL validate all required fields before processing
2. WHEN file uploads are received, THE System SHALL validate file type, size, and content before storing
3. WHEN database queries are executed, THE System SHALL use Sequelize parameterized queries to prevent SQL injection
4. WHEN passwords are stored or updated, THE System SHALL hash them using bcrypt with appropriate salt rounds
5. WHEN validation fails, THE System SHALL return descriptive error messages with appropriate HTTP status codes
6. THE System SHALL validate email format for all email fields

### Requirement 11: Database Schema and Relationships

**User Story:** As a developer, I want properly defined database models with relationships, so that data integrity is maintained through foreign key constraints.

#### Acceptance Criteria

1. WHEN a Complaint is created, THE System SHALL enforce a foreign key relationship between residentId and the User table
2. WHEN a Complaint is assigned, THE System SHALL enforce a foreign key relationship between assignedToId and the User table
3. WHEN a Maintenance_Record is created, THE System SHALL enforce a foreign key relationship between residentId and the User table
4. WHEN a Notification is created, THE System SHALL enforce a foreign key relationship between userId and the User table
5. WHEN a User is deleted, THE System SHALL handle cascading effects on related records according to defined constraints
6. THE System SHALL use UUID data type for all primary keys and foreign keys

### Requirement 12: API Response Format

**User Story:** As a frontend developer, I want consistent API response formats, so that I can reliably parse and handle responses.

#### Acceptance Criteria

1. WHEN an API request succeeds, THE System SHALL return a response with appropriate HTTP status code and data payload
2. WHEN an API request fails due to validation, THE System SHALL return a 400 status code with error details
3. WHEN an API request fails due to authentication, THE System SHALL return a 401 status code with error message
4. WHEN an API request fails due to authorization, THE System SHALL return a 403 status code with error message
5. WHEN an API request fails due to server error, THE System SHALL return a 500 status code and log the error details
6. THE System SHALL include timestamps in all response objects where applicable

### Requirement 13: Image Upload and Storage

**User Story:** As a Resident, I want to attach images to my complaints, so that I can provide visual evidence of issues.

#### Acceptance Criteria

1. WHEN a Resident uploads an image, THE System SHALL validate that the file is an image type (JPEG, PNG, or similar)
2. WHEN a Resident uploads an image, THE System SHALL validate that the file size does not exceed the configured maximum
3. WHEN an image upload is successful, THE System SHALL store the file in the uploads directory and save the file path in the database
4. WHEN a complaint with an image is retrieved, THE System SHALL include the imageUrl in the response
5. IF an image upload fails, THEN THE System SHALL return an error and not create the complaint record

### Requirement 14: Seed Data Initialization

**User Story:** As a developer, I want to initialize the system with sample data, so that I can test functionality without manual data entry.

#### Acceptance Criteria

1. WHEN the seed script is executed, THE System SHALL create one admin user with email 'admin@society.com' and hashed password
2. WHEN the seed script is executed, THE System SHALL create five resident users with flat numbers A through E
3. WHEN the seed script is executed, THE System SHALL create two staff member users
4. WHEN the seed script is executed, THE System SHALL create ten sample complaints with varied statuses and categories
5. WHEN the seed script is executed, THE System SHALL create maintenance records for the current month for all residents
6. THE System SHALL ensure all seeded passwords are properly hashed using bcrypt

### Requirement 15: Token Storage and Management

**User Story:** As a mobile app user, I want my authentication token to be securely stored, so that I remain logged in between app sessions.

#### Acceptance Criteria

1. WHEN a user successfully logs in, THE System SHALL store the JWT token in AsyncStorage
2. WHEN the app is reopened, THE System SHALL retrieve the token from AsyncStorage and validate it
3. WHEN a user logs out, THE System SHALL remove the token from AsyncStorage
4. WHEN a token expires, THE System SHALL redirect the user to the login screen
5. WHEN API requests are made, THE System SHALL include the token in the Authorization header

### Requirement 16: Routing and Navigation

**User Story:** As a user, I want to be automatically directed to the appropriate interface based on my role, so that I see only relevant features.

#### Acceptance Criteria

1. WHEN a user logs in as Admin, THE System SHALL navigate to the admin dashboard route
2. WHEN a user logs in as Resident, THE System SHALL navigate to the resident dashboard route
3. WHEN a user logs in as Staff, THE System SHALL navigate to the staff dashboard route
4. WHEN an unauthenticated user attempts to access protected routes, THE System SHALL redirect to the login screen
5. THE System SHALL use Expo Router file-based routing for all navigation

### Requirement 17: Error Handling and Logging

**User Story:** As a system administrator, I want comprehensive error handling and logging, so that I can diagnose and fix issues quickly.

#### Acceptance Criteria

1. WHEN an unhandled error occurs, THE System SHALL catch it with error handling middleware
2. WHEN an error is caught, THE System SHALL log the error details including stack trace
3. WHEN an error response is sent, THE System SHALL not expose sensitive system information
4. WHEN database operations fail, THE System SHALL rollback transactions and return appropriate error messages
5. THE System SHALL use try-catch blocks for all async operations

### Requirement 18: TypeScript Type Safety

**User Story:** As a developer, I want strict TypeScript typing throughout the codebase, so that type-related bugs are caught at compile time.

#### Acceptance Criteria

1. THE System SHALL define TypeScript interfaces for all database models
2. THE System SHALL define TypeScript interfaces for all API request and response payloads
3. THE System SHALL define TypeScript types for all function parameters and return values
4. THE System SHALL use TypeScript enums for all fixed value sets (roles, statuses, categories)
5. THE System SHALL configure TypeScript with strict mode enabled
6. WHEN TypeScript compilation occurs, THE System SHALL produce no type errors

### Requirement 19: Database Migrations

**User Story:** As a developer, I want database migrations to manage schema changes, so that database structure can be versioned and deployed consistently.

#### Acceptance Criteria

1. THE System SHALL provide migration files for creating all database tables
2. THE System SHALL define all foreign key constraints in migration files
3. THE System SHALL define all indexes in migration files
4. WHEN migrations are executed, THE System SHALL apply them in the correct order
5. THE System SHALL support rollback of migrations for development purposes

### Requirement 20: API Documentation

**User Story:** As a developer, I want clear API endpoint documentation, so that I can integrate the frontend with the backend efficiently.

#### Acceptance Criteria

1. THE System SHALL document all API endpoints with their HTTP methods, paths, and purposes
2. THE System SHALL document all request body schemas with required and optional fields
3. THE System SHALL document all response schemas with status codes and data structures
4. THE System SHALL document all authentication and authorization requirements for each endpoint
5. WHERE a Postman collection is provided, THE System SHALL include example requests for all endpoints

### Requirement 21: Announcements and Notices

**User Story:** As an Admin, I want to post society-wide announcements, so that all residents stay informed about important updates and events.

#### Acceptance Criteria

1. WHEN an Admin creates an announcement, THE System SHALL store the title, content, priority level, and creation timestamp
2. WHEN an announcement is created, THE System SHALL generate a notification for all active residents
3. WHEN a Resident views announcements, THE System SHALL return all announcements ordered by creation date descending
4. WHEN an Admin marks an announcement as pinned, THE System SHALL display it at the top of the announcement list
5. WHEN an Admin deletes an announcement, THE System SHALL soft-delete it by setting isActive to false
6. THE System SHALL generate a UUID for each announcement as its primary key

### Requirement 22: Document Management

**User Story:** As an Admin, I want to upload and share society documents, so that residents can access important files like rules, meeting minutes, and policies.

#### Acceptance Criteria

1. WHEN an Admin uploads a document, THE System SHALL validate the file type against allowed formats (PDF, DOC, DOCX, XLS, XLSX)
2. WHEN an Admin uploads a document, THE System SHALL validate that the file size does not exceed 10MB
3. WHEN a document is uploaded, THE System SHALL store the file path, original filename, category, and upload timestamp
4. WHEN a Resident views documents, THE System SHALL return all documents filtered by category if specified
5. WHEN a user downloads a document, THE System SHALL serve the file with appropriate content-type headers
6. THE System SHALL generate a UUID for each document as its primary key

### Requirement 23: Visitor Management

**User Story:** As a Resident, I want to register expected visitors, so that security can verify and grant them entry efficiently.

#### Acceptance Criteria

1. WHEN a Resident registers a visitor, THE System SHALL store visitor name, phone number, expected date, and purpose of visit
2. WHEN a visitor entry is created, THE System SHALL generate a unique visitor code for verification
3. WHEN security staff checks in a visitor, THE System SHALL update the checkInTime and set status to 'checked_in'
4. WHEN security staff checks out a visitor, THE System SHALL update the checkOutTime and set status to 'checked_out'
5. WHEN a Resident views visitor history, THE System SHALL return only visitors registered by that resident
6. THE System SHALL automatically expire visitor registrations after the expected date has passed

### Requirement 24: Amenity Booking

**User Story:** As a Resident, I want to book common facilities like the clubhouse or gym, so that I can use them at my preferred time without conflicts.

#### Acceptance Criteria

1. WHEN a Resident creates a booking, THE System SHALL validate that the amenity is available for the requested time slot
2. WHEN a booking is created, THE System SHALL prevent overlapping bookings for the same amenity
3. WHEN a Resident cancels a booking, THE System SHALL update the status to 'cancelled' and free the time slot
4. WHEN an Admin views bookings, THE System SHALL return all bookings with filtering options by amenity and date
5. WHEN a Resident attempts to book more than 7 days in advance, THE System SHALL reject the booking
6. THE System SHALL generate a UUID for each booking as its primary key

### Requirement 25: Emergency Contacts

**User Story:** As a user, I want to access emergency contact information quickly, so that I can reach help during urgent situations.

#### Acceptance Criteria

1. WHEN an Admin adds an emergency contact, THE System SHALL store name, designation, phone number, and contact type
2. WHEN any user views emergency contacts, THE System SHALL return all active contacts ordered by priority
3. WHEN an Admin updates an emergency contact, THE System SHALL validate the phone number format
4. WHEN an Admin deactivates an emergency contact, THE System SHALL set isActive to false
5. THE System SHALL categorize emergency contacts by type (fire, medical, security, maintenance)
6. THE System SHALL generate a UUID for each emergency contact as its primary key

### Requirement 26: Polls and Voting

**User Story:** As an Admin, I want to create polls for society decisions, so that residents can participate in democratic decision-making.

#### Acceptance Criteria

1. WHEN an Admin creates a poll, THE System SHALL store the question, options, start date, and end date
2. WHEN a Resident casts a vote, THE System SHALL validate that the poll is currently active
3. WHEN a Resident casts a vote, THE System SHALL prevent duplicate voting by the same user on the same poll
4. WHEN a poll expires, THE System SHALL calculate and store the results with vote counts for each option
5. WHEN a Resident views poll results, THE System SHALL display results only after the poll has ended
6. THE System SHALL generate a UUID for each poll and vote as their primary keys

### Requirement 27: Expense Tracking

**User Story:** As an Admin, I want to track society expenses beyond maintenance payments, so that I can maintain transparent financial records.

#### Acceptance Criteria

1. WHEN an Admin records an expense, THE System SHALL store the amount, category, description, date, and vendor information
2. WHEN an Admin uploads a receipt for an expense, THE System SHALL validate and store the image file
3. WHEN an Admin views expenses, THE System SHALL support filtering by date range, category, and amount
4. WHEN a Resident views expense reports, THE System SHALL return aggregated monthly expense summaries
5. WHEN an Admin generates a financial report, THE System SHALL include total expenses, category-wise breakdown, and comparison with previous periods
6. THE System SHALL generate a UUID for each expense as its primary key

### Requirement 28: Complaint Comments

**User Story:** As a user, I want to add comments to complaints, so that I can provide updates or additional information during the resolution process.

#### Acceptance Criteria

1. WHEN a user adds a comment to a complaint, THE System SHALL store the comment text, userId, and timestamp
2. WHEN a Resident adds a comment, THE System SHALL verify they are the complaint creator
3. WHEN a Staff member adds a comment, THE System SHALL verify the complaint is assigned to them
4. WHEN an Admin adds a comment, THE System SHALL allow commenting on any complaint
5. WHEN a comment is added, THE System SHALL create a notification for relevant users (complaint creator and assigned staff)
6. THE System SHALL generate a UUID for each comment as its primary key

### Requirement 29: User Profile Management

**User Story:** As a user, I want to update my profile information, so that my contact details and preferences remain current.

#### Acceptance Criteria

1. WHEN a user updates their profile, THE System SHALL allow modification of name, phone number, and email
2. WHEN a user updates their email, THE System SHALL validate that the new email is not already in use
3. WHEN a user updates their password, THE System SHALL require the current password for verification
4. WHEN a user updates their password, THE System SHALL hash the new password using bcrypt before storing
5. WHEN a Resident updates their flat number, THE System SHALL require Admin approval
6. THE System SHALL validate all profile updates before persisting changes

### Requirement 30: Password Reset

**User Story:** As a user, I want to reset my password if I forget it, so that I can regain access to my account without admin intervention.

#### Acceptance Criteria

1. WHEN a user requests a password reset, THE System SHALL generate a unique reset token with 1-hour expiration
2. WHEN a reset token is generated, THE System SHALL send it to the user's registered email address
3. WHEN a user submits a reset token, THE System SHALL validate that the token exists and has not expired
4. WHEN a user completes password reset, THE System SHALL hash the new password and invalidate the reset token
5. WHEN a reset token expires, THE System SHALL reject any reset attempts using that token
6. THE System SHALL generate a UUID for each password reset token as its primary key

### Requirement 31: Search and Filtering

**User Story:** As a user, I want to search and filter records, so that I can quickly find specific information without scrolling through long lists.

#### Acceptance Criteria

1. WHEN a user searches complaints, THE System SHALL support filtering by status, category, date range, and keyword
2. WHEN a user searches users, THE System SHALL support filtering by role, active status, and flat number
3. WHEN a user searches maintenance records, THE System SHALL support filtering by payment status, month, and year
4. WHEN a search query is submitted, THE System SHALL return results ordered by relevance or date
5. WHEN search results are empty, THE System SHALL return an appropriate message indicating no matches found
6. THE System SHALL implement pagination for search results with configurable page size

### Requirement 32: Reports and Analytics

**User Story:** As an Admin, I want to generate detailed reports, so that I can analyze trends and make data-driven decisions for society management.

#### Acceptance Criteria

1. WHEN an Admin generates a complaint report, THE System SHALL include total complaints, resolution rate, average resolution time, and category breakdown
2. WHEN an Admin generates a payment report, THE System SHALL include collection rate, outstanding amounts, and month-over-month trends
3. WHEN an Admin generates a staff performance report, THE System SHALL include assigned tasks, completion rate, and average resolution time per staff member
4. WHEN an Admin exports a report, THE System SHALL support PDF and CSV formats
5. WHEN a report is generated, THE System SHALL allow date range selection for the analysis period
6. THE System SHALL cache frequently accessed reports for improved performance

### Requirement 33: Multi-language Support

**User Story:** As a user, I want to use the application in my preferred language, so that I can interact with the system more comfortably.

#### Acceptance Criteria

1. WHEN a user selects a language preference, THE System SHALL store it in their user profile
2. WHEN a user logs in, THE System SHALL load the interface in their preferred language
3. WHEN a user changes language, THE System SHALL update all UI text immediately without requiring app restart
4. THE System SHALL support at least English and Hindi languages
5. WHEN notifications are sent, THE System SHALL use the recipient's preferred language
6. THE System SHALL provide translation files for all static text and error messages
