/**
 * Favoritos del marketplace – estado + AsyncStorage por usuario autenticado.
 */

import * as React from 'react';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import type { MarketplacePublicItem } from '../lib/api';
import { getMarketplaceStoreListings, recordListingInteraction } from '../lib/api';
import {
  readFavoriteListings,
  writeFavoriteListings,
  type FavoriteListingEntry,
} from '../lib/marketplaceFavoriteStorage';

function listingDisplayChanged(prev: MarketplacePublicItem, next: MarketplacePublicItem): boolean {
  return (
    prev.eventName !== next.eventName ||
    prev.eventDate !== next.eventDate ||
    (prev.price ?? null) !== (next.price ?? null) ||
    (prev.eventPlace ?? '') !== (next.eventPlace ?? '') ||
    prev.quantityEntries !== next.quantityEntries ||
    prev.seller.displayName !== next.seller.displayName ||
    prev.seller.reputationScore !== next.seller.reputationScore
  );
}

type FavoritesContextValue = {
  ready: boolean;
  entries: FavoriteListingEntry[];
  isFavorite: (listingId: string) => boolean;
  toggleFavorite: (item: MarketplacePublicItem) => void;
  removeFavorite: (listingId: string) => void;
  /** Actualiza cachés con datos del listado público de tienda cuando el ID coincide */
  syncFavoritesWithMarketplace: () => Promise<void>;
};

const FavoritesContext = React.createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<FavoriteListingEntry[]>([]);
  const [ready, setReady] = useState(true);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setReady(true);
      return;
    }
    let cancelled = false;
    setReady(false);
    readFavoriteListings(user.id)
      .then((list) => {
        if (!cancelled) setEntries(list);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const isFavorite = useCallback(
    (listingId: string) => entries.some((e) => e.listingId === listingId),
    [entries]
  );

  const toggleFavorite = useCallback(
    (item: MarketplacePublicItem) => {
      if (!user) return;
      setEntries((prev) => {
        const exists = prev.some((e) => e.listingId === item.id);
        let next: FavoriteListingEntry[];
        if (exists) {
          next = prev.filter((e) => e.listingId !== item.id);
          void recordListingInteraction(item.id, 'FAVORITE_REMOVE', item.category).catch(() => {});
        } else {
          next = [
            { listingId: item.id, savedAt: Date.now(), cached: item },
            ...prev.filter((e) => e.listingId !== item.id),
          ];
          void recordListingInteraction(item.id, 'FAVORITE_ADD', item.category).catch(() => {});
        }
        void writeFavoriteListings(user.id, next);
        return next;
      });
    },
    [user]
  );

  const removeFavorite = useCallback(
    (listingId: string) => {
      if (!user) return;
      setEntries((prev) => {
        const next = prev.filter((e) => e.listingId !== listingId);
        void writeFavoriteListings(user.id, next);
        return next;
      });
    },
    [user]
  );

  const syncFavoritesWithMarketplace = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getMarketplaceStoreListings();
      const byId = new Map((res.items ?? []).map((i) => [i.id, i]));
      setEntries((prev) => {
        if (prev.length === 0) return prev;
        let changed = false;
        const next = prev.map((e) => {
          const fresh = byId.get(e.listingId);
          if (fresh && listingDisplayChanged(e.cached, fresh)) {
            changed = true;
            return { ...e, cached: fresh };
          }
          return e;
        });
        if (changed) {
          void writeFavoriteListings(user.id, next);
          return next;
        }
        return prev;
      });
    } catch {
      /* catálogo opcional */
    }
  }, [user]);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      ready,
      entries,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      syncFavoritesWithMarketplace,
    }),
    [ready, entries, isFavorite, toggleFavorite, removeFavorite, syncFavoritesWithMarketplace]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites debe usarse dentro de FavoritesProvider');
  return ctx;
}
