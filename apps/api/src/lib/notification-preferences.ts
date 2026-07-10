/**
 * Lectura de preferencias push desde documento de usuario.
 */

import {
  mergeNotificationPreferences,
  allowsPushType,
  type NotificationPreferences,
} from '@tickets-transfer/shared';

export { mergeNotificationPreferences, allowsPushType };
export type { NotificationPreferences };

export function notificationPreferencesFromUserData(
  data: Record<string, unknown> | undefined | null
): NotificationPreferences {
  const raw = data?.notificationPreferences;
  return mergeNotificationPreferences(
    raw && typeof raw === 'object' ? (raw as Partial<NotificationPreferences>) : null
  );
}
