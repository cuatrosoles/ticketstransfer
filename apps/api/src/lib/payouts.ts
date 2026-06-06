/**
 * Servicio de transferencias al vendedor (Payouts).
 * Usa la API REST de MercadoPago para transferencias bancarias (CBU/CVU).
 * Ref: https://www.mercadopago.com.ar/developers/es/reference/online-payments/payouts/one-transaction/bank-transfer/post
 */

import { db, COLLECTIONS } from './firestore.js';
import { getPlatformSettings } from './settings.js';
import { sendTransferCompleteEmail } from './email.js';

export type TransferStatus =
  | 'PENDIENTE'
  | 'ENVIADO'
  | 'COMPLETADO'
  | 'FALLIDO'
  | 'PENDIENTE_MANUAL'
  | 'ENVIADO_MANUAL';

export type SellerTransferRecord = {
  orderId: string;
  sellerId: string;
  amount: number;
  currency: string;
  status: TransferStatus;
  payoutId?: string;
  errorMessage?: string;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  completedBy?: string;
};

/** Obtiene el monto a transferir al vendedor (totalAmount - commissionAmount) */
export function getSellerAmount(totalAmount: number, commissionAmount: number): number {
  return Math.round((totalAmount - commissionAmount) * 100) / 100;
}

/** Genera clave de idempotencia para evitar duplicados */
export function generateIdempotencyKey(orderId: string): string {
  return `tt-payout-${orderId}-${Date.now()}`;
}

/**
 * Crea una transferencia bancaria al vendedor vía MercadoPago Payouts API.
 * Si la API de MP no está disponible o falla, registra como PENDIENTE_MANUAL.
 * Si el vendedor no tiene CBU/CVU, registra como PENDIENTE_MANUAL para que Admin lo haga manualmente.
 */
export async function createPayoutToSeller(params: {
  orderId: string;
  sellerId: string;
  amount: number;
  currency: string;
  cbuCvu: string;
  accountHolderName?: string;
  idempotencyKey: string;
  performedBy?: string;
}): Promise<{ success: boolean; transferId: string; payoutId?: string; error?: string }> {
  const transferId = db().collection(COLLECTIONS.SELLER_TRANSFERS).doc().id;

  const record: Omit<SellerTransferRecord, 'createdAt' | 'updatedAt'> = {
    orderId: params.orderId,
    sellerId: params.sellerId,
    amount: params.amount,
    currency: params.currency,
    status: 'PENDIENTE',
    idempotencyKey: params.idempotencyKey,
  };

  const now = new Date();
  await db()
    .collection(COLLECTIONS.SELLER_TRANSFERS)
    .doc(transferId)
    .set({
      ...record,
      createdAt: now,
      updatedAt: now,
    });

  const cbuCvu = params.cbuCvu.replace(/\D/g, '');
  if (!cbuCvu || cbuCvu.length !== 22) {
    await updateTransferStatus(transferId, 'PENDIENTE_MANUAL', null, 'Vendedor sin CBU/CVU registrado (ver alias en perfil)');
    return { success: false, transferId, error: 'Vendedor sin CBU/CVU. Realizar transferencia manual usando CBU o alias del perfil.' };
  }

  try {
    const settings = await getPlatformSettings();
    const token = settings.mercadopago.accessToken || process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!token) {
      await updateTransferStatus(transferId, 'PENDIENTE_MANUAL', null, 'MercadoPago no configurado');
      return { success: false, transferId, error: 'MercadoPago no configurado' };
    }

    // MercadoPago Payouts API - transferencia a cuenta bancaria (Argentina)
    const body = {
      amount: params.amount,
      currency_id: params.currency,
      external_reference: params.orderId,
      description: `Pago al vendedor - Orden ${params.orderId}`,
      beneficiary: {
        entity_type: 'individual',
        bank_account: {
          account_holder_name: params.accountHolderName || 'Vendedor',
          cbu: cbuCvu,
        },
      },
    };

    const response = await fetch('https://api.mercadopago.com/v1/payouts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': params.idempotencyKey,
      },
      body: JSON.stringify(body),
    });

    const data = (await response.json().catch(() => ({}))) as {
      id?: string;
      status?: string;
      message?: string;
      cause?: Array<{ code?: string; description?: string }>;
    };

    if (response.ok && data.id) {
      await updateTransferStatus(transferId, 'ENVIADO', data.id);
      await notifySellerTransferComplete(transferId, params.orderId, params.amount, params.currency);
      return { success: true, transferId, payoutId: data.id };
    }

    const errorMsg = data.message || data.cause?.[0]?.description || `HTTP ${response.status}`;
    await updateTransferStatus(transferId, 'FALLIDO', null, errorMsg);
    return { success: false, transferId, error: errorMsg };
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : 'Error inesperado';
    await updateTransferStatus(transferId, 'PENDIENTE_MANUAL', null, errorMsg);
    return { success: false, transferId, error: errorMsg };
  }
}

