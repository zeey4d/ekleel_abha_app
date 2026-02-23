import { useEffect, useRef, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { useAppDispatch } from '@/store/hooks';
import {
  registerForPushNotificationsAsync,
  mapPushPayloadToNotification,
} from './notificationsPushService';
import { injectPushNotification } from './notificationsSlice';
import type { PushNotificationPayload, GetNotificationsParams } from '@/store/types';

// Configure foreground notification behavior (do once at module level)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface UseNotificationsBootstrapOptions {
  queryParams?: GetNotificationsParams;
  enabled?: boolean;
}

interface UseNotificationsBootstrapReturn {
  expoPushToken: string | null;
}

export function useNotificationsBootstrap(
  options: UseNotificationsBootstrapOptions = {}
): UseNotificationsBootstrapReturn {
  const {
    queryParams = { page: 1, limit: 15 },
    enabled = true,
  } = options;

  const dispatch = useAppDispatch();
  const tokenRef = useRef<string | null>(null);
  const bootstrappedRef = useRef(false);
  const listenerRef = useRef<Notifications.EventSubscription | null>(null);

  const handleNotification = useCallback(
    (event: Notifications.Notification) => {
      const payload = event.request.content.data as PushNotificationPayload | undefined;
      
      // If payload is empty, we might still want to show it, but for now we focus on data injection
      // We can construct a notification even without data if title/body exists
      const notification = mapPushPayloadToNotification(
        payload || {
          id: event.request.identifier,
          title: event.request.content.title || 'New Notification',
          message: event.request.content.body || '',
          type: 'general',
        }
      );
      
      injectPushNotification(dispatch, notification, queryParams);
    },
    [dispatch, queryParams]
  );

  useEffect(() => {
    if (!enabled || bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    // Register push token
    registerForPushNotificationsAsync().then((token) => {
      tokenRef.current = token;
      if (token) {
        console.log('Expo Push Token:', token);
        // TODO: This is where you would send the token to your backend
      }
    });

    // Listen for incoming notifications
    listenerRef.current = Notifications.addNotificationReceivedListener(
      handleNotification
    );

    return () => {
      listenerRef.current?.remove();
      bootstrappedRef.current = false;
    };
  }, [enabled, handleNotification]);

  return { expoPushToken: tokenRef.current };
}
