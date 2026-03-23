/**
 * Endpoints para tareas programadas (cron).
 * Protegidos con CRON_SECRET para evitar llamadas no autorizadas.
 *
 * Configurar en Vercel: vercel.json "crons" o servicio externo que llame a estas URLs
 * con header: Authorization: Bearer <CRON_SECRET>
 */

import { Router, type Request, type Response } from 'express';
import { db, COLLECTIONS } from '../lib/firestore.js';
import { retryTransfer } from '../lib/payouts.js';

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

export const cronRouter = router;
