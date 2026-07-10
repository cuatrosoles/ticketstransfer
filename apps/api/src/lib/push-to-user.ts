/**
 * Envío de push a un usuario con limpieza de token inválido.
 */

import { FieldValue } from 'firebase-admin/firestore';
import { db, COLLECTIONS } from './firestore.js';
import { sendPushNotification } from './firebase-messaging.js';
import {
  allowsPushType,
  mergeNotificationPreferences,
  type NotificationPreferences,
} from './notification-preferences.js';

export async function sendPushToUser(
  userId: string,
  fcmToken: string | undefined,
  title: string,
  body: string,
  data: Record<string, string>,
  preferences?: Partial<NotificationPreferences> | null
): Promise<void> {
  if (!fcmToken) return;
  const prefs = mergeNotificationPreferences(preferences);
  if (!allowsPushType(prefs, data.type)) return;
  const result = await sendPushNotification(fcmToken, title, body, data);
  if (result.tokenInvalid) {
    await db().collection(COLLECTIONS.USERS).doc(userId).update({
      fcmToken: FieldValue.delete(),
      updatedAt: new Date(),
    });
  }
}
