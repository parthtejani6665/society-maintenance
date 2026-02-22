import { Platform } from 'react-native';
import Constants from 'expo-constants';

export interface NowBarService {
  startComplaintTracking: (complaintId: string, status: string) => Promise<boolean>;
  stopComplaintTracking: () => Promise<boolean>;
  updateComplaintStatus: (status: string) => Promise<boolean>;
  isTrackingActive: () => Promise<boolean>;
}

// Internal state to track active notification
let currentNotificationId: string | null = null;
let Notifications: any = null;

const isExpoGo = () => {
  return Constants.appOwnership === 'expo';
};

const getNotificationsModule = () => {
  if (isExpoGo()) return null;
  if (!Notifications) {
    try {
      Notifications = require('expo-notifications');
    } catch (error) {
      console.warn('Failed to load expo-notifications:', error);
      return null;
    }
  }
  return Notifications;
};

// Configure channel for high priority (required for "Now Bar" / Heads-up behavior)
const configureChannel = async () => {
  if (Platform.OS === 'android' && !isExpoGo()) {
    const _Notifications = getNotificationsModule();
    if (_Notifications) {
      await _Notifications.setNotificationChannelAsync('now_bar_activity', {
        name: 'Complaint Tracking',
        importance: _Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        lockscreenVisibility: _Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
      });
    }
  }
};

/**
 * Now Bar Service (implemented via Expo Notifications)
 * 
 * Simulates Samsung's Now Bar activity using high-priority, ongoing notifications.
 */
export const nowBarService: NowBarService = {
  startComplaintTracking: async (complaintId: string, status: string): Promise<boolean> => {
    if (Platform.OS !== 'android' || isExpoGo()) {
      if (isExpoGo()) console.log('Now Bar: Skipped in Expo Go');
      return false;
    }

    const _Notifications = getNotificationsModule();
    if (!_Notifications) return false;

    try {
      await configureChannel();

      // Cancel any existing notification first
      if (currentNotificationId) {
        await _Notifications.dismissNotificationAsync(currentNotificationId);
      }

      // Schedule a new sticky notification
      currentNotificationId = await _Notifications.scheduleNotificationAsync({
        content: {
          title: `Complaint #${complaintId}`,
          body: `Status: ${status}`,
          data: { complaintId },
          sticky: true, // Key for "Running" / "Now Bar" feel
          priority: _Notifications.AndroidNotificationPriority.MAX,
          color: '#1e3a8a',
          autoDismiss: false,
        },
        trigger: null, // Show immediately
      });

      console.log(`✅ Now Bar (Persistent Notification) started for complaint #${complaintId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to start Now Bar tracking:', error);
      return false;
    }
  },

  stopComplaintTracking: async (): Promise<boolean> => {
    if (!currentNotificationId) return false;
    const _Notifications = getNotificationsModule();
    if (!_Notifications) return false;

    try {
      await _Notifications.dismissNotificationAsync(currentNotificationId);
      currentNotificationId = null;
      console.log('✅ Now Bar tracking stopped');
      return true;
    } catch (error) {
      console.error('❌ Failed to stop Now Bar tracking:', error);
      return false;
    }
  },

  updateComplaintStatus: async (status: string): Promise<boolean> => {
    if (!currentNotificationId) return false;
    const _Notifications = getNotificationsModule();
    if (!_Notifications) return false;

    try {
      // Expo Notifications doesn't support updating "in-place" perfectly without ID knowledge implies canceling and re-showing
      // typically on Android `notify` with same ID updates it.
      // Expo's scheduleNotificationAsync *returns* an ID, but re-using it with same trigger might not update content directly.
      // Best approach for Expo: Dismiss and Re-emit, or just emit new one implies stack?
      // "presentNotificationAsync" is deprecated. 
      // We'll simplisticly stop and start (or just emit new with same ID tag if we could, but expo gen IDs).

      // To update, we basically re-issue. 
      // NOTE: In native, we'd use the same notification ID. 
      // Here, we dismiss and show new immediately.

      await _Notifications.dismissNotificationAsync(currentNotificationId);

      currentNotificationId = await _Notifications.scheduleNotificationAsync({
        content: {
          title: `Complaint Update`, // Or keep ID
          body: `New Status: ${status}`,
          sticky: true,
          priority: _Notifications.AndroidNotificationPriority.MAX,
          color: '#1e3a8a',
          autoDismiss: false,
        },
        trigger: null,
      });

      console.log(`✅ Now Bar status updated to: ${status}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to update Now Bar status:', error);
      return false;
    }
  },

  isTrackingActive: async (): Promise<boolean> => {
    return !!currentNotificationId;
  },
};

export const autoManageNowBar = async (complaint: { id: string; status: string }) => {
  // Basic gate check for Expo Go to avoid even calling the service
  if (isExpoGo()) return;

  const statusesToTrack = ['in_progress', 'assigned'];
  const statusesToStop = ['resolved', 'rejected', 'cancelled'];

  if (statusesToTrack.includes(complaint.status.toLowerCase())) {
    await nowBarService.startComplaintTracking(
      complaint.id,
      complaint.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
  } else if (statusesToStop.includes(complaint.status.toLowerCase())) {
    await nowBarService.stopComplaintTracking();
  }
};
