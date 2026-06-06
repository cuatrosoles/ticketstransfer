/**
 * Procesamiento de pagos Mercado Pago, reserva de listings y notificaciones.
 */

import { FieldValue } from 'firebase-admin/firestore';
import { MINUTOS_RESERVA_PAGO } from '@tickets-transfer/shared';
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
  sendBuyerConfirmedDeliveryAdminEmail,
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

function paymentReservationExpiresAt(from: Date = new Date()): Date {
  const expires = new Date(from);
  expires.setMinutes(expires.getMinutes() + MINUTOS_RESERVA_PAGO);
  return expires;
}

function orderReservationExpired(order: Record<string, unknown>): boolean {
  const expires = order.paymentReservationExpiresAt;
  if (!expires) return false;
  const d =
    expires instanceof Date
      ? expires
      : typeof (expires as { toDate?: () => Date }).toDate === 'function'
        ? (expires as { toDate: () => Date }).toDate()
        : new Date(String(expires));
  return !Number.isNaN(d.getTime()) && d.getTime() < Date.now();
}

/** Libera reservas de pago vencidas (órdenes PENDIENTE_PAGO sin acreditar). */
export async function expireStalePaymentReservations(limit = 50): Promise<number> {
  const snap = await db()
    .collection(COLLECTIONS.ORDERS)
    .where('status', '==', 'PENDIENTE_PAGO')
    .orderBy('createdAt', 'asc')
    .limit(limit)
    .get();

  let released = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    if (!orderReservationExpired(d)) continue;
    await doc.ref.update({
      status: 'CANCELADA',
      cancelReason: 'Pago no concretado dentro del plazo de reserva',
      updatedAt: new Date(),
    });
    const listingId = d.ticketListingId ? String(d.ticketListingId) : '';
    if (listingId) {
      await releaseListingReservation(listingId, doc.id);
    }
    released += 1;
  }
  return released;
}

export type ListingPurchaseAvailability = {
  canPurchase: boolean;
  status: 'AVAILABLE' | 'PENDING_PAYMENT' | 'UNAVAILABLE';
  message?: string;
  reservationExpiresAt?: Date | null;
  reservedOrderId?: string | null;
  reservedByCurrentUser?: boolean;
};

/** Evalúa si un listing puede iniciar una nueva compra (libera reservas vencidas). */
export async function getListingPurchaseAvailability(
  listingId: string,
  buyerId?: string | null
): Promise<ListingPurchaseAvailability> {
  await expireStalePaymentReservations(20);

  const listingDoc = await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(listingId).get();
  if (!listingDoc.exists) {
    return { canPurchase: false, status: 'UNAVAILABLE', message: 'Publicación no encontrada' };
  }
  const listing = listingDoc.data()!;
  const status = String(listing.status || '');

  if (status === 'VENDIDO' || status === 'ELIMINADO') {
    return { canPurchase: false, status: 'UNAVAILABLE', message: 'Este ticket ya no está disponible' };
  }
  if (status === 'DISPONIBLE') {
    return { canPurchase: true, status: 'AVAILABLE' };
  }
  if (status !== 'PAUSADO') {
    return { canPurchase: false, status: 'UNAVAILABLE', message: 'Ticket no disponible' };
  }

  const reservedOrderId = listing.reservedOrderId ? String(listing.reservedOrderId) : null;
  if (!reservedOrderId) {
    await db().collection(COLLECTIONS.TICKET_LISTINGS).doc(listingId).update({
      status: 'DISPONIBLE',
      updatedAt: new Date(),
    });
    return { canPurchase: true, status: 'AVAILABLE' };
  }

  const orderDoc = await db().collection(COLLECTIONS.ORDERS).doc(reservedOrderId).get();
  if (!orderDoc.exists) {
    await releaseListingReservation(listingId, reservedOrderId);
    return { canPurchase: true, status: 'AVAILABLE' };
  }
  const order = orderDoc.data()!;
  if (order.status !== 'PENDIENTE_PAGO' || orderReservationExpired(order)) {
    await db().collection(COLLECTIONS.ORDERS).doc(reservedOrderId).update({
      status: 'CANCELADA',
      cancelReason: 'Pago no concretado dentro del plazo de reserva',
      updatedAt: new Date(),
    });
    await releaseListingReservation(listingId, reservedOrderId);
    return { canPurchase: true, status: 'AVAILABLE' };
  }

  const reservedByCurrentUser = Boolean(buyerId && String(order.buyerId) === buyerId);
  const expiresRaw = order.paymentReservationExpiresAt;
  const reservationExpiresAt =
    expiresRaw instanceof Date
      ? expiresRaw
      : typeof (expiresRaw as { toDate?: () => Date })?.toDate === 'function'
        ? (expiresRaw as { toDate: () => Date }).toDate()
        : null;

  if (reservedByCurrentUser) {
    return {
      canPurchase: true,
      status: 'PENDING_PAYMENT',
      message: 'Tenés una compra en curso. Podés continuar con el pago.',
      reservationExpiresAt,
      reservedOrderId,
      reservedByCurrentUser: true,
    };
  }

  const minutesLeft = reservationExpiresAt
    ? Math.max(1, Math.ceil((reservationExpiresAt.getTime() - Date.now()) / 60000))
    : MINUTOS_RESERVA_PAGO;

  return {
    canPurchase: false,
    status: 'PENDING_PAYMENT',
    message: `Otro usuario está procesando el pago de este ticket. Volvé a intentar en unos ${minutesLeft} minuto${minutesLeft === 1 ? '' : 's'}.`,
    reservationExpiresAt,
    reservedOrderId,
    reservedByCurrentUser: false,
  };
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

/** Notifica a administradores que el comprador confirmó haber recibido el ticket. */
export async function notifyBuyerConfirmedDelivery(params: {
  orderId: string;
  eventName: string;
  buyerId: string;
}): Promise<void> {
  const admins = await getAdminRecipients();
  for (const admin of admins) {
    void sendBuyerConfirmedDeliveryAdminEmail(admin.email, {
      orderId: params.orderId,
      eventName: params.eventName,
    });
    void sendPushSafe(
      admin.id,
      admin.fcmToken,
      'Ticket recibido — revisar orden',
      `El comprador confirmó la recepción de "${params.eventName}". Marcá la orden como COMPLETADA para pagar al vendedor.`,
      { type: 'order_delivery', orderId: params.orderId, status: 'VERIFICANDO' }
    );
  }
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
