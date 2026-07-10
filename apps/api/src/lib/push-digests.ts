/**
 * Notificaciones push programadas: eventos cercanos y recomendaciones personalizadas.
 */

import { FieldValue } from 'firebase-admin/firestore';
import { filterAndSortByDistance, hasValidCoordinates } from '@tickets-transfer/shared';
import { db, COLLECTIONS } from './firestore.js';
import { getPlatformSettings, getMarketplaceNearbyRadiusKm } from './settings.js';
import { sendPushBatch } from './firebase-messaging.js';
import { loadPublicMarketplaceItems } from '../routes/user-preferences.js';
import {
  getUserPreferences,
  rankListingsByPreferences,
} from './user-preferences.js';
import { mergeNotificationPreferences, allowsPushType } from './notification-preferences.js';

const NEARBY_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const RECOMMENDED_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;
const USER_BATCH = 400;

type UserRow = {
  id: string;
  fcmToken: string;
  latitude?: number | null;
  longitude?: number | null;
  pushDigestMeta?: {
    nearbySentAt?: { toDate?: () => Date } | Date | null;
    recommendedSentAt?: { toDate?: () => Date } | Date | null;
  };
  notificationPreferences?: Record<string, unknown>;
};

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

function cooldownOk(last: unknown, cooldownMs: number): boolean {
  const d = toDate(last);
  if (!d) return true;
  return Date.now() - d.getTime() >= cooldownMs;
}

async function loadUsersWithPushToken(limit = USER_BATCH): Promise<UserRow[]> {
  const snap = await db().collection(COLLECTIONS.USERS).limit(limit).get();
  const rows: UserRow[] = [];
  for (const doc of snap.docs) {
    const d = doc.data();
    const token = typeof d.fcmToken === 'string' ? d.fcmToken.trim() : '';
    if (token.length < 10) continue;
    rows.push({
      id: doc.id,
      fcmToken: token,
      latitude: d.latitude,
      longitude: d.longitude,
      pushDigestMeta: d.pushDigestMeta,
      notificationPreferences:
        d.notificationPreferences && typeof d.notificationPreferences === 'object'
          ? (d.notificationPreferences as Record<string, unknown>)
          : undefined,
    });
  }
  return rows;
}

async function clearInvalidUserTokens(userIds: string[]): Promise<void> {
  if (!userIds.length) return;
  const unique = [...new Set(userIds)];
  const batch = db().batch();
  for (const userId of unique) {
    batch.update(db().collection(COLLECTIONS.USERS).doc(userId), {
      fcmToken: FieldValue.delete(),
      updatedAt: new Date(),
    });
  }
  await batch.commit();
}

function digestTexts(settings: Awaited<ReturnType<typeof getPlatformSettings>>) {
  const n = settings.notifications ?? {};
  return {
    nearbyTitle: String(n.nearbyTitle || 'Nuevos eventos cerca de ti'),
    nearbyBody: String(n.nearbyBody || 'Enterate de más en la app.'),
    recommendedTitle: String(n.recommendedTitle || 'Nuevos recomendados para vos'),
    recommendedBody: String(
      n.recommendedBody || '¿Qué esperas? Entrá y viví tu experiencia Tickets Transfer.'
    ),
  };
}

/** Envía digest de eventos cercanos a usuarios con GPS y token FCM. */
export async function sendNearbyEventsDigest(limit = USER_BATCH): Promise<{
  candidates: number;
  sent: number;
  skipped: number;
}> {
  const [users, settings, radiusKm, pool] = await Promise.all([
    loadUsersWithPushToken(limit),
    getPlatformSettings(),
    getMarketplaceNearbyRadiusKm(),
    loadPublicMarketplaceItems(80),
  ]);
  const texts = digestTexts(settings);
  const items: Array<{ token: string; title: string; body: string; data: Record<string, string> }> = [];
  const userIdsToUpdate: string[] = [];
  const tokenOwners: string[] = [];
  let skipped = 0;

  for (const user of users) {
    const prefs = mergeNotificationPreferences(user.notificationPreferences);
    if (!allowsPushType(prefs, 'nearby_events')) {
      skipped += 1;
      continue;
    }
    if (!cooldownOk(user.pushDigestMeta?.nearbySentAt, NEARBY_COOLDOWN_MS)) {
      skipped += 1;
      continue;
    }
    if (!hasValidCoordinates(user.latitude, user.longitude)) {
      skipped += 1;
      continue;
    }
    const nearby = filterAndSortByDistance(pool, user.latitude!, user.longitude!, radiusKm);
    if (!nearby.length) {
      skipped += 1;
      continue;
    }
    const top = nearby[0];
    items.push({
      token: user.fcmToken,
      title: texts.nearbyTitle,
      body: texts.nearbyBody,
      data: {
        type: 'nearby_events',
        listingId: top.id,
        eventName: top.eventName?.slice(0, 80) || '',
      },
    });
    tokenOwners.push(user.id);
    userIdsToUpdate.push(user.id);
  }

  if (!items.length) {
    return { candidates: users.length, sent: 0, skipped };
  }

  const result = await sendPushBatch(items);
  const now = new Date();
  await Promise.all(
    userIdsToUpdate.map((userId) =>
      db()
        .collection(COLLECTIONS.USERS)
        .doc(userId)
        .set({ pushDigestMeta: { nearbySentAt: now }, updatedAt: now }, { merge: true })
    )
  );
  const invalidUserIds = result.invalidTokens
    .map((token) => {
      const idx = items.findIndex((item) => item.token === token);
      return idx >= 0 ? tokenOwners[idx] : null;
    })
    .filter((id): id is string => Boolean(id));
  await clearInvalidUserTokens(invalidUserIds);

  return { candidates: users.length, sent: result.sent, skipped };
}