async function updateTransferStatus(
  transferId: string,
  status: TransferStatus,
  payoutId: string | null,
  errorMessage?: string | null
): Promise<void> {
  const updates: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  };
  if (payoutId) updates.payoutId = payoutId;
  if (errorMessage !== undefined) updates.errorMessage = errorMessage || null;
  if (status === 'COMPLETADO' || status === 'ENVIADO' || status === 'ENVIADO_MANUAL') {
    updates.completedAt = new Date();
  }
  await db().collection(COLLECTIONS.SELLER_TRANSFERS).doc(transferId).update(updates);
}

/** Marcar transferencia como enviada manualmente (admin realizó la transferencia fuera de la plataforma) */
export async function markTransferAsManualComplete(
  transferId: string,
  adminUserId: string
): Promise<void> {
  const doc = await db().collection(COLLECTIONS.SELLER_TRANSFERS).doc(transferId).get();
  const t = doc.exists ? doc.data() : null;
  await db()
    .collection(COLLECTIONS.SELLER_TRANSFERS)
    .doc(transferId)
    .update({
      status: 'ENVIADO_MANUAL',
      completedAt: new Date(),
      completedBy: adminUserId,
      updatedAt: new Date(),
    });
  if (t) {
    await notifySellerTransferComplete(transferId, t.orderId, t.amount, t.currency || 'ARS');
  }
}

async function notifySellerTransferComplete(
  transferId: string,
  orderId: string,
  amount: number,
  currency: string
): Promise<void> {
  const doc = await db().collection(COLLECTIONS.SELLER_TRANSFERS).doc(transferId).get();
  const sellerId = doc.exists ? doc.data()?.sellerId : null;
  if (!sellerId) return;
  const userDoc = await db().collection(COLLECTIONS.USERS).doc(sellerId).get();
  const email = userDoc.exists ? userDoc.data()?.email : null;
  if (email) {
    await sendTransferCompleteEmail(email, { orderId, amount, currency });
  }
}

/** Reintentar transferencia fallida o pendiente manual */
export async function retryTransfer(transferId: string): Promise<{ success: boolean; error?: string }> {
  const doc = await db().collection(COLLECTIONS.SELLER_TRANSFERS).doc(transferId).get();
  if (!doc.exists) return { success: false, error: 'Transferencia no encontrada' };
  const t = doc.data()!;
  if (t.status !== 'FALLIDO' && t.status !== 'PENDIENTE_MANUAL') {
    return { success: false, error: 'Solo se pueden reintentar transferencias fallidas o pendientes manual' };
  }

  const userDoc = await db().collection(COLLECTIONS.USERS).doc(t.sellerId).get();
  const userData = userDoc.data();
  const cbuCvu = userData?.cbuCvu;
  if (!cbuCvu || typeof cbuCvu !== 'string') {
    return { success: false, error: 'El vendedor no tiene CBU/CVU registrado' };
  }

  const result = await createPayoutToSeller({
    orderId: t.orderId,
    sellerId: t.sellerId,
    amount: t.amount,
    currency: t.currency || 'ARS',
    cbuCvu,
    accountHolderName: userData?.firstName && userData?.lastName ? `${userData.firstName} ${userData.lastName}` : undefined,
    idempotencyKey: generateIdempotencyKey(t.orderId),
  });

  if (result.success) {
    // Actualizar la transferencia original o crear nueva - por idempotencia, la anterior queda; la nueva se registra
    return { success: true };
  }
  return { success: false, error: result.error };
}
