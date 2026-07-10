/**
 * Preferencias de notificaciones push por categoría (opt-out por defecto).
 */
import { z } from 'zod';
export declare const NOTIFICATION_PREFERENCE_KEYS: readonly ["transactions", "messages", "nearbyEvents", "recommendations", "promotions"];
export type NotificationPreferenceKey = (typeof NOTIFICATION_PREFERENCE_KEYS)[number];
export type NotificationPreferences = Record<NotificationPreferenceKey, boolean>;
export declare const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences;
export declare const NOTIFICATION_PREFERENCE_LABELS: Record<NotificationPreferenceKey, {
    title: string;
    description: string;
}>;
export declare const notificationPreferencesPatchSchema: z.ZodEffects<z.ZodObject<{
    transactions: z.ZodOptional<z.ZodBoolean>;
    messages: z.ZodOptional<z.ZodBoolean>;
    nearbyEvents: z.ZodOptional<z.ZodBoolean>;
    recommendations: z.ZodOptional<z.ZodBoolean>;
    promotions: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    transactions?: boolean | undefined;
    messages?: boolean | undefined;
    nearbyEvents?: boolean | undefined;
    recommendations?: boolean | undefined;
    promotions?: boolean | undefined;
}, {
    transactions?: boolean | undefined;
    messages?: boolean | undefined;
    nearbyEvents?: boolean | undefined;
    recommendations?: boolean | undefined;
    promotions?: boolean | undefined;
}>, {
    transactions?: boolean | undefined;
    messages?: boolean | undefined;
    nearbyEvents?: boolean | undefined;
    recommendations?: boolean | undefined;
    promotions?: boolean | undefined;
}, {
    transactions?: boolean | undefined;
    messages?: boolean | undefined;
    nearbyEvents?: boolean | undefined;
    recommendations?: boolean | undefined;
    promotions?: boolean | undefined;
}>;
export declare function mergeNotificationPreferences(raw?: Partial<NotificationPreferences> | Record<string, unknown> | null): NotificationPreferences;
export declare function pushTypeToPreferenceKey(type: string): NotificationPreferenceKey | null;
export declare function allowsPushType(preferences: NotificationPreferences, type: string | undefined): boolean;
