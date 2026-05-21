/**
 * Procesamiento de pagos Mercado Pago, reserva de listings y notificaciones.
 */

import { FieldValue } from 'firebase-admin/firestore';
import { db, COLLECTIONS } from './firestore.js';
import {
  getPaymentById,
  searchPaymentsByExternalReference,
  type PaymentInfo,
} from './mercadopago.js';
import {
  sendPaymentApprovedBuyerEmail,
  sendPaymentApprovedSellerEmail,
  sendPaymentFailedBuyerEmail,
  sendPaymentPendingBuyerEmail,
  sendNewSaleAdminEmail,
} from './email.js';
import { sendPushNotification } from './firebase-messaging.js';

export type MpPaymentApplyResult = {
  applied: boolean;
  orderStatus: string;
  paymentStatus?: string;
};

function paymentMatchesOrder(payment: PaymentInfo, expectedTotal: number | null, orderCurrency: string): boolean {
  const payCurrency = (payment.currency_id || 'ARS').toUpperCase();
  const amountOk =
    payment.transaction_amount == null ||
    expectedTotal == null ||
    Math.abs(payment.transaction_amount - expectedTotal) <= 0.02;
  const currencyOk = orderCurrency === payCurrency;
  return amountOk && currencyOk;
}

/** Pausa el listing mientras hay una orden pendiente de pago. */
export async function reserveListingForOrder(listingId: string, orderId: string): Promise<void> {
  const ref = db().collection(COLLECTIONS.TICKET_LISTINGS).doc(listingId);
  const doc = await ref.get();
  if (!doc.exists) return;
  const d = doc.data()!;
  if (d.status !== 'DISPONIBLE') return;
  await ref.update({
    status: 'PAUSADO',
    reservedOrderId: orderId,
    updatedAt: new Date(),
  });
}

/** Marca el ticket como vendido tras pago acreditado. */
export async function markListingSold(listingId: string): Promise<void> {
  await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(listingId).update({
    status: 'VENDIDO',
    reservedOrderId: FieldValue.delete(),
    updatedAt: new Date(),
  });
}

/** Libera la reserva si la orden se cancela o el pago no se concretó. */
export async function releaseListingReservation(listingId: string, orderId: string): Promise<void> {
  const ref = db().collection(COLLECTIONS.TICKET_LISTINGS).doc(listingId);
  const doc = await ref.get();
  if (!doc.exists) return;
  const d = doc.data()!;
  if (d.reservedOrderId !== orderId) return;
  if (d.status === 'VENDIDO') return;
  await ref.update({
    status: 'DISPONIBLE',
    reservedOrderId: FieldValue.delete(),
    updatedAt: new Date(),
  });
}

type AdminRecipient = { id: string; email: string; fcmToken?: string };

async function getAdminRecipients(): Promise<AdminRecipient[]> {
  const fromEnv = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
  if (fromEnv) {
    return [{ id: 'env-admin', email: fromEnv }];
  }
  const snap = await db().collection(COLLECTIONS.USERS).where('role', '==', 'admin').get();
  const recipients: AdminRecipient[] = [];
  for (const doc of snap.docs) {
    const d = doc.data();
    const email = typeof d.email === 'string' ? d.email.trim() : '';
    if (!email) continue;
    const row: AdminRecipient = { id: doc.id, email };
    if (typeof d.fcmToken === 'string' && d.fcmToken.length > 0) {
      row.fcmToken = d.fcmToken;
    }
    recipients.push(row);
  }
  return recipients;
}

async function sendPushSafe(
  userId: string,
  fcmToken: string | undefined,
  title: string,
  body: string,
  data: Record<string, string>
): Promise<void> {
  if (!fcmToken) return;
  const result = await sendPushNotification(fcmToken, title, body, data);
  if (result.tokenInvalid) {
    await db().collection(COLLECTIONS.USERS).doc(userId).update({
      fcmToken: FieldValue.delete(),
      updatedAt: new Date(),
    });
  }
}

