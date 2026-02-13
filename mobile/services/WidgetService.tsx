import { requestWidgetUpdate } from 'react-native-android-widget';
import { MaintenanceSmallWidget } from '../components/MaintenanceSmallWidget';
import { MaintenanceMediumWidget } from '../components/MaintenanceMediumWidget';
import { MaintenanceLargeWidget } from '../components/MaintenanceLargeWidget';
import { noticeService } from './noticeService';
import { maintenanceService } from './maintenanceService';

export const WidgetService = {
    // Legacy single widget update removed. Now using fetchAndPushWidgetData to handle all variants.

    getMaintenanceWidgetData: async () => {
        try {
            // Fetch maintenance records
            const maintenanceRecords = await maintenanceService.fetchMaintenanceRecords();

            // Calculate Stats
            const dueRecords = maintenanceRecords.filter((r: any) => r.status === 'due');
            const totalDue = dueRecords.reduce((sum: number, r: any) => sum + parseFloat(r.amount), 0);

            // Get latest month/year from the first due record, or just current date if none
            const latestRecord = maintenanceRecords.length > 0 ? maintenanceRecords[0] : null;
            const monthDisplay = latestRecord ? `${latestRecord.month} ${latestRecord.year}` : 'Current';
            const dueDate = latestRecord?.dueDate ? new Date(latestRecord.dueDate).toLocaleDateString() : 'End of Month';

            // Find last payment
            const paidRecords = maintenanceRecords.filter((r: any) => r.status === 'paid');
            const lastPaidRecord = paidRecords.length > 0 ? paidRecords[0] : null;

            // Common Data
            const status = totalDue > 0 ? (totalDue > 5000 ? 'overdue' : 'due') : 'paid';
            const amountDisplay = `₹ ${totalDue}`;
            const collectionProgress = 78; // Mocked society progress

            return {
                month: monthDisplay,
                amount: amountDisplay,
                dueDate: dueDate,
                status: status as 'paid' | 'due' | 'overdue',
                collectionProgress,
                lastPaymentDate: lastPaidRecord?.paidAt ? new Date(lastPaidRecord.paidAt).toLocaleDateString() : undefined,
                lastPaymentAmount: lastPaidRecord ? `₹ ${lastPaidRecord.amount}` : undefined,
            };
        } catch (error) {
            console.error('Failed to get widget data:', error);
            // Return default data to prevent crashes
            return {
                month: 'Current',
                amount: '₹ 0',
                dueDate: '--',
                status: 'due' as 'paid' | 'due' | 'overdue',
                collectionProgress: 0,
            };
        }
    },

    fetchAndPushWidgetData: async () => {
        try {
            const data = await WidgetService.getMaintenanceWidgetData();

            // 1. Update Small Widget
            await requestWidgetUpdate({
                widgetName: 'MaintenanceSmall',
                renderWidget: () => (
                    <MaintenanceSmallWidget
                        month={data.month}
                        amount={data.amount}
                        status={data.status}
                    />
                ),
                widgetNotFound: () => { }
            });

            // 2. Update Medium Widget
            await requestWidgetUpdate({
                widgetName: 'MaintenanceMedium',
                renderWidget: () => (
                    <MaintenanceMediumWidget
                        month={data.month}
                        amount={data.amount}
                        dueDate={data.dueDate}
                        status={data.status}
                        collectionProgress={data.collectionProgress}
                    />
                ),
                widgetNotFound: () => { }
            });

            // 3. Update Large Widget
            await requestWidgetUpdate({
                widgetName: 'MaintenanceLarge',
                renderWidget: () => (
                    <MaintenanceLargeWidget
                        month={data.month}
                        amount={data.amount}
                        dueDate={data.dueDate}
                        status={data.status}
                        collectionProgress={data.collectionProgress}
                        lastPaymentDate={data.lastPaymentDate}
                        lastPaymentAmount={data.lastPaymentAmount}
                    />
                ),
                widgetNotFound: () => { }
            });

            console.log('Widgets updated with data:', { totalDue: data.amount, status: data.status });
        } catch (error) {
            console.error('Failed to fetch and push widget data:', error);
        }
    }
};
