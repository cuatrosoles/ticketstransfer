/**
 * Rutas de ?rdenes - Firestore + Firebase Storage + MercadoPago.
 */

import { Router, type Response } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { db, COLLECTIONS } from '../lib/firestore.js';
import { uploadFile } from '../lib/firebase-storage.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { createOrderSchema } from '@tickets-transfer/shared';
import { HORAS_MAX_TRANSFERENCIA_VENDEDOR } from '@tickets-transfer/shared';
import {
  isMercadoPagoConfigured,
  createCheckoutPreference,
  createPaymentWithToken,
  getPaymentById,
} from '../lib/mercadopago.js';
import { getCommissionPercentage } from '../lib/settings.js';
import { stripOriginalListingImageUrls } from '../lib/listing-image-privacy.js';
import {
  applyMercadoPagoPaymentToOrder,
  releaseListingReservation,
  reserveListingForOrder,
  syncOrderPaymentFromMercadoPago,
} from '../lib/order-payments.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

function normalizeUid(u: unknown): string {
  return u == null ? '' : String(u).trim();
}

const createOrderRequestSchema = createOrderSchema.extend({
  deliveryMethod: z.enum(['usuario', 'id', 'email', 'telefono', 'otro']).optional(),
  deliveryUsername: z.string().max(400).optional(),
  deliveryIdNumber: z.string().max(200).optional(),
  deliveryEmail: z.string().max(320).optional(),
  deliveryPhone: z.string().max(40).optional(),
  deliveryOther: z.string().max(500).optional(),
  deliveryDetail: z.string().max(500).optional(),
});