export async function notifyPaymentApproved(params: {
  orderId: string;
  eventName: string;
  totalAmount: number;
  currency: string;
  buyerId: string;
  sellerId: string;
}): Promise<void> {
  const [buyerDoc, sellerDoc] = await Promise.all([
    db().collection(COLLECTIONS.USERS).doc(params.buyerId).get(),
    db().collection(COLLECTIONS.USERS).doc(params.sellerId).get(),
  ]);
  const buyerEmail = buyerDoc.data()?.email;
  const sellerEmail = sellerDoc.data()?.email;
  const buyerToken = buyerDoc.data()?.fcmToken;
  const sellerToken = sellerDoc.data()?.fcmToken;

  const amountLabel = `${params.currency} ${params.totalAmount.toLocaleString('es-AR')}`;

  if (buyerEmail) {
    void sendPaymentApprovedBuyerEmail(buyerEmail, {
      orderId: params.orderId,
      eventName: params.eventName,
      amountLabel,
    });
  }
  if (sellerEmail) {
    void sendPaymentApprovedSellerEmail(sellerEmail, {
      orderId: params.orderId,
      eventName: params.eventName,
      amountLabel,
    });
  }

  void sendPushSafe(
    params.buyerId,
    buyerToken,
    'Pago confirmado',
    `Tu compra de "${params.eventName}" fue acreditada. El vendedor debe transferirte el ticket.`,
    { type: 'order_payment', orderId: params.orderId, status: 'approved' }
  );
  void sendPushSafe(
    params.sellerId,
    sellerToken,
    '¡Nueva venta!',
    `Pagaron tu ticket "${params.eventName}". Transferí el ticket al comprador.`,
    { type: 'order_payment', orderId: params.orderId, status: 'approved' }
  );

  const admins = await getAdminRecipients();
  for (const admin of admins) {
    void sendNewSaleAdminEmail(admin.email, {
      orderId: params.orderId,
      eventName: params.eventName,
      amountLabel,
    });
    void sendPushSafe(
      admin.id,
      admin.fcmToken,
      'Nueva venta pagada',
      `${params.eventName} — ${amountLabel}. Revisá la orden en el panel.`,
      { type: 'order_payment', orderId: params.orderId, status: 'approved' }
    );
  }
}

export async function notifyPaymentFailed(params: {
  orderId: string;
  eventName: string;
  buyerId: string;
}): Promise<void> {
  const buyerDoc = await db().collection(COLLECTIONS.USERS).doc(params.buyerId).get();
  const buyerEmail = buyerDoc.data()?.email;
  const buyerToken = buyerDoc.data()?.fcmToken;
  if (buyerEmail) {
    void sendPaymentFailedBuyerEmail(buyerEmail, { orderId: params.orderId, eventName: params.eventName });
  }
  void sendPushSafe(
    params.buyerId,
    buyerToken,
    'Pago no completado',
    `No se acreditó el pago de "${params.eventName}". Podés reintentar desde la app.`,
    { type: 'order_payment', orderId: params.orderId, status: 'failure' }
  );
}

export async function notifyPaymentPending(params: {
  orderId: string;
  eventName: string;
  buyerId: string;
}): Promise<void> {
  const buyerDoc = await db().collection(COLLECTIONS.USERS).doc(params.buyerId).get();
  const buyerEmail = buyerDoc.data()?.email;
  const buyerToken = buyerDoc.data()?.fcmToken;
  if (buyerEmail) {
    void sendPaymentPendingBuyerEmail(buyerEmail, { orderId: params.orderId, eventName: params.eventName });
  }
  void sendPushSafe(
    params.buyerId,
    buyerToken,
    'Pago pendiente',
    `Tu pago de "${params.eventName}" está en proceso. Te avisaremos cuando se acredite.`,
    { type: 'order_payment', orderId: params.orderId, status: 'pending' }
  );
}

/**
 * Aplica el estado de un pago MP a la orden (idempotente si ya no está PENDIENTE_PAGO).
 */
