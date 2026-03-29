/**
 * Notificaciones push con Firebase Cloud Messaging.
 * Requiere @react-native-firebase/app y @react-native-firebase/messaging.
 */

import { Platform, PermissionsAndroid } from 'react-native';
import messaging from '@react-native-firebase/messaging';

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notificaciones',
            message: 'Tickets Transfer necesita notificaciones para avisarte de nuevos mensajes.',
            buttonPositive: 'Aceptar',
            buttonNegative: 'Cancelar',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return false;
      }
      await messaging().requestPermission();
      return true;
    }
    const authStatus = await messaging().requestPermission();
    return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  } catch {
    return false;
  }
}

export async function getFcmToken(): Promise<string | null> {
  try {
    return await messaging().getToken();
  } catch {
    return null;
  }
}

function stringifyData(data: Record<string, string | object> | undefined): Record<string, string> | undefined {
  if (!data) return undefined;
  return Object.fromEntries(Object.entries(data).map(([k, v]) => [k, typeof v === 'string' ? v : String(v ?? '')]));
}

export function onMessage(
  callback: (remoteMessage: { notification?: { title?: string; body?: string }; data?: Record<string, string> }) => void
) {
  return messaging().onMessage((msg) => {
    callback({
      notification: msg.notification,
      data: stringifyData(msg.data as Record<string, string | object> | undefined),
    });
  });
}

export function onNotificationOpenedApp(callback: (remoteMessage: { data?: Record<string, string> }) => void) {
  return messaging().onNotificationOpenedApp((msg) => {
    callback({ data: stringifyData(msg.data as Record<string, string | object> | undefined) });
  });
}

/** Notificación que abrió la app desde cerrada (para deep link al chat). */
export function getInitialNotification() {
  return messaging().getInitialNotification();
}
