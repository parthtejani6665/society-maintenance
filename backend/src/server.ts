import app from './app';
// import { User, Complaint, Maintenance, Notification } from './models'; // Import models to ensure they are registered
import sequelize from './config/database'; // Import sequelize instance
import './models'; // Import models to initialize them

import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');

        // Sync all models
        // Force: true drops tables if they exist (USE ONLY FOR DEV INITIALIZATION)
        // Alter: true checks what is the current state of the table in the database (which columns it has, what are their data types, etc), and then performs the necessary changes in the table to make it match the model.
        await sequelize.sync({ alter: true });
        console.log('Database synced.');

        // Initialize all background jobs
        const { initJobs } = require('./jobs');
        initJobs();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

startServer();