function asTrimmedOptionalString(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

function asPositiveNumber(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v) && v > 0) return v;
  if (typeof v === 'string') {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

/** Solicitud de factura: comprador o vendedor de la orden (UID alineado con Firestore). */
async function processTransactionInvoiceRequest(
  req: AuthRequest,
  res: Response,
  orderIdRaw: string
): Promise<void> {
  const orderId = orderIdRaw.trim();
  if (!orderId) {
    res.status(400).json({ error: 'Identificador de orden inválido' });
    return;
  }

  const uid = normalizeUid(req.user!.id);
  const doc = await db().collection(COLLECTIONS.ORDERS).doc(orderId).get();
  if (!doc.exists) {
    res.status(404).json({ error: 'No encontrado' });
    return;
  }
  const d = doc.data()!;
  const buyerId = normalizeUid(d.buyerId);
  const sellerId = normalizeUid(d.sellerId);
  if (buyerId !== uid && sellerId !== uid) {
    res.status(404).json({ error: 'No encontrado' });
    return;
  }

  const role = buyerId === uid ? 'buyer' : 'seller';
  const noteRaw = req.body && typeof req.body === 'object' ? (req.body as { note?: unknown }).note : undefined;
  const note = typeof noteRaw === 'string' ? noteRaw.trim().slice(0, 500) : '';

  const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(String(d.ticketListingId)).get();
  const eventName = (listingDoc.exists && listingDoc.data()?.eventName) || '';

  const requesterDoc = await db().collection(COLLECTIONS.USERS).doc(uid).get();
  const requesterEmail = requesterDoc.exists ? requesterDoc.data()?.email ?? '' : '';

  const existingSnap = await db()
    .collection(COLLECTIONS.TRANSACTION_INVOICE_REQUESTS)
    .where('orderId', '==', orderId)
    .get();
  const pendingDup = existingSnap.docs.find((x) => {
    const row = x.data();
    return normalizeUid(row.requestedByUserId) === uid && row.status === 'PENDIENTE';
  });
  if (pendingDup) {
    res.json({
      ok: true,
      id: pendingDup.id,
      alreadyExists: true,
      status: 'PENDIENTE',
    });
    return;
  }

  const requestId = db().collection(COLLECTIONS.TRANSACTION_INVOICE_REQUESTS).doc().id;
  await db()
    .collection(COLLECTIONS.TRANSACTION_INVOICE_REQUESTS)
    .doc(requestId)
    .set({
      id: requestId,
      orderId,
      requestedByUserId: uid,
      requesterEmail,
      role,
      status: 'PENDIENTE',
      orderStatus: d.status,
      totalAmount: d.totalAmount,
      currency: d.currency || 'ARS',
      eventName,
      note: note || null,
      createdAt: new Date(),
    });

  res.status(201).json({ ok: true, id: requestId, alreadyExists: false });
}

router.use(requireAuth);

router.post('/', async (req: AuthRequest, res) => {
  const parsed = createOrderRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Datos inválidos', details: parsed.error.flatten() });
    return;
  }
  const pd = parsed.data;
  const { ticketListingId, paymentMethod } = pd;
  const hasDelivery =
    pd.deliveryMethod != null ||
    pd.deliveryUsername ||
    pd.deliveryIdNumber ||
    pd.deliveryEmail ||
    pd.deliveryPhone ||
    pd.deliveryOther ||
    pd.deliveryDetail;
  const hasStructuredContact =
    pd.deliveryUsername || pd.deliveryIdNumber || pd.deliveryEmail || pd.deliveryPhone;
  const inferredDeliveryMethod =
    pd.deliveryMethod ??
    ((pd.deliveryDetail || pd.deliveryOther) && !hasStructuredContact ? 'otro' : null);
  const deliveryFields = !hasDelivery
    ? {}
    : {
        deliveryMethod: inferredDeliveryMethod,
        deliveryUsername: pd.deliveryUsername ?? null,
        deliveryIdNumber: pd.deliveryIdNumber ?? null,
        deliveryEmail: pd.deliveryEmail ?? null,
        deliveryPhone: pd.deliveryPhone ?? null,
        deliveryOther: pd.deliveryOther ?? null,
        deliveryDetail: pd.deliveryDetail ?? null,
      };

  const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(ticketListingId).get();
  if (!listingDoc.exists) {
    res.status(404).json({ error: 'Ticket no disponible' });
    return;
  }
  const listing = listingDoc.data() as Record<string, unknown>;
  if (listing.status !== 'DISPONIBLE') {
    res.status(404).json({ error: 'Ticket no disponible' });
    return;
  }
  const listingPrice = asPositiveNumber(listing.price);
  if (listingPrice == null) {
    res.status(409).json({ error: 'La publicación tiene un precio inválido. Editá y volvé a publicar el ticket.' });
    return;
  }
  const listingCurrency = asTrimmedOptionalString(listing.currency) ?? 'ARS';
  const listingEventName = asTrimmedOptionalString(listing.eventName) ?? 'Ticket';
  const sellerIdCandidates = [listing.sellerId, listing.userId, (listing.seller as { id?: unknown } | undefined)?.id];
  const sellerId = sellerIdCandidates.find((v): v is string => typeof v === 'string' && v.trim().length > 0)?.trim();
  const buyerId = req.user!.id.trim();

  if (!sellerId) {
    res.status(409).json({ error: 'La publicación no tiene vendedor asignado. Volvé a publicar el ticket.' });
    return;
  }
  if (sellerId === buyerId) {
    res.status(400).json({ error: 'No puedes comprar tu propio ticket' });
    return;
  }

  if (paymentMethod === 'stripe') {
    res.status(400).json({ error: 'Stripe aún no está disponible. Usá Mercado Pago.' });
    return;
  }
  if (paymentMethod === 'mercadopago' && !(await isMercadoPagoConfigured())) {
    res.status(503).json({ error: 'Mercado Pago no está configurado. Contactá al administrador.' });
    return;
  }

  const commissionRate = (await getCommissionPercentage()) / 100;
  const commissionAmount = listingPrice * commissionRate;
  const totalAmount = listingPrice + commissionAmount;
  const transferDeadline = new Date();
  transferDeadline.setHours(transferDeadline.getHours() + HORAS_MAX_TRANSFERENCIA_VENDEDOR);

  const orderId = db().collection(COLLECTIONS.ORDERS).doc().id;
  const orderData = {
    ticketListingId,
    buyerId,
    sellerId,
    status: 'PENDIENTE_PAGO',
    totalAmount,
    commissionAmount,
    currency: listingCurrency,
    paymentMethod,
    transferDeadline,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...deliveryFields,
  };

  await db().collection(COLLECTIONS.ORDERS).doc(orderId).set(orderData);
  await reserveListingForOrder(ticketListingId, orderId);

  let checkoutUrl: string | undefined;

  if (paymentMethod === 'mercadopago') {
    try {
      const buyerDoc = await db().collection(COLLECTIONS.USERS).doc(req.user!.id).get();
      const { initPoint, preferenceId: prefId } = await createCheckoutPreference({
        orderId,
        title: listingEventName,
        unitPrice: totalAmount,
        quantity: 1,
        currency: listingCurrency,
        payerEmail: buyerDoc.data()?.email,
        payerUserId: req.user!.id,
      });
      checkoutUrl = initPoint;
      await db().collection(COLLECTIONS.ORDERS).doc(orderId).update({
        mercadopagoPreferenceId: prefId,
        mercadopagoCheckoutUrl: initPoint,
        updatedAt: new Date(),
      });
    } catch (e) {
      console.error('Error creando preferencia MercadoPago:', e);
      try {
        await db().collection(COLLECTIONS.ORDERS).doc(orderId).delete();
        await releaseListingReservation(ticketListingId, orderId);
      } catch (delErr) {
        console.error('No se pudo revertir orden tras fallo de MP:', delErr);
      }
      res.status(500).json({ error: 'No se pudo iniciar el checkout. Intentá de nuevo.' });
      return;
    }
  }

  const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(sellerId).get();
  const listingPayload = stripOriginalListingImageUrls({
    id: listingDoc.id,
    ...listing,
  } as Record<string, unknown>);
  const order = {
    id: orderId,
    ...orderData,
    ticketListing: listingPayload,
    seller: { id: sellerId, email: sellerDoc.data()?.email },
  };

  res.status(201).json({
    order,
    paymentNeeded: !!checkoutUrl,
    checkoutUrl: checkoutUrl ?? undefined,
  });
});

