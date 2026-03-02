/**
 * Cliente MercadoPago – Checkout Pro + Checkout API (Customers, Cards, Payments).
 * Usa settings de plataforma (Admin) con fallback a variables de entorno.
 */

import crypto from 'crypto';
import { MercadoPagoConfig, Preference, Payment, Customer } from 'mercadopago';
import { getPlatformSettings } from './settings.js';

let client: MercadoPagoConfig | null = null;
let preferenceClient: Preference | null = null;
let paymentClient: Payment | null = null;
let customerClient: Customer | null = null;
let lastToken = '';

function getAccessToken(): string {
  return process.env.MERCADOPAGO_ACCESS_TOKEN || '';
}

export async function getMercadoPagoClient(): Promise<{
  client: MercadoPagoConfig;
  preference: Preference;
  payment: Payment;
  customer: Customer;
}> {
  const settings = await getPlatformSettings();
  const fromFirestore = settings.mercadopago.enabled && settings.mercadopago.accessToken;
  const token = fromFirestore ? settings.mercadopago.accessToken : getAccessToken();

  if (!token) {
    throw new Error('Mercado Pago no configurado. Configurá el Access Token en Admin → Configuración → Pasarelas de Pago.');
  }

  if (settings.mercadopago.sandboxMode && !fromFirestore) {
    throw new Error(
      'Modo prueba activo: usá las credenciales desde Admin/Firestore (platformSettings/main). No uses variables de entorno con credenciales de producción.'
    );
  }

  if (!client || lastToken !== token) {
    lastToken = token;
    client = new MercadoPagoConfig({
      accessToken: token,
      options: { timeout: 5000 },
    });
    preferenceClient = new Preference(client);
    paymentClient = new Payment(client);
    customerClient = new Customer(client);
  }
  if (!preferenceClient || !paymentClient || !customerClient) throw new Error('MP clients no inicializados');
  return { client, preference: preferenceClient, payment: paymentClient, customer: customerClient };
}

export async function isMercadoPagoConfigured(): Promise<boolean> {
  const settings = await getPlatformSettings();
  if (settings.mercadopago.enabled && settings.mercadopago.accessToken) return true;
  return !!getAccessToken();
}

export async function getMercadoPagoWebhookSecret(): Promise<string> {
  const settings = await getPlatformSettings();
  if (settings.mercadopago.webhookSecret) return settings.mercadopago.webhookSecret;
  return process.env.MERCADOPAGO_WEBHOOK_SECRET || '';
}

export type CreatePreferenceParams = {
  orderId: string;
  title: string;
  unitPrice: number;
  quantity?: number;
  currency?: string;
  payerEmail?: string;
  /** Si sandboxMode, se usa email @testuser.com para evitar error 300 */
  payerUserId?: string;
};

export async function createCheckoutPreference(params: CreatePreferenceParams): Promise<{ initPoint: string; preferenceId: string }> {
  const { preference } = await getMercadoPagoClient();
  const settings = await getPlatformSettings();
  const sandboxMode = settings.mercadopago.sandboxMode;
  const usePayerTestCom = settings.mercadopago.sandboxUsePayerTestCom;
  const payerEmail =
    params.payerEmail && sandboxMode && usePayerTestCom
      ? 'test_payer_1@testuser.com'
      : params.payerEmail && params.payerUserId && sandboxMode
        ? getCustomerEmailForMp(params.payerUserId, params.payerEmail, true)
        : params.payerEmail;

  const backBase = settings.mercadopago.backUrlBase || process.env.WEB_URL || process.env.APP_DEEP_LINK_SCHEME || 'http://localhost:5173';
  const basePath = backBase.replace(/\/$/, '');

  const isDeepLink = basePath.includes('://') && !basePath.startsWith('http');
  const success = isDeepLink
    ? `${basePath}orden/${params.orderId}/pago?status=success`
    : `${basePath}/orden/${params.orderId}/pago?status=success`;
  const failure = isDeepLink
    ? `${basePath}orden/${params.orderId}/pago?status=failure`
    : `${basePath}/orden/${params.orderId}/pago?status=failure`;
  const pending = isDeepLink
    ? `${basePath}orden/${params.orderId}/pago?status=pending`
    : `${basePath}/orden/${params.orderId}/pago?status=pending`;

  const pref = await preference.create({
    body: {
      items: [
        {
          id: params.orderId,
          title: params.title,
          quantity: params.quantity ?? 1,
          unit_price: params.unitPrice,
          currency_id: params.currency === 'ARS' ? 'ARS' : 'ARS',
        },
      ],
      external_reference: params.orderId,
      back_urls: {
        success,
        failure,
        pending,
      },
      auto_return: 'approved' as const,
      payer: payerEmail ? { email: payerEmail } : undefined,
    },
  });

  const initPoint = pref.init_point;
  const preferenceId = pref.id;
  if (!initPoint || !preferenceId) {
    throw new Error('MercadoPago no devolvió init_point');
  }
  return { initPoint, preferenceId };
}

export type PaymentInfo = {
  id: string;
  status: string;
  external_reference?: string;
};

export async function getPaymentById(paymentId: string): Promise<PaymentInfo | null> {
  try {
    const { payment } = await getMercadoPagoClient();
    const result = await payment.get({ id: paymentId });
    return result as { id: string; status: string; external_reference?: string };
  } catch {
    return null;
  }
}

