/**
 * Webhooks externos (Didit KYC, MercadoPago) - Firestore.
 */

import { Router, type Request, type Response } from 'express';
import { db, COLLECTIONS } from '../lib/firestore.js';
import {
  verifyDiditWebhookSignature,
  verifyDiditWebhookSignatureV2,
  verifyDiditWebhookSignatureSimple,
} from '../lib/didit.js';
import {
  isMercadoPagoConfigured,
  getPaymentById,
  verifyMercadoPagoWebhookSignature,
  getMercadoPagoWebhookSecret,
} from '../lib/mercadopago.js';

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
  let body: { session_id?: string; status?: string; vendor_data?: string; decision?: { kyc?: { status?: string } }; timestamp?: string; webhook_type?: string };
  try {
    body = rawBody ? JSON.parse(rawBody) : (req.body as typeof body);
  } catch {
    body = req.body as typeof body;
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'JSON inválido' });
  }

  const signature = req.get('x-signature') ?? req.get('X-Signature');
  const signatureV2 = req.get('x-signature-v2') ?? req.get('X-Signature-V2');
  const signatureSimple = req.get('x-signature-simple') ?? req.get('X-Signature-Simple');
  const timestamp = req.get('x-timestamp') ?? req.get('X-Timestamp');

  if (!WEBHOOK_SECRET) {
    console.error('DIDIT_WEBHOOK_SECRET_KEY no configurado');
    return res.status(500).json({ error: 'Webhook no configurado' });
  }

  if (!timestamp) {
    return res.status(401).json({ error: 'Header X-Timestamp requerido' });
  }

  let isValid = false;
  if (rawBody && signature && (await verifyDiditWebhookSignature(rawBody, signature, timestamp, WEBHOOK_SECRET))) {
    isValid = true;
  } else if (signatureV2 && (await verifyDiditWebhookSignatureV2(body, signatureV2, timestamp, WEBHOOK_SECRET))) {
    isValid = true;
  } else if (signatureSimple && (await verifyDiditWebhookSignatureSimple(body, signatureSimple, timestamp, WEBHOOK_SECRET))) {
    isValid = true;
  }

  if (!isValid) {
    return res.status(401).json({ error: 'Firma inválida' });
  }

  const { status, vendor_data, session_id } = body;
  let userId: string | null = vendor_data ?? null;

  if (!userId && session_id) {
    const bySession = await db()
      .collection(COLLECTIONS.KYC_VERIFICATIONS)
      .where('diditSessionId', '==', session_id)
      .limit(1)
      .get();
    if (!bySession.empty) {
      userId = bySession.docs[0].id;
    }
  }

  if (!userId) {
    return res.status(400).json({ error: 'vendor_data o session_id no encontrado' });
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

/** Webhook MercadoPago: notificaciones de pago (topic: payment) */
router.post('/mercadopago', async (req: Request, res: Response) => {
  const rawBody = (req as Request & { rawBody?: string }).rawBody;
  if (!rawBody) {
    return res.status(400).json({ error: 'Raw body no disponible' });
  }

  let body: { type?: string; data?: { id?: string } };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'JSON inválido' });
  }

  const { type, data } = body;
  if (type !== 'payment' || !data?.id) {
    return res.status(200).json({ received: true });
  }

  const paymentId = String(data.id);
  const xSignature = req.get('x-signature') ?? req.get('X-Signature');
  const xRequestId = req.get('x-request-id') ?? req.get('X-Request-Id') ?? '';

  const webhookSecret = await getMercadoPagoWebhookSecret();
  if (webhookSecret && xSignature) {
    const parts = xSignature.split(',');
    let ts = '';
    let v1 = '';
    for (const part of parts) {
      const [key, val] = part.split('=').map((s) => s.trim());
      if (key === 'ts') ts = val;
      if (key === 'v1') v1 = val;
    }
    const dataId = paymentId.toLowerCase();
    const isValid = verifyMercadoPagoWebhookSignature(dataId, xRequestId, ts, webhookSecret, v1);
    if (!isValid) {
      console.warn('Webhook MercadoPago: firma inválida');
      return res.status(401).json({ error: 'Firma inválida' });
    }
  }

  if (!isMercadoPagoConfigured()) {
    return res.status(200).json({ received: true });
  }

  const payment = await getPaymentById(paymentId);
  if (!payment) {
    return res.status(200).json({ received: true });
  }

  const orderId = payment.external_reference;
  if (!orderId) {
    return res.status(200).json({ received: true });
  }

  const orderRef = db().collection(COLLECTIONS.ORDERS).doc(orderId);
  const orderDoc = await orderRef.get();
  if (orderDoc.exists && orderDoc.data()?.status === 'PENDIENTE_PAGO') {
    if (payment.status === 'approved') {
      await orderRef.update({
        status: 'ESPERANDO_TRANSFERENCIA',
        paymentIntentId: paymentId,
        mercadopagoPaymentId: paymentId,
        updatedAt: new Date(),
      });
    } else if (payment.status === 'pending' || payment.status === 'in_process') {
      await orderRef.update({
        mercadopagoPaymentId: paymentId,
        mercadopagoPaymentStatus: payment.status,
        updatedAt: new Date(),
      });
    }
  }

  return res.status(200).json({ received: true });
});

export const webhooksRouter = router;
