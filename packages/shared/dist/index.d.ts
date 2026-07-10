/**
 * Paquete compartido – Tickets Transfer (TT)
 * Ubicación: packages/shared/src/index.ts
 */
export * from './constants.js';
export * from './types.js';
export * from './user-preferences.js';
export * from './event-images.js';
export * from './event-datetime.js';
export * from './event-location-display.js';
export * from './geo.js';
export * from './publish-stages.js';
export * from './notification-preferences.js';
/** Reexportación nominal (además de barrel) para que bundlers como esbuild vean todos los símbolos al resolver este entry. */
export { registerSchema, registerBodySchema, loginSchema, onboardingSchema, tasteOnboardingSchema, userPreferencesPatchSchema, listingInteractionSchema, listingVisibilitySchema, type ListingVisibility, createTicketListingSchema, updateTicketListingSchema, createOrderSchema, confirmReceivedSchema, openDisputeSchema, pixelateRegionSchema, pixelateRegionsSchema, notificationPreferencesPatchSchema, NOTIFICATION_PREFERENCE_KEYS, NOTIFICATION_PREFERENCE_LABELS, DEFAULT_NOTIFICATION_PREFERENCES, mergeNotificationPreferences, allowsPushType, pushTypeToPreferenceKey, type NotificationPreferenceKey, type NotificationPreferences, } from './schemas.js';
