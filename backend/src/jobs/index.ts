import { initMaintenanceReminderJob } from './maintenance.job';

/**
 * Initializes all background cron jobs
 */
export const initJobs = () => {
    console.log('--- Initializing Backend Schedulers ---');

    initMaintenanceReminderJob();

    // Add other jobs here as they are created
};
