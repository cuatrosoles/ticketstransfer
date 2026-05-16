/**
 * Favoritos de publicaciones del marketplace – persistencia local por usuario (AsyncStorage).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MarketplacePublicItem } from './api';

export type FavoriteListingEntry = {
  listingId: string;
  savedAt: number;
  cached: MarketplacePublicItem;
};

const MAX_ENTRIES = 200;

const storageKey = (userId: string) => `tt:v1:marketplace-favorites:${userId}`;

function isMarketplacePublicItem(x: unknown): x is MarketplacePublicItem {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  const seller = o.seller;
  if (!seller || typeof seller !== 'object') return false;
  const s = seller as Record<string, unknown>;
  const repRaw = s.reputationScore;
  const rep =
    typeof repRaw === 'number'
      ? repRaw
      : typeof repRaw === 'string'
        ? Number(repRaw.replace(',', '.'))
        : 0;
  return (
    typeof o.id === 'string' &&
    typeof o.eventName === 'string' &&
    typeof o.eventDate === 'string' &&
    typeof s.id === 'string' &&
    typeof s.displayName === 'string' &&
    !Number.isNaN(rep)
  );
}

function isEntry(x: unknown): x is FavoriteListingEntry {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.listingId === 'string' &&
    typeof o.savedAt === 'number' &&
    isMarketplacePublicItem(o.cached) &&
    o.cached.id === o.listingId
  );
}

function dedupeByListing(entries: FavoriteListingEntry[]): FavoriteListingEntry[] {
  const m = new Map<string, FavoriteListingEntry>();
  for (const e of entries) {
    const cur = m.get(e.listingId);
    if (!cur || e.savedAt >= cur.savedAt) m.set(e.listingId, e);
  }
  return Array.from(m.values()).sort((a, b) => b.savedAt - a.savedAt);
}

function sanitizeMarketplaceItem(c: MarketplacePublicItem): MarketplacePublicItem {
  const raw = c.price;
  let num =
    raw === null || raw === undefined
      ? NaN
      : typeof raw === 'number'
        ? raw
        : typeof raw === 'string'
          ? Number(raw.replace(/\./g, '').replace(',', '.'))
          : Number(raw);
  const price = !Number.isNaN(num) ? num : null;
  return {
    ...c,
    price,
    seller: {
      ...c.seller,
      reputationScore: Number(c.seller.reputationScore) || 0,
    },
  };
}

export async function readFavoriteListings(userId: string): Promise<FavoriteListingEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const list = parsed.filter(isEntry).map((e) => ({ ...e, cached: sanitizeMarketplaceItem(e.cached) }));
    return dedupeByListing(list).slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
}

export async function writeFavoriteListings(userId: string, entries: FavoriteListingEntry[]): Promise<void> {
  const next = dedupeByListing(entries).slice(0, MAX_ENTRIES);
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(next));
}
