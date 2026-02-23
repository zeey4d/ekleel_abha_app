import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import type { Notification, PushNotificationPayload } from '@/store/types';

/**
 * Registers the device for push notifications.
 * Requests permissions if not already granted.
 * @returns {Promise<string | null>} The Expo push token or null if failed/not a physical device.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      // projectId: Constants.expoConfig?.extra?.eas?.projectId, // Optional: if using EAS
    });
    return tokenData.data;
  } catch (error) {
    console.error('Error fetching push token:', error);
    return null;
  }
}

/**
 * Maps an incoming push payload to the internal Notification entity.
 * Handles missing IDs by generating temporary ones (though backend should provide IDs).
 */
export function mapPushPayloadToNotification(
  payload: PushNotificationPayload
): Notification {
  // Ensure we have a valid ID. If the push payload doesn't have one, generate a temp one.
  // Ideally, the backend sends the real ID so it matches what's on the server.
  const id = payload.id ?? `push_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  return {
    id: id,
    title: payload.title || 'New Notification',
    message: payload.message || '',
    type: payload.type || 'general',
    data: payload.data || {},
    read: false, // Push notifications are unread by default
    date_added: new Date().toISOString(),
    date_read: null,
  };
}
