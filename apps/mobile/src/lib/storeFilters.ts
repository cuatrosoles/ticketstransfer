import type { MarketplacePublicItem } from './api';
import { labelForCategoriaEvento } from '@tickets-transfer/shared';

export type StoreCategoryFilter = 'MUSICA' | 'TEATRO' | 'DEPORTES' | 'FESTIVALES' | null;

export const STORE_CATEGORY_CHIPS: { id: StoreCategoryFilter; label: string }[] = [
  { id: null, label: 'Todos' },
  { id: 'MUSICA', label: 'Conciertos' },
  { id: 'TEATRO', label: 'Teatro' },
  { id: 'DEPORTES', label: 'Deportes' },
  { id: 'FESTIVALES', label: 'Festivales' },
];

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function listingSearchBlob(item: MarketplacePublicItem): string {
  const parts = [
    item.eventName,
    item.eventPlace,
    item.eventAddress,
    item.eventCity,
    item.seller.displayName,
    labelForCategoriaEvento(item.category),
  ];
  return normalizeSearchText(parts.filter(Boolean).join(' '));
}

export function filterStoreListings(
  items: MarketplacePublicItem[],
  searchQuery: string,
  categoryFilter: StoreCategoryFilter
): MarketplacePublicItem[] {
  const q = normalizeSearchText(searchQuery);
  return items.filter((item) => {
    if (categoryFilter != null) {
      const cat = item.category || 'OTRO';
      if (cat !== categoryFilter) return false;
    }
    if (!q) return true;
    return listingSearchBlob(item).includes(q);
  });
}