router.get('/my/purchases', async (req: AuthRequest, res) => {
  const snap = await db()
    .collection(COLLECTIONS.ORDERS)
    .where('buyerId', '==', req.user!.id)
    .orderBy('createdAt', 'desc')
    .get();

  const orders = await Promise.all(
    snap.docs.map(async (doc) => {
      const d = doc.data();
      const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(d.ticketListingId).get();
      const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();
      return {
        id: doc.id,
        ...d,
        ticketListing: listingDoc.exists
          ? stripOriginalListingImageUrls({ id: listingDoc.id, ...(listingDoc.data() as Record<string, unknown>) })
          : null,
        seller: sellerDoc.exists ? { id: d.sellerId, reputationScore: sellerDoc.data()?.reputationScore } : null,
        createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
        updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
        transferDeadline: d.transferDeadline?.toDate?.() ?? d.transferDeadline,
      };
    })
  );
  res.json(orders);
});

router.get('/my/sales', async (req: AuthRequest, res) => {
  const snap = await db()
    .collection(COLLECTIONS.ORDERS)
    .where('sellerId', '==', req.user!.id)
    .orderBy('createdAt', 'desc')
    .get();

  const orders = await Promise.all(
    snap.docs.map(async (doc) => {
      const d = doc.data();
      const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(d.ticketListingId).get();
      const buyerDoc = await db().collection(COLLECTIONS.USERS).doc(d.buyerId).get();
      return {
        id: doc.id,
        ...d,
        ticketListing: listingDoc.exists ? { id: listingDoc.id, ...listingDoc.data() } : null,
        buyer: buyerDoc.exists ? { id: d.buyerId, email: buyerDoc.data()?.email } : null,
        createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
        updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
        transferDeadline: d.transferDeadline?.toDate?.() ?? d.transferDeadline,
      };
    })
  );
  res.json(orders);
});

