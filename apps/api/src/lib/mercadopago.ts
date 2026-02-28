/**
 * Cliente MercadoPago para Checkout Pro.
 * Usa settings de plataforma (Admin) con fallback a variables de entorno.
 */

import crypto from 'crypto';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { getPlatformSettings } from './settings.js';

let client: MercadoPagoConfig | null = null;
let preferenceClient: Preference | null = null;
let paymentClient: Payment | null = null;
let lastToken = '';

function getAccessToken(): string {
  return process.env.MERCADOPAGO_ACCESS_TOKEN || '';
}

export async function getMercadoPagoClient(): Promise<{ client: MercadoPagoConfig; preference: Preference; payment: Payment }> {
  const settings = await getPlatformSettings();
  const token = settings.mercadopago.enabled && settings.mercadopago.accessToken
    ? settings.mercadopago.accessToken
    : getAccessToken();

  if (!token) {
    throw new Error('Mercado Pago no configurado. Configurá el Access Token en Admin → Configuración → Pasarelas de Pago.');
  }

  if (!client || lastToken !== token) {
    lastToken = token;
    client = new MercadoPagoConfig({
      accessToken: token,
      options: { timeout: 5000 },
    });
    preferenceClient = new Preference(client);
    paymentClient = new Payment(client);
  }
  if (!preferenceClient || !paymentClient) throw new Error('Preference/Payment no inicializado');
  return { client, preference: preferenceClient, payment: paymentClient };
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
};

export async function createCheckoutPreference(params: CreatePreferenceParams): Promise<{ initPoint: string; preferenceId: string }> {
  const { preference } = await getMercadoPagoClient();
  const webUrl = process.env.WEB_URL || 'http://localhost:5173';
  const basePath = webUrl.replace(/\/$/, '');

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
        success: `${basePath}/orden/${params.orderId}/pago?status=success`,
        failure: `${basePath}/orden/${params.orderId}/pago?status=failure`,
        pending: `${basePath}/orden/${params.orderId}/pago?status=pending`,
      },
      auto_return: 'approved' as const,
      payer: params.payerEmail ? { email: params.payerEmail } : undefined,
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