/** Envía digest de recomendaciones según gustos del usuario. */
export async function sendRecommendationsDigest(limit = USER_BATCH): Promise<{
  candidates: number;
  sent: number;
  skipped: number;
}> {
  const [users, settings, pool] = await Promise.all([
    loadUsersWithPushToken(limit),
    getPlatformSettings(),
    loadPublicMarketplaceItems(80),
  ]);
  const texts = digestTexts(settings);
  const featuredSkip = pool.slice(2);
  const items: Array<{ token: string; title: string; body: string; data: Record<string, string> }> = [];
  const userIdsToUpdate: string[] = [];
  const tokenOwners: string[] = [];
  let skipped = 0;

  for (const user of users) {
    const prefs = mergeNotificationPreferences(user.notificationPreferences);
    if (!allowsPushType(prefs, 'recommendation')) {
      skipped += 1;
      continue;
    }
    if (!cooldownOk(user.pushDigestMeta?.recommendedSentAt, RECOMMENDED_COOLDOWN_MS)) {
      skipped += 1;
      continue;
    }
    const prefs = await getUserPreferences(user.id);
    const hasPrefs =
      Boolean(prefs?.tasteOnboardingCompletedAt) ||
      (prefs?.eventPreferences?.length ?? 0) > 0 ||
      Object.keys(prefs?.categoryScores ?? {}).length > 0;
    if (!hasPrefs) {
      skipped += 1;
      continue;
    }
    const recommended = rankListingsByPreferences(featuredSkip, prefs, 1);
    if (!recommended.length) {
      skipped += 1;
      continue;
    }
    const top = recommended[0];
    items.push({
      token: user.fcmToken,
      title: texts.recommendedTitle,
      body: texts.recommendedBody,
      data: {
        type: 'recommendation',
        listingId: top.id,
        eventName: top.eventName?.slice(0, 80) || '',
      },
    });
    tokenOwners.push(user.id);
    userIdsToUpdate.push(user.id);
  }

  if (!items.length) {
    return { candidates: users.length, sent: 0, skipped };
  }

  const result = await sendPushBatch(items);
  const now = new Date();
  await Promise.all(
    userIdsToUpdate.map((userId) =>
      db()
        .collection(COLLECTIONS.USERS)
        .doc(userId)
        .set({ pushDigestMeta: { recommendedSentAt: now }, updatedAt: now }, { merge: true })
    )
  );
  const invalidUserIds = result.invalidTokens
    .map((token) => {
      const idx = items.findIndex((item) => item.token === token);
      return idx >= 0 ? tokenOwners[idx] : null;
    })
    .filter((id): id is string => Boolean(id));
  await clearInvalidUserTokens(invalidUserIds);

  return { candidates: users.length, sent: result.sent, skipped };
}

export type BroadcastAudience = 'all' | 'buyers' | 'sellers' | 'with_location';

/** Envío masivo desde panel admin (manual / campañas). */
export async function sendAdminBroadcast(params: {
  title: string;
  body: string;
  audience?: BroadcastAudience;
  campaignId?: string;
  limit?: number;
}): Promise<{ targeted: number; sent: number; failed: number }> {
  const limit = Math.min(params.limit ?? USER_BATCH, 1000);
  const snap = await db().collection(COLLECTIONS.USERS).limit(limit).get();
  const items: Array<{
    userId: string;
    token: string;
    title: string;
    body: string;
    data: Record<string, string>;
  }> = [];

  for (const doc of snap.docs) {
    const d = doc.data();
    const token = typeof d.fcmToken === 'string' ? d.fcmToken.trim() : '';
    if (token.length < 10) continue;

    const audience = params.audience ?? 'all';
    if (audience === 'with_location' && !hasValidCoordinates(d.latitude, d.longitude)) continue;
    if (audience === 'sellers') {
      const sales = typeof d.completedSalesCount === 'number' ? d.completedSalesCount : 0;
      if (sales <= 0 && d.role !== 'seller') continue;
    }
    if (audience === 'buyers' && d.role === 'admin') continue;

    const prefs = mergeNotificationPreferences(d.notificationPreferences);
    if (!allowsPushType(prefs, 'admin_broadcast')) continue;

    items.push({
      userId: doc.id,
      token,
      title: params.title,
      body: params.body,
      data: {
        type: 'admin_broadcast',
        campaignId: params.campaignId || `admin-${Date.now()}`,
      },
    });
  }

  if (!items.length) {
    return { targeted: 0, sent: 0, failed: 0 };
  }

  const result = await sendPushBatch(
    items.map(({ token, title, body, data }) => ({ token, title, body, data }))
  );
  const invalidUserIds = result.invalidTokens
    .map((token) => items.find((item) => item.token === token)?.userId ?? null)
    .filter((id): id is string => Boolean(id));
  await clearInvalidUserTokens(invalidUserIds);
  return { targeted: items.length, sent: result.sent, failed: result.failed };
}
