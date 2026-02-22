/**
 * Now Bar Integration Example
 * 
 * This file shows how to integrate Samsung Now Bar into your complaint screens
 */

import React, { useEffect } from 'react';
import { nowBarService, autoManageNowBar } from './services/nowBarService';

// ============================================
// EXAMPLE 1: Complaint Detail Screen
// ============================================

export function ComplaintDetailScreen({ complaint }) {
  // Automatically manage Now Bar based on complaint status
  useEffect(() => {
    autoManageNowBar(complaint);
  }, [complaint.status]);

  return (
    <View>
      {/* Your existing UI */}
    </View>
  );
}

// ============================================
// EXAMPLE 2: Manual Control with Buttons
// ============================================

export function ComplaintDetailWithButtons({ complaint }) {
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    checkTrackingStatus();
  }, []);

  const checkTrackingStatus = async () => {
    const active = await nowBarService.isTrackingActive();
    setIsTracking(active);
  };

  const handleStartTracking = async () => {
    const success = await nowBarService.startComplaintTracking(
      complaint.id,
      'In Progress'
    );
    if (success) {
      setIsTracking(true);
      Alert.alert('Success', 'Now showing in Now Bar');
    }
  };

  const handleStopTracking = async () => {
    const success = await nowBarService.stopComplaintTracking();
    if (success) {
      setIsTracking(false);
      Alert.alert('Success', 'Removed from Now Bar');
    }
  };

  return (
    <View>
      {/* Your existing UI */}
      
      {/* Now Bar Controls */}
      <View style={{ padding: 16 }}>
        {isTracking ? (
          <TouchableOpacity
            onPress={handleStopTracking}
            style={{
              backgroundColor: '#DC2626',
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              🔧 Tracking in Now Bar - Tap to Stop
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleStartTracking}
            style={{
              backgroundColor: '#2563EB',
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              Track in Now Bar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ============================================
// EXAMPLE 3: Status Change Handler
// ============================================

export function useComplaintStatusHandler(complaint) {
  useEffect(() => {
    handleStatusChange(complaint.status);
  }, [complaint.status]);

  const handleStatusChange = async (status: string) => {
    switch (status.toLowerCase()) {
      case 'in_progress':
      case 'assigned':
        // Start tracking
        await nowBarService.startComplaintTracking(
          complaint.id,
          status.replace('_', ' ').toUpperCase()
        );
        break;

      case 'resolved':
      case 'rejected':
      case 'cancelled':
        // Stop tracking
        await nowBarService.stopComplaintTracking();
        break;

      default:
        // Update status if already tracking
        const isActive = await nowBarService.isTrackingActive();
        if (isActive) {
          await nowBarService.updateComplaintStatus(status);
        }
    }
  };
}

// ============================================
// EXAMPLE 4: Dashboard Integration
// ============================================

export function DashboardWithNowBar() {
  const [trackedComplaint, setTrackedComplaint] = useState<string | null>(null);

  useEffect(() => {
    checkTrackedComplaint();
  }, []);

  const checkTrackedComplaint = async () => {
    const isActive = await nowBarService.isTrackingActive();
    if (isActive) {
      // Get complaint ID from SharedPreferences
      // You can add a method to NowBarModule to get current complaint ID
      setTrackedComplaint('123'); // Example
    }
  };

  return (
    <View>
      {/* Show Now Bar status in dashboard */}
      {trackedComplaint && (
        <View
          style={{
            backgroundColor: '#FEE2E2',
            padding: 12,
            borderRadius: 12,
            margin: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 20, marginRight: 8 }}>🔧</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold', color: '#DC2626' }}>
              Tracking in Now Bar
            </Text>
            <Text style={{ fontSize: 12, color: '#991B1B' }}>
              Complaint #{trackedComplaint}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push(`/complaints/${trackedComplaint}`)}
          >
            <ChevronRight size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>
      )}

      {/* Rest of dashboard */}
    </View>
  );
}

// ============================================
// EXAMPLE 5: Complete Integration
// ============================================

/**
 * Add this to your complaint detail screen:
 * mobile/app/complaints/[id].tsx
 */

// At the top of the file, add import:
// import { nowBarService } from '../../services/nowBarService';

// Inside your component, add this useEffect:
/*
useEffect(() => {
  if (!complaint) return;

  // Auto-manage Now Bar
  const statusesToTrack = ['in_progress', 'assigned'];
  const statusesToStop = ['resolved', 'rejected', 'cancelled'];

  if (statusesToTrack.includes(complaint.status.toLowerCase())) {
    nowBarService.startComplaintTracking(
      complaint.id,
      complaint.status.replace('_', ' ').toUpperCase()
    );
  } else if (statusesToStop.includes(complaint.status.toLowerCase())) {
    nowBarService.stopComplaintTracking();
  }
}, [complaint?.status]);
*/

// ============================================
// EXAMPLE 6: Error Handling
// ============================================

export function ComplaintDetailWithErrorHandling({ complaint }) {
  const handleNowBarAction = async (action: 'start' | 'stop') => {
    try {
      if (action === 'start') {
        const success = await nowBarService.startComplaintTracking(
          complaint.id,
          'In Progress'
        );
        
        if (!success) {
          Alert.alert(
            'Now Bar Not Available',
            'This feature requires Samsung One UI 8+ and Android 8.0+',
            [{ text: 'OK' }]
          );
        }
      } else {
        await nowBarService.stopComplaintTracking();
      }
    } catch (error) {
      console.error('Now Bar error:', error);
      Alert.alert(
        'Error',
        'Failed to update Now Bar. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View>
      {/* Your UI */}
    </View>
  );
}

// ============================================
// QUICK START GUIDE
// ============================================

/**
 * STEP 1: Build the app
 * cd mobile/android
 * ./gradlew assembleDebug
 * 
 * STEP 2: Install on Samsung device
 * adb install app/build/outputs/apk/debug/app-debug.apk
 * 
 * STEP 3: Add widget to lock screen
 * - Long press on lock screen
 * - Tap "Add widget"
 * - Find "Complaint Tracker"
 * - Drag to Now Bar area
 * 
 * STEP 4: Test in your app
 * - Open a complaint
 * - Change status to "In Progress"
 * - Lock your phone
 * - Check Now Bar - you should see: 🔧 Complaint #123 - In Progress | 0m
 * 
 * STEP 5: Verify updates
 * - Wait 1 minute
 * - Check Now Bar again
 * - Duration should update to 1m
 * 
 * STEP 6: Test stop
 * - Change complaint status to "Resolved"
 * - Lock your phone
 * - Now Bar widget should disappear
 */