export function verifyMercadoPagoWebhookSignature(
  dataId: string,
  xRequestId: string,
  ts: string,
  secret: string,
  receivedHash: string
): boolean {
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const hash = crypto.createHmac('sha256', secret).update(manifest).digest('hex');
  return hash === receivedHash;
}

/** Obtener Public Key para tokenización de tarjetas en el cliente */
export async function getMercadoPagoPublicKey(): Promise<string> {
  const settings = await getPlatformSettings();
  const pk = settings.mercadopago.publicKey || process.env.MERCADOPAGO_PUBLIC_KEY || '';
  if (!pk) throw new Error('Mercado Pago Public Key no configurado. Configurá en Admin → Pasarelas.');
  return pk;
}

/**
 * En sandbox con credenciales TEST: test_payer_[0-9]{1,10}@testuser.com.
 * Con credenciales PRODUCCIÓN (error 234 "productive customer"): usar email real.
 */
function getCustomerEmailForMp(userId: string, email: string, sandboxMode: boolean): string {
  if (!sandboxMode) return email;
  const hash = userId.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0, 0);
  const num = (hash % 9999999999) + 1;
  return `test_payer_${num}@testuser.com`;
}

/** Customers API – crear o obtener customer para usuario */
export async function getOrCreateCustomer(userId: string, email: string, sandboxMode = false): Promise<string> {
  const { customer } = await getMercadoPagoClient();
  const settings = await getPlatformSettings();
  const usePayerTestCom = settings.mercadopago.sandboxUsePayerTestCom;
  const useRealEmail = settings.mercadopago.sandboxUseRealEmail;
  const mpEmail =
    useRealEmail
      ? email
      : sandboxMode && usePayerTestCom
        ? 'test_payer_1@testuser.com'
        : getCustomerEmailForMp(userId, email, sandboxMode);
  const search = await customer.search({ options: { email: mpEmail } });
  const results = search.results as Array<{ id: string }> | undefined;
  if (results && results.length > 0) return results[0].id;
  const created = await customer.create({ body: { email: mpEmail } });
  return (created as { id: string }).id;
}

/** Agregar tarjeta a customer (token generado en cliente) */
export async function addCardToCustomer(customerId: string, token: string): Promise<{
  id: string;
  last_four_digits: string;
  payment_method: { id: string; name: string };
}> {
  const { customer } = await getMercadoPagoClient();
  const card = await customer.createCard({ customerId, body: { token } });
  const c = card as { id: string; last_four_digits?: string; last4?: string; payment_method?: { id: string; name: string } };
  return {
    id: c.id,
    last_four_digits: c.last_four_digits || c.last4 || '****',
    payment_method: c.payment_method || { id: 'credit_card', name: 'Tarjeta' },
  };
}

/** Listar tarjetas del customer */
export async function listCustomerCards(customerId: string): Promise<Array<{
  id: string;
  last_four_digits: string;
  payment_method: { id: string; name: string };
}>> {
  const { customer } = await getMercadoPagoClient();
  const result = await customer.listCards({ customerId });
  const cards = Array.isArray(result) ? result : (result as { data?: Array<Record<string, unknown>> })?.data ?? [];
  return cards.map((c: Record<string, unknown>) => ({
    id: String(c.id),
    last_four_digits: String(c.last_four_digits || c.last4 || '****'),
    payment_method: (c.payment_method as { id: string; name: string }) || { id: 'credit_card', name: 'Tarjeta' },
  }));
}

/** Eliminar tarjeta del customer */
export async function removeCustomerCard(customerId: string, cardId: string): Promise<void> {
  const { customer } = await getMercadoPagoClient();
  await customer.removeCard({ customerId, cardId });
}

/** Crear pago con token de tarjeta (nueva tarjeta o tarjeta guardada + CVV) */
export async function createPaymentWithToken(params: {
  orderId: string;
  title: string;
  amount: number;
  payerEmail: string;
  /** userId del comprador; si sandboxMode, se usa email @testuser.com para evitar error 300 */
  payerUserId?: string;
  token: string;
  paymentMethodId: string;
  issuerId?: number;
}): Promise<{ id: string; status: string; status_detail?: string }> {
  const { payment } = await getMercadoPagoClient();
  const settings = await getPlatformSettings();
  const sandboxMode = settings.mercadopago.sandboxMode;
  const usePayerTestCom = settings.mercadopago.sandboxUsePayerTestCom;
  const mpPayerEmail =
    sandboxMode && usePayerTestCom
      ? 'test_payer_1@testuser.com'
      : params.payerUserId && sandboxMode
        ? getCustomerEmailForMp(params.payerUserId, params.payerEmail, true)
        : params.payerEmail;

  const body: Record<string, unknown> = {
    transaction_amount: params.amount,
    token: params.token,
    payment_method_id: params.paymentMethodId,
    payer: { email: mpPayerEmail },
    external_reference: params.orderId,
    description: params.title,
    installments: 1,
  };
  if (params.issuerId) body.issuer_id = params.issuerId;
  const result = await payment.create({ body });
  return result as { id: string; status: string; status_detail?: string };
}
