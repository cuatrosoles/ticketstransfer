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

export function onMessage(callback: (remoteMessage: { notification?: { title?: string; body?: string }; data?: Record<string, string> }) => void) {
  return messaging().onMessage(callback);
}

export function onNotificationOpenedApp(callback: (remoteMessage: { data?: Record<string, string> }) => void) {
  return messaging().onNotificationOpenedApp(callback);
}
