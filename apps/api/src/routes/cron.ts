/**
 * Endpoints para tareas programadas (cron).
 * Protegidos con CRON_SECRET para evitar llamadas no autorizadas.
 *
 * Programar en https://cron-job.org (u otro servicio externo):
 * - Método GET, header: Authorization: Bearer <CRON_SECRET>
 * - Ver apps/api/.env.example para URLs y frecuencias recomendadas.
 */

import { Router, type Request, type Response } from 'express';
import { db, COLLECTIONS } from '../lib/firestore.js';
import { retryTransfer } from '../lib/payouts.js';
import { expireStalePaymentReservations } from '../lib/order-payments.js';
import { sendNearbyEventsDigest, sendRecommendationsDigest } from '../lib/push-digests.js';

const router = Router();
const CRON_SECRET = process.env.CRON_SECRET;

function isAuthorized(req: Request): boolean {
  if (!CRON_SECRET) return false;
  const auth = req.get('Authorization') || req.get('authorization');
  return auth === `Bearer ${CRON_SECRET}`;
}

/** Reintentar transferencias fallidas (máx 5 por ejecución). Puede llamarse cada hora. */
router.get('/retry-failed-transfers', async (req: Request, res: Response) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const limit = 5;
  const snap = await db()
    .collection(COLLECTIONS.SELLER_TRANSFERS)
    .where('status', '==', 'FALLIDO')
    .orderBy('createdAt', 'asc')
    .limit(limit)
    .get();

  const results: { id: string; success: boolean; error?: string }[] = [];
  for (const doc of snap.docs) {
    const r = await retryTransfer(doc.id);
    results.push({ id: doc.id, success: r.success, error: r.error });
  }

  res.json({
    ok: true,
    processed: results.length,
    results,
  });
});

/** Libera tickets cuya reserva de pago venció (órdenes PENDIENTE_PAGO). Ejecutar cada 5-15 min. */
router.get('/expire-payment-reservations', async (req: Request, res: Response) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  const released = await expireStalePaymentReservations(100);
  res.json({ ok: true, released });
});

/** Digest de eventos cercanos (semanal recomendado). */
router.get('/nearby-events-push', async (req: Request, res: Response) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  const result = await sendNearbyEventsDigest(400);
  res.json({ ok: true, ...result });
});

/** Digest de recomendaciones personalizadas (cada 2-3 días). */
router.get('/recommendations-push', async (req: Request, res: Response) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  const result = await sendRecommendationsDigest(400);
  res.json({ ok: true, ...result });
});

export const cronRouter = router;