/**
 * Factura de transacción (preferido en Vercel: body JSON evita problemas de path con dos segmentos).
 * POST /api/orders/invoice-request  body: { orderId: string, note?: string }
 */
router.post('/invoice-request', async (req: AuthRequest, res) => {
  const body = req.body as { orderId?: unknown } | undefined;
  const oid = typeof body?.orderId === 'string' ? body.orderId : '';
  await processTransactionInvoiceRequest(req, res, oid);
});

router.get('/:id/checkout-url', async (req: AuthRequest, res) => {
  const doc = await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: 'No encontrado' });
  const d = doc.data()!;
  if (d.buyerId !== req.user!.id) return res.status(404).json({ error: 'No encontrado' });
  if (d.status !== 'PENDIENTE_PAGO') return res.status(400).json({ error: 'La orden ya no está pendiente de pago' });
  if (d.paymentMethod !== 'mercadopago') return res.status(400).json({ error: 'Solo Mercado Pago soporta checkout URL' });

  let checkoutUrl = d.mercadopagoCheckoutUrl;
  if (!checkoutUrl && (await isMercadoPagoConfigured())) {
    try {
      const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(d.ticketListingId).get();
      const listing = listingDoc.data()!;
      const buyerDoc = await db().collection(COLLECTIONS.USERS).doc(d.buyerId).get();
      const { initPoint, preferenceId: prefId } = await createCheckoutPreference({
        orderId: req.params.id,
        title: listing.eventName || 'Ticket',
        unitPrice: d.totalAmount,
        quantity: 1,
        currency: d.currency || 'ARS',
        payerEmail: buyerDoc.data()?.email,
        payerUserId: d.buyerId,
      });
      checkoutUrl = initPoint;
      await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).update({
        mercadopagoPreferenceId: prefId,
        mercadopagoCheckoutUrl: initPoint,
        updatedAt: new Date(),
      });
    } catch (e) {
      console.error('Error creando preferencia MercadoPago:', e);
      return res.status(500).json({ error: 'No se pudo generar el link de pago' });
    }
  }
  if (!checkoutUrl) return res.status(503).json({ error: 'Mercado Pago no configurado' });
  res.json({ checkoutUrl });
});

/** Misma acción con orderId en la URL (compatibilidad). */
router.post('/:id/invoice-request', async (req: AuthRequest, res) => {
  await processTransactionInvoiceRequest(req, res, req.params.id ?? '');
});

router.get('/:id', async (req: AuthRequest, res) => {
  const doc = await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: 'No encontrado' });
  const d = doc.data()!;
  if (d.buyerId !== req.user!.id && d.sellerId !== req.user!.id) {
    return res.status(404).json({ error: 'No encontrado' });
  }

  const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(d.ticketListingId).get();
  const buyerDoc = await db().collection(COLLECTIONS.USERS).doc(d.buyerId).get();
  const sellerDoc = await db().collection(COLLECTIONS.USERS).doc(d.sellerId).get();

  const rawListing = listingDoc.exists
    ? ({ id: listingDoc.id, ...(listingDoc.data() as Record<string, unknown>) } as Record<string, unknown>)
    : null;
  const ticketListingForViewer =
    rawListing && d.buyerId === req.user!.id ? stripOriginalListingImageUrls(rawListing) : rawListing;

  res.json({
    id: doc.id,
    ...d,
    ticketListing: ticketListingForViewer,
    buyer: buyerDoc.exists ? { id: d.buyerId, email: buyerDoc.data()?.email } : null,
    seller: sellerDoc.exists ? { id: d.sellerId, email: sellerDoc.data()?.email } : null,
    createdAt: d.createdAt?.toDate?.() ?? d.createdAt,
    updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
    transferDeadline: d.transferDeadline?.toDate?.() ?? d.transferDeadline,
    checkoutUrl: d.mercadopagoCheckoutUrl ?? undefined,
  });
});

