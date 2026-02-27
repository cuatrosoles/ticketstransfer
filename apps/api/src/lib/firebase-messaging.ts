/**
 * Firebase Cloud Messaging - Notificaciones push.
 */

import { getMessaging } from './firebase-admin.js';
import type { Message } from 'firebase-admin/messaging';

export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> {
  if (!fcmToken || fcmToken.length < 10) return false;
  try {
    const messaging = getMessaging();
    const message: Message = {
      token: fcmToken,
      notification: { title, body },
      data: data || {},
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    };
    await messaging.send(message);
    return true;
  } catch (e) {
    console.error('Error enviando push:', e);
    return false;
  }
}
