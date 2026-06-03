/**
 * Persistencia y motor de preferencias de usuario – Firestore
 */

import {
  INTERACTION_WEIGHTS,
  labelForCategoriaEvento,
  scoreListingForUser,
  type ListingInteractionType,
} from '@tickets-transfer/shared';
import { db, COLLECTIONS } from './firestore.js';

export type UserPreferencesDoc = {
  userId: string;
  eventPreferences: string[];
  categoryScores: Record<string, number>;
  tasteOnboardingCompletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function prefsRef(userId: string) {
  return db().collection(COLLECTIONS.USER_PREFERENCES).doc(userId);
}

export async function getUserPreferences(userId: string): Promise<UserPreferencesDoc | null> {
  const doc = await prefsRef(userId).get();
  if (!doc.exists) return null;
  const d = doc.data()!;
  return {
    userId,
    eventPreferences: Array.isArray(d.eventPreferences) ? d.eventPreferences : [],
    categoryScores:
      d.categoryScores && typeof d.categoryScores === 'object'
        ? (d.categoryScores as Record<string, number>)
        : {},
    tasteOnboardingCompletedAt: d.tasteOnboardingCompletedAt?.toDate?.() ?? d.tasteOnboardingCompletedAt ?? null,
    createdAt: d.createdAt?.toDate?.() ?? new Date(),
    updatedAt: d.updatedAt?.toDate?.() ?? new Date(),
  };
}

export async function ensureUserPreferences(userId: string): Promise<UserPreferencesDoc> {
  const existing = await getUserPreferences(userId);
  if (existing) return existing;
  const now = new Date();
  const initial: Omit<UserPreferencesDoc, 'userId'> & { userId: string } = {
    userId,
    eventPreferences: [],
    categoryScores: {},
    tasteOnboardingCompletedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  await prefsRef(userId).set(initial);
  return initial;
}

export async function completeTasteOnboarding(
  userId: string,
  eventPreferences: string[]
): Promise<UserPreferencesDoc> {
  const now = new Date();
  const ref = prefsRef(userId);
  const existing = await ref.get();
  await ref.set(
    {
      userId,
      eventPreferences,
      tasteOnboardingCompletedAt: now,
      updatedAt: now,
      ...(existing.exists ? {} : { categoryScores: {}, createdAt: now }),
    },
    { merge: true }
  );
  return (await getUserPreferences(userId))!;
}

export async function patchEventPreferences(
  userId: string,
  eventPreferences: string[]
): Promise<UserPreferencesDoc> {
  const now = new Date();
  await prefsRef(userId).set({ eventPreferences, updatedAt: now }, { merge: true });
  return (await getUserPreferences(userId)) ?? (await ensureUserPreferences(userId));
}

export async function recordListingInteraction(
  userId: string,
  listingId: string,
  type: ListingInteractionType,
  category?: string | null
): Promise<void> {
  const weight = INTERACTION_WEIGHTS[type];
  const cat = category || 'OTRO';
  const now = new Date();

  await db().collection(COLLECTIONS.USER_LISTING_INTERACTIONS).add({
    userId,
    listingId,
    type,
    category: cat,
    weight,
    createdAt: now,
  });

  const ref = prefsRef(userId);
  const doc = await ref.get();
  const scores: Record<string, number> =
    doc.exists && doc.data()?.categoryScores && typeof doc.data()!.categoryScores === 'object'
      ? { ...(doc.data()!.categoryScores as Record<string, number>) }
      : {};

  const next = Math.max(0, (scores[cat] ?? 0) + weight);
  scores[cat] = next;

  await ref.set(
    {
      userId,
      categoryScores: scores,
      updatedAt: now,
      ...(doc.exists ? {} : { eventPreferences: [], createdAt: now }),
    },
    { merge: true }
  );
}

export function preferencesToApi(prefs: UserPreferencesDoc | null) {
  const eventPreferences = prefs?.eventPreferences ?? [];
  const categoryScores = prefs?.categoryScores ?? {};
  const topCategories = Object.entries(categoryScores)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, score]) => ({
      category,
      score,
      label: labelForCategoriaEvento(category),
    }));

  return {
    eventPreferences,
    tasteOnboardingCompleted: Boolean(prefs?.tasteOnboardingCompletedAt),
    tasteOnboardingCompletedAt: prefs?.tasteOnboardingCompletedAt
      ? prefs.tasteOnboardingCompletedAt.toISOString()
      : null,
    categoryScores,
    topCategories,
  };
}

export type MarketplaceListingItem = {
  id: string;
  eventName: string;
  eventDate: unknown;
  eventPlace?: string | null;
  eventAddress?: string | null;
  eventCity?: string | null;
  eventLatitude?: number | null;
  eventLongitude?: number | null;
  distanceKm?: number | null;
  eventImageUrl?: string | null;
  category?: string | null;
  quantityEntries?: unknown;
  price?: number | null;
  seller: { id: string; displayName: string; reputationScore: number };
  createdAt?: Date | null;
};

/** Ordena listings por puntaje de preferencias; devuelve los top N */
export function rankListingsByPreferences(
  items: MarketplaceListingItem[],
  prefs: UserPreferencesDoc | null,
  limit: number
): MarketplaceListingItem[] {
  const profile = {
    explicitCategories: prefs?.eventPreferences ?? [],
    categoryScores: prefs?.categoryScores ?? {},
  };

  const hasSignals =
    profile.explicitCategories.length > 0 || Object.keys(profile.categoryScores).length > 0;

  if (!hasSignals) {
    return items.slice(0, limit);
  }

  const scored = items.map((item) => ({
    item,
    score: scoreListingForUser(
      { category: item.category, createdAt: item.createdAt ?? undefined },
      profile
    ),
  }));

  scored.sort((a, b) => b.score - a.score || 0);
  const positive = scored.filter((s) => s.score > 0).map((s) => s.item);
  if (positive.length >= limit) return positive.slice(0, limit);

  const used = new Set(positive.map((i) => i.id));
  const filler = items.filter((i) => !used.has(i.id));
  return [...positive, ...filler].slice(0, limit);
}
