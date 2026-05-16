/**
 * Construye un ítem de catálogo público a partir del detalle de compra (para favoritos / caché).
 */

import type { MarketplacePublicItem } from './api';

type SellerLike = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  reputationScore?: number | null;
} | null;

export function ticketPreviewToMarketplaceItem(p: {
  id: string;
  eventName: string;
  eventDate: string;
  eventPlace?: string | null;
  quantityEntries?: string | null;
  price?: number;
  seller?: SellerLike;
}): MarketplacePublicItem {
  const seller = p.seller;
  const displayName =
    seller &&
    ([seller.firstName, seller.lastName].filter(Boolean).join(' ') || seller.username || 'Vendedor');
  return {
    id: p.id,
    eventName: p.eventName,
    eventDate: p.eventDate,
    eventPlace: p.eventPlace ?? null,
    quantityEntries: p.quantityEntries ?? null,
    price: p.price ?? null,
    seller: {
      id: seller?.id ?? 'unknown',
      displayName: displayName || 'Vendedor',
      reputationScore: seller?.reputationScore ?? 0,
    },
  };
}
