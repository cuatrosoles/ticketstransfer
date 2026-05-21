/**
 * Preferencias de usuario: onboarding de gustos, interacciones, recomendaciones.
 */

import { Router, type Response } from 'express';
import {
  tasteOnboardingSchema,
  userPreferencesPatchSchema,
  listingInteractionSchema,
} from '@tickets-transfer/shared';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { db, COLLECTIONS } from '../lib/firestore.js';
import { getMarketplaceHomePublicListingsLimit } from '../lib/settings.js';
import {
  completeTasteOnboarding,
  ensureUserPreferences,
  getUserPreferences,
  patchEventPreferences,
  preferencesToApi,
  rankListingsByPreferences,
  recordListingInteraction,
  type MarketplaceListingItem,
} from '../lib/user-preferences.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req: AuthRequest, res) => {
  const prefs = await getUserPreferences(req.user!.id);
  res.json(preferencesToApi(prefs));
});

router.patch('/', async (req: AuthRequest, res) => {
  const parsed = userPreferencesPatchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() });
    return;
  }
  if (!parsed.data.eventPreferences) {
    res.status(400).json({ error: 'No hay campos para actualizar' });
    return;
  }
  await ensureUserPreferences(req.user!.id);
  const prefs = await patchEventPreferences(req.user!.id, parsed.data.eventPreferences);
  res.json(preferencesToApi(prefs));
});

router.post('/onboarding', async (req: AuthRequest, res) => {
  const parsed = tasteOnboardingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() });
    return;
  }
  const prefs = await completeTasteOnboarding(req.user!.id, parsed.data.eventPreferences);
  res.json({ ok: true, preferences: preferencesToApi(prefs) });
});

router.post('/interaction', async (req: AuthRequest, res) => {
  const parsed = listingInteractionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() });
    return;
  }
  const { listingId, type, category } = parsed.data;
  let cat: string = category ?? 'OTRO';
  if (!category) {
    const listing = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(listingId).get();
    if (listing.exists) cat = (listing.data()?.category as string) || 'OTRO';
  }
  await recordListingInteraction(req.user!.id, listingId, type, cat);
  res.json({ ok: true });
});

export { router as userPreferencesRouter };

/** Carga listings públicos del marketplace (misma forma que tickets.ts) */
export async function loadPublicMarketplaceItems(limit: number): Promise<MarketplaceListingItem[]> {
  const snap = await db()
    .collection(COLLECTIONS.TICKET_LISTINGS)
    .where('status', '==', 'DISPONIBLE')
    .where('visibility', '==', 'PUBLIC')
    .orderBy('createdAt', 'desc')
    .limit(Math.min(100, limit))
    .get();

  return Promise.all(
    snap.docs.map(async (doc) => {
      const d = doc.data();
      const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
      const sellerData = sellerDoc.data();
      const eventDate = d.eventDate?.toDate?.() ?? d.eventDate;
      const name =
        sellerData &&
        ([sellerData.firstName, sellerData.lastName].filter(Boolean).join(' ') ||
          sellerData.username ||
          'Vendedor');
      return {
        id: doc.id,
        eventName: d.eventName,
        eventDate,
        eventPlace: d.eventPlace ?? null,
        eventAddress: d.eventAddress ?? null,
        eventCity: d.eventCity ?? null,
        eventImageUrl: d.eventImageUrl ?? null,
        category: d.category ?? null,
        quantityEntries: d.quantityEntries ?? null,
        price: d.price != null && d.price !== '' ? Number(d.price) : null,
        createdAt: d.createdAt?.toDate?.() ?? null,
        seller: sellerData
          ? {
              id: d.sellerId,
              displayName: name,
              reputationScore: sellerData.reputationScore ?? 0,
            }
          : { id: d.sellerId, displayName: 'Vendedor', reputationScore: 0 },
      };
    })
  );
}

/** Handler para GET /api/tickets/marketplace/recommended */
export async function getRecommendedMarketplace(req: AuthRequest, res: Response) {
  const homeLimit = await getMarketplaceHomePublicListingsLimit();
  const limit = Math.min(100, homeLimit);
  const items = await loadPublicMarketplaceItems(limit);
  const prefs = await getUserPreferences(req.user!.id);
  const featured = items.slice(0, 2);
  const pool = items.slice(2);
  const recommended = rankListingsByPreferences(pool, prefs, 12);
  res.json({
    limit,
    featured,
    recommended,
    preferences: preferencesToApi(prefs),
    personalized: Boolean(
      prefs &&
        (prefs.eventPreferences.length > 0 || Object.keys(prefs.categoryScores).length > 0)
    ),
  });
}
