/**
 * Preferencias de usuario y motor de recomendación – Tickets Transfer
 */

import { CATEGORIAS_EVENTOS } from './constants.js';

/** Preferencias explícitas (onboarding / perfil) con etiquetas amigables */
export const PREFERENCIAS_EVENTO = [
  { id: 'MUSICA', label: 'Recitales / Música', listingCategories: ['MUSICA'] as const },
  { id: 'DEPORTES', label: 'Deportes', listingCategories: ['DEPORTES'] as const },
  { id: 'TEATRO', label: 'Teatro', listingCategories: ['TEATRO'] as const },
  { id: 'STAND_UP', label: 'Stand-up', listingCategories: ['TEATRO', 'OTRO'] as const },
  { id: 'FESTIVALES', label: 'Festivales', listingCategories: ['FESTIVALES'] as const },
  { id: 'OTRO', label: 'Otros', listingCategories: ['OTRO'] as const },
] as const;

export const PREFERENCIAS_EVENTO_IDS = PREFERENCIAS_EVENTO.map((p) => p.id);

export type CategoriaEvento = (typeof CATEGORIAS_EVENTOS)[number];

import type { ListingInteractionType } from './types.js';

/** Peso por tipo de interacción (actualiza categoryScores) */
export const INTERACTION_WEIGHTS: Record<ListingInteractionType, number> = {
  VIEW: 1,
  CLICK: 2,
  FAVORITE_ADD: 5,
  FAVORITE_REMOVE: -3,
};

const PREF_TO_LISTING = new Map<string, readonly string[]>(
  PREFERENCIAS_EVENTO.map((p) => [p.id, p.listingCategories])
);

/** Categoría de listing que coincide con una preferencia explícita */
export function listingMatchesPreferencia(
  listingCategory: string | null | undefined,
  preferenciaId: string
): boolean {
  const cats = PREF_TO_LISTING.get(preferenciaId);
  if (!cats) return false;
  const cat = listingCategory || 'OTRO';
  return cats.includes(cat);
}

/** Puntaje de recomendación para un listing dado el perfil de preferencias */
export function scoreListingForUser(
  listing: { category?: string | null; createdAt?: Date | string | number | null },
  prefs: {
    explicitCategories?: string[];
    categoryScores?: Record<string, number>;
  }
): number {
  const category = listing.category || 'OTRO';
  let score = 0;

  for (const prefId of prefs.explicitCategories ?? []) {
    if (listingMatchesPreferencia(category, prefId)) score += 10;
  }

  score += prefs.categoryScores?.[category] ?? 0;

  if (listing.createdAt) {
    const ts =
      listing.createdAt instanceof Date
        ? listing.createdAt.getTime()
        : new Date(listing.createdAt as string | number).getTime();
    if (!Number.isNaN(ts)) {
      const ageDays = (Date.now() - ts) / (24 * 3600 * 1000);
      score += Math.max(0, 2 - ageDays * 0.3);
    }
  }

  return score;
}

export function labelForPreferencia(id: string): string {
  return PREFERENCIAS_EVENTO.find((p) => p.id === id)?.label ?? id;
}

export function labelForCategoriaEvento(cat: string | null | undefined): string {
  const c = cat || 'OTRO';
  const map: Record<string, string> = {
    MUSICA: 'Música',
    DEPORTES: 'Deportes',
    TEATRO: 'Teatro',
    FESTIVALES: 'Festivales',
    OTRO: 'Otros',
  };
  return map[c] ?? c;
}
