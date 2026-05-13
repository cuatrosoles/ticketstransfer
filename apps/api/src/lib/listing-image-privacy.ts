/**
 * Las URLs de capturas originales no deben exponerse a compradores ni en respuestas embebidas de órdenes/disputas.
 * El vendedor las obtiene por GET /api/tickets/mine/:id; el administrador por rutas admin.
 */

export function stripOriginalListingImageUrls<T extends Record<string, unknown>>(
  listing: T | null | undefined
): T | null | undefined {
  if (listing == null || typeof listing !== 'object') return listing;
  const out = { ...listing } as Record<string, unknown>;
  delete out.captureTicketOriginalUrl;
  delete out.captureOwnershipOriginalUrl;
  return out as T;
}