/** Pago con Checkout API (tarjeta guardada o nueva) */
router.post('/:id/pay', async (req: AuthRequest, res) => {
  const orderId = req.params.id;
  const { token, paymentMethodId, issuerId } = req.body || {};
  if (!token || typeof token !== 'string' || !paymentMethodId || typeof paymentMethodId !== 'string') {
    return res.status(400).json({ error: 'Se requieren token y paymentMethodId (ej: visa, master)' });
  }

  const doc = await db().collection(COLLECTIONS.ORDERS).doc(orderId).get();
  if (!doc.exists) return res.status(404).json({ error: 'No encontrado' });
  const d = doc.data()!;
  if (d.buyerId !== req.user!.id) return res.status(404).json({ error: 'No encontrado' });
  if (d.status !== 'PENDIENTE_PAGO') {
    return res.status(400).json({ error: 'La orden ya no está pendiente de pago' });
  }
  if (d.paymentMethod !== 'mercadopago') {
    return res.status(400).json({ error: 'Solo Mercado Pago soporta pago con tarjeta' });
  }

  const buyerDoc = await db().collection(COLLECTIONS.USERS).doc(req.user!.id).get();
  const payerEmail = buyerDoc.data()?.email;
  if (!payerEmail) return res.status(400).json({ error: 'Usuario sin email' });

  let title = 'Orden';
  if (d.ticketListingId) {
    const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(d.ticketListingId).get();
    title = listingDoc.data()?.eventName || 'Ticket';
  }

  try {
    const payment = await createPaymentWithToken({
      orderId,
      title,
      amount: d.totalAmount,
      currency: typeof d.currency === 'string' ? d.currency : 'ARS',
      payerEmail,
      payerUserId: req.user!.id,
      token,
      paymentMethodId,
      issuerId: typeof issuerId === 'number' ? issuerId : undefined,
    });

    const applyResult = await applyMercadoPagoPaymentToOrder(orderId, {
      id: payment.id,
      status: payment.status,
      external_reference: orderId,
      transaction_amount: d.totalAmount,
      currency_id: d.currency || 'ARS',
    });

    res.json({
      paymentId: payment.id,
      status: payment.status,
      statusDetail: payment.status_detail,
      orderStatus: applyResult.orderStatus,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al procesar el pago';
    res.status(500).json({ error: msg });
  }
});

/** Sincroniza estado de pago con Mercado Pago (retorno del checkout o polling en app). */
router.post('/:id/sync-payment', async (req: AuthRequest, res) => {
  const orderId = req.params.id;
  const doc = await db().collection(COLLECTIONS.ORDERS).doc(orderId).get();
  if (!doc.exists) return res.status(404).json({ error: 'No encontrado' });
  const d = doc.data()!;
  if (d.buyerId !== req.user!.id) return res.status(404).json({ error: 'No encontrado' });

  try {
    const result = await syncOrderPaymentFromMercadoPago(orderId);
    res.json(result);
  } catch (e) {
    console.error('sync-payment:', e);
    res.status(500).json({ error: 'No se pudo sincronizar el pago' });
  }
});

router.post('/:id/confirm-payment', async (req: AuthRequest, res) => {
  const doc = await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: 'No encontrado' });
  const d = doc.data()!;
  if (d.buyerId !== req.user!.id || d.status !== 'PENDIENTE_PAGO') return res.status(404).json({ error: 'No encontrado' });
  if (d.paymentMethod === 'mercadopago') {
    return res.status(400).json({
      error:
        'El pago se confirma al completar el checkout de Mercado Pago. Usá el botón «Pagar con Mercado Pago» o el pago con tarjeta.',
    });
  }
  await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).update({ status: 'ESPERANDO_TRANSFERENCIA', updatedAt: new Date() });
  res.json({ ok: true, status: 'ESPERANDO_TRANSFERENCIA' });
});

router.post('/:id/transfer-done', async (req: AuthRequest, res) => {
  const doc = await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: 'No encontrado' });
  const d = doc.data()!;
  if (d.sellerId !== req.user!.id) return res.status(404).json({ error: 'No encontrado' });
  if (d.status !== 'ESPERANDO_TRANSFERENCIA') {
    return res.status(400).json({ error: 'Estado no permite marcar transferencia' });
  }
  await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).update({ status: 'TRANSFERIDO_VENDEDOR', updatedAt: new Date() });
  res.json({ ok: true });
});

