import cron from 'node-cron';
import Maintenance from '../models/Maintenance';
import User from '../models/User';
import { sendPushNotification } from '../utils/notificationSender';

/**
 * Maintenance Reminder Job
 * Runs every day at 10:00 AM
 */
export const initMaintenanceReminderJob = () => {
    // cron string: minute hour day-of-month month day-of-week
    cron.schedule('0 10 * * *', async () => {
        console.log('--- Starting Daily Maintenance Reminder Job ---');

        try {
            // Find all pending maintenance records
            const dueRecords = await Maintenance.findAll({
                where: { status: 'due' },
                include: [{
                    model: User,
                    as: 'resident', // Assuming the association alias is 'resident'
                    attributes: ['id', 'fullName', 'pushToken']
                }]
            });

            console.log(`Found ${dueRecords.length} pending maintenance records.`);

            for (const record of dueRecords) {
                const user = (record as any).resident;
                if (user && user.pushToken) {
                    await sendPushNotification(
                        user.id,
                        '💰 Maintenance Payment Due',
                        `Hi ${user.fullName}, your maintenance payment for ${record.month} ${record.year} is still pending. Please pay at your earliest convenience.`,
                        { screen: 'maintenance', id: record.id }
                    );
                }
            }

            console.log('--- Maintenance Reminder Job Completed ---');
        } catch (error) {
            console.error('Error in Maintenance Reminder Job:', error);
        }
    });
};
