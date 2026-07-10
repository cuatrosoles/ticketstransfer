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

export type SendPushBatchResult = {
  sent: number;
  failed: number;
  invalidTokens: string[];
};

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

function buildDataPayload(data?: Record<string, string>): Record<string, string> | undefined {
  if (!data) return undefined;
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === undefined || v === null ? '' : String(v)])
  );
}

function buildMessage(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Message {
  return {
    token,
    notification: { title, body },
    data: buildDataPayload(data) || {},
    android: { priority: 'high' },
    apns: {
      headers: { 'apns-priority': '10' },
      payload: { aps: { sound: 'default', badge: 1 } },
    },
  };
}

/** Envía varias notificaciones en lote (chunks de 500). */
export async function sendPushBatch(
  items: Array<{ token: string; title: string; body: string; data?: Record<string, string> }>
): Promise<SendPushBatchResult> {
  if (!items.length) return { sent: 0, failed: 0, invalidTokens: [] };
  const messaging = getMessaging();
  const invalidTokens: string[] = [];
  let sent = 0;
  let failed = 0;
  const chunkSize = 500;

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const messages = chunk.map((item) => buildMessage(item.token, item.title, item.body, item.data));
    const response = await messaging.sendEach(messages);
    sent += response.successCount;
    failed += response.failureCount;
    response.responses.forEach((result, index) => {
      if (result.success) return;
      const code = result.error?.code;
      if (code && INVALID_TOKEN_CODES.includes(code)) {
        invalidTokens.push(chunk[index].token);
      }
    });
  }

  return { sent, failed, invalidTokens };
}