router.post('/:id/confirm-received', async (req: AuthRequest, res) => {
  if (typeof req.body?.received !== 'boolean') {
    res.status(400).json({ error: 'Datos inválidos' });
    return;
  }
  const doc = await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: 'No encontrado' });
  const d = doc.data()!;
  if (d.buyerId !== req.user!.id) return res.status(404).json({ error: 'No encontrado' });
  await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).update({
    status: req.body.received ? 'ESPERANDO_CONFIRMACION_COMPRADOR' : d.status,
    buyerConfirmedAt: req.body.received ? new Date() : null,
    updatedAt: new Date(),
  });
  res.json({ ok: true });
});

router.post('/:id/evidence', upload.single('evidence'), async (req: AuthRequest, res) => {
  const doc = await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).get();
  if (!doc.exists) return res.status(404).json({ error: 'No encontrado' });
  const d = doc.data()!;
  const isBuyer = d.buyerId === req.user!.id;
  const isSeller = d.sellerId === req.user!.id;
  if (!isBuyer && !isSeller) return res.status(404).json({ error: 'No encontrado' });
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'Archivo requerido' });
    return;
  }
  const evidenceUrl = await uploadFile(
    `evidence/${req.params.id}/${Date.now()}.jpg`,
    file.buffer,
    file.mimetype || 'image/jpeg'
  );
  const patch: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  if (isBuyer) {
    patch.buyerEvidenceUrl = evidenceUrl;
    patch.evidenceUrl = evidenceUrl;
    patch.status = 'EVIDENCIA_SUBIDA';
  } else {
    patch.sellerEvidenceUrl = evidenceUrl;
  }
  await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).update(patch);
  res.json({ ok: true, status: String(patch.status ?? d.status) });
});

const PUNTOS_POR_RATING_POSITIVO = 5;

router.post('/:id/rate', async (req: AuthRequest, res) => {
  const orderDoc = await db().collection(COLLECTIONS.ORDERS).doc(req.params.id).get();
  if (!orderDoc.exists) return res.status(404).json({ error: 'No encontrado' });
  const order = orderDoc.data()!;
  if (order.status !== 'COMPLETADA') return res.status(404).json({ error: 'No encontrado' });
  if (order.buyerId !== req.user!.id && order.sellerId !== req.user!.id) {
    return res.status(404).json({ error: 'No encontrado' });
  }

  const positive = req.body?.positive === true;
  const isBuyer = order.buyerId === req.user!.id;
  const ratedUserId = isBuyer ? order.sellerId : order.buyerId;

  const existingRating = await db()
    .collection(COLLECTIONS.ORDER_RATINGS)
    .where('orderId', '==', req.params.id)
    .where('raterId', '==', req.user!.id)
    .limit(1)
    .get();

  if (!existingRating.empty) {
    return res.status(400).json({ error: 'Ya puntuaste esta orden' });
  }

  const ratingId = db().collection(COLLECTIONS.ORDER_RATINGS).doc().id;
  await db().collection(COLLECTIONS.ORDER_RATINGS).doc(ratingId).set({
    orderId: req.params.id,
    raterId: req.user!.id,
    ratedUserId,
    positive,
    points: positive ? PUNTOS_POR_RATING_POSITIVO : 0,
    createdAt: new Date(),
  });

  if (positive) {
    const ratedUserDoc = await db().collection(COLLECTIONS.USERS).doc(ratedUserId).get();
    const currentScore = ratedUserDoc.data()?.reputationScore ?? 0;
    await db().collection(COLLECTIONS.USERS).doc(ratedUserId).update({
      reputationScore: currentScore + PUNTOS_POR_RATING_POSITIVO,
      updatedAt: new Date(),
    });
  }

  res.json({ ok: true, points: positive ? PUNTOS_POR_RATING_POSITIVO : 0 });
});

export const ordersRouter = router;
