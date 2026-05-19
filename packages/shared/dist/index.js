/**
 * Paquete compartido – Tickets Transfer (TT)
 * Ubicación: packages/shared/src/index.ts
 */
export * from './constants.js';
export * from './types.js';
export * from './event-images.js';
/** Reexportación nominal (además de barrel) para que bundlers como esbuild vean todos los símbolos al resolver este entry. */
export { registerSchema, registerBodySchema, loginSchema, onboardingSchema, listingVisibilitySchema, createTicketListingSchema, updateTicketListingSchema, createOrderSchema, confirmReceivedSchema, openDisputeSchema, pixelateRegionSchema, pixelateRegionsSchema, } from './schemas.js';
