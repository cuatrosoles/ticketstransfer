/**
 * Preferencias de notificaciones push por categoría (opt-out por defecto).
 */

import { z } from 'zod';

export const NOTIFICATION_PREFERENCE_KEYS = [
  'transactions',
  'messages',
  'nearbyEvents',
  'recommendations',
  'promotions',
] as const;

export type NotificationPreferenceKey = (typeof NOTIFICATION_PREFERENCE_KEYS)[number];

export type NotificationPreferences = Record<NotificationPreferenceKey, boolean>;

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  transactions: true,
  messages: true,
  nearbyEvents: true,
  recommendations: true,
  promotions: true,
};

export const NOTIFICATION_PREFERENCE_LABELS: Record<
  NotificationPreferenceKey,
  { title: string; description: string }
> = {
  transactions: {
    title: 'Ventas, compras y reembolsos',
    description: 'Avisos cuando vendés, comprás o se reembolsa una entrada.',
  },
  messages: {
    title: 'Mensajes de chat',
    description: 'Nuevos mensajes de compradores o vendedores.',
  },
  nearbyEvents: {
    title: 'Eventos cerca de ti',
    description: 'Entradas y eventos en tu zona según tu ubicación.',
  },
  recommendations: {
    title: 'Recomendados para vos',
    description: 'Sugerencias según tus gustos y actividad.',
  },
  promotions: {
    title: 'Promociones y novedades',
    description: 'Avisos generales y campañas de Tickets Transfer.',
  },
};

export const notificationPreferencesPatchSchema = z
  .object({
    transactions: z.boolean().optional(),
    messages: z.boolean().optional(),
    nearbyEvents: z.boolean().optional(),
    recommendations: z.boolean().optional(),
    promotions: z.boolean().optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: 'Indicá al menos una preferencia',
  });

export function mergeNotificationPreferences(
  raw?: Partial<NotificationPreferences> | Record<string, unknown> | null
): NotificationPreferences {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  const out = { ...DEFAULT_NOTIFICATION_PREFERENCES };
  for (const key of NOTIFICATION_PREFERENCE_KEYS) {
    if (typeof raw[key] === 'boolean') out[key] = raw[key];
  }
  return out;
}

export function pushTypeToPreferenceKey(type: string): NotificationPreferenceKey | null {
  switch (type) {
    case 'order_payment':
    case 'order_refund':
    case 'order_delivery':
      return 'transactions';
    case 'new_message':
      return 'messages';
    case 'nearby_events':
      return 'nearbyEvents';
    case 'recommendation':
      return 'recommendations';
    case 'admin_broadcast':
    case 'admin_test':
      return 'promotions';
    default:
      return null;
  }
}

export function allowsPushType(
  preferences: NotificationPreferences,
  type: string | undefined
): boolean {
  if (!type) return true;
  const key = pushTypeToPreferenceKey(type);
  if (!key) return true;
  return preferences[key];
}