export async function applyMercadoPagoPaymentToOrder(
  orderId: string,
  payment: PaymentInfo,
  options?: { notify?: boolean }
): Promise<MpPaymentApplyResult> {
  const orderRef = db().collection(COLLECTIONS.ORDERS).doc(orderId);
  const orderDoc = await orderRef.get();
  if (!orderDoc.exists) {
    return { applied: false, orderStatus: 'NOT_FOUND' };
  }
  const ord = orderDoc.data()!;
  const currentStatus = String(ord.status || '');
  const expectedTotal = typeof ord.totalAmount === 'number' ? ord.totalAmount : null;
  const orderCurrency = String(ord.currency || 'ARS').toUpperCase();
  const listingId = String(ord.ticketListingId || '');
  const notify = options?.notify !== false;

  const listingDoc = listingId
    ? await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(listingId).get()
    : null;
  const eventName = listingDoc?.exists ? String(listingDoc.data()?.eventName || 'Ticket') : 'Ticket';

  if (payment.status === 'approved') {
    if (!paymentMatchesOrder(payment, expectedTotal, orderCurrency)) {
      console.warn('MP pago aprobado no coincide con orden', { orderId, payment });
      return { applied: false, orderStatus: currentStatus, paymentStatus: payment.status };
    }
    if (currentStatus === 'PENDIENTE_PAGO') {
      await orderRef.update({
        status: 'ESPERANDO_TRANSFERENCIA',
        paymentIntentId: payment.id,
        mercadopagoPaymentId: payment.id,
        mercadopagoPaymentStatus: payment.status,
        paidAt: new Date(),
        updatedAt: new Date(),
      });
      if (listingId) await markListingSold(listingId);
      if (notify) {
        await notifyPaymentApproved({
          orderId,
          eventName,
          totalAmount: expectedTotal ?? 0,
          currency: orderCurrency,
          buyerId: String(ord.buyerId),
          sellerId: String(ord.sellerId),
        });
      }
      return { applied: true, orderStatus: 'ESPERANDO_TRANSFERENCIA', paymentStatus: payment.status };
    }
    return { applied: false, orderStatus: currentStatus, paymentStatus: payment.status };
  }

  if (payment.status === 'pending' || payment.status === 'in_process') {
    if (currentStatus === 'PENDIENTE_PAGO') {
      const wasPending = ord.mercadopagoPaymentStatus === 'pending' || ord.mercadopagoPaymentStatus === 'in_process';
      await orderRef.update({
        mercadopagoPaymentId: payment.id,
        mercadopagoPaymentStatus: payment.status,
        updatedAt: new Date(),
      });
      if (notify && !wasPending) {
        await notifyPaymentPending({
          orderId,
          eventName,
          buyerId: String(ord.buyerId),
        });
      }
    }
    return { applied: true, orderStatus: currentStatus, paymentStatus: payment.status };
  }

  const rejected = ['rejected', 'cancelled', 'refunded', 'charged_back'].includes(payment.status);
  if (rejected && currentStatus === 'PENDIENTE_PAGO') {
    await orderRef.update({
      mercadopagoPaymentId: payment.id,
      mercadopagoPaymentStatus: payment.status,
      lastPaymentFailureAt: new Date(),
      updatedAt: new Date(),
    });
    if (notify) {
      await notifyPaymentFailed({
        orderId,
        eventName,
        buyerId: String(ord.buyerId),
      });
    }
    return { applied: true, orderStatus: currentStatus, paymentStatus: payment.status };
  }

  return { applied: false, orderStatus: currentStatus, paymentStatus: payment.status };
}

/**
 * Sincroniza el pago de una orden consultando Mercado Pago (retorno del checkout o polling).
 */
export async function syncOrderPaymentFromMercadoPago(orderId: string): Promise<{
  orderStatus: string;
  paymentStatus: string | null;
  synced: boolean;
}> {
  const orderRef = db().collection(COLLECTIONS.ORDERS).doc(orderId);
  const orderDoc = await orderRef.get();
  if (!orderDoc.exists) {
    return { orderStatus: 'NOT_FOUND', paymentStatus: null, synced: false };
  }
  const ord = orderDoc.data()!;

  if (ord.status !== 'PENDIENTE_PAGO') {
    return {
      orderStatus: String(ord.status),
      paymentStatus: ord.mercadopagoPaymentStatus ?? null,
      synced: false,
    };
  }

  let payment: PaymentInfo | null = null;
  const storedPaymentId = ord.mercadopagoPaymentId ? String(ord.mercadopagoPaymentId) : '';
  if (storedPaymentId) {
    payment = await getPaymentById(storedPaymentId);
  }
  if (!payment) {
    const found = await searchPaymentsByExternalReference(orderId);
    payment = found[0] ?? null;
  }
  if (!payment) {
    return { orderStatus: String(ord.status), paymentStatus: null, synced: false };
  }

  const result = await applyMercadoPagoPaymentToOrder(orderId, payment);
  const refreshed = await orderRef.get();
  return {
    orderStatus: String(refreshed.data()?.status || result.orderStatus),
    paymentStatus: result.paymentStatus ?? payment.status,
    synced: result.applied,
  };
}
