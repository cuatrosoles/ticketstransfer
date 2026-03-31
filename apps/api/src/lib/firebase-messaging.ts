/**
 * Firebase Cloud Messaging - Notificaciones push.
 * Detecta tokens inválidos para eliminarlos de la base de datos.
 */

import { getMessaging } from './firebase-admin.js';
import type { Message } from 'firebase-admin/messaging';

const INVALID_TOKEN_CODES = [
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
];

export type SendPushResult = { success: boolean; tokenInvalid?: boolean };

export async function sendPushNotification(
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<SendPushResult> {
  if (!fcmToken || fcmToken.length < 10) return { success: false };
  try {
    const messaging = getMessaging();
    const dataPayload =
      data &&
      Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === undefined || v === null ? '' : String(v)])
      );
    const message: Message = {
      token: fcmToken,
      notification: { title, body },
      data: dataPayload || {},
      android: { priority: 'high' },
      apns: {
        headers: { 'apns-priority': '10' },
        payload: { aps: { sound: 'default', badge: 1 } },
      },
    };
    await messaging.send(message);
    return { success: true };
  } catch (e: unknown) {
    const code = (e as { errorInfo?: { code?: string } })?.errorInfo?.code;
    if (code && INVALID_TOKEN_CODES.includes(code)) {
      console.warn('Token FCM inválido (se eliminará del usuario):', code);
      return { success: false, tokenInvalid: true };
    }
    console.error('Error enviando push:', e);
    return { success: false };
  }
}
