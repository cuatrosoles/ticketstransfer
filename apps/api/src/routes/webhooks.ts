/**
 * Webhooks externos (Didit KYC) - Firestore.
 */

import { Router, type Request, type Response } from 'express';
import { db, COLLECTIONS } from '../lib/firestore.js';
import { verifyDiditWebhookSignature } from '../lib/didit.js';

const router = Router();

const WEBHOOK_SECRET = process.env.DIDIT_WEBHOOK_SECRET_KEY;

function mapDiditStatus(status: string): 'PENDIENTE' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO' {
  switch (status) {
    case 'Approved':
      return 'APROBADO';
    case 'Declined':
      return 'RECHAZADO';
    case 'In Review':
      return 'EN_REVISION';
    case 'Not Started':
    case 'Kyc Expired':
    case 'Abandoned':
    default:
      return status === 'In Review' ? 'EN_REVISION' : 'PENDIENTE';
  }
}

router.post('/didit', async (req: Request, res: Response) => {
  const rawBody = (req as Request & { rawBody?: string }).rawBody;
  if (!rawBody) {
    return res.status(400).json({ error: 'Raw body no disponible' });
  }

  const signature = req.get('x-signature') ?? req.get('X-Signature');
  const timestamp = req.get('x-timestamp') ?? req.get('X-Timestamp');

  if (!WEBHOOK_SECRET) {
    console.error('DIDIT_WEBHOOK_SECRET_KEY no configurado');
    return res.status(500).json({ error: 'Webhook no configurado' });
  }

  const isValid = await verifyDiditWebhookSignature(rawBody, signature, timestamp, WEBHOOK_SECRET);
  if (!isValid) {
    return res.status(401).json({ error: 'Firma inválida' });
  }

  let body: { session_id?: string; status?: string; vendor_data?: string; decision?: { kyc?: { status?: string } } };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'JSON inválido' });
  }

  const { status, vendor_data } = body;
  const userId = vendor_data;

  if (!userId) {
    return res.status(400).json({ error: 'vendor_data requerido' });
  }

  const ourStatus = mapDiditStatus(status || '');
  const rejectionReason = status === 'Declined' && body.decision?.kyc ? 'Verificación rechazada por Didit' : null;

  try {
    await db().collection(COLLECTIONS.KYC_VERIFICATIONS).doc(userId).set(
      {
        status: ourStatus,
        ...(rejectionReason && { rejectionReason }),
        ...(ourStatus === 'APROBADO' || ourStatus === 'RECHAZADO' ? { reviewedAt: new Date() } : {}),
        updatedAt: new Date(),
      },
      { merge: true }
    );
    return res.json({ message: 'Webhook procesado' });
  } catch (e) {
    console.error('Error actualizando KYC:', e);
    return res.status(500).json({ error: 'Error interno' });
  }
});

export const webhooksRouter = router;
