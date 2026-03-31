/**
 * Configuración de la plataforma - Firestore.
 * Valores por defecto y helpers para leer settings.
 */

import { db, COLLECTIONS } from './firestore.js';

export type MercadoPagoSettings = {
  enabled: boolean;
  accessToken: string;
  /** Public Key para tokenización de tarjetas en cliente (Checkout API) */
  publicKey: string;
  webhookSecret: string;
  sandboxMode: boolean;
  /** URL base para retorno tras pago: https://web.com o ticketTransfer:// (deep link app) */
  backUrlBase?: string;
  /**
   * Si true, en sandbox usa test_payer_1@testuser.com (mismo que el Brick).
   */
  sandboxUsePayerTestCom?: boolean;
  /**
   * Si true, usa email real del usuario (para credenciales PRODUCCIÓN).
   * Activar si aparece error 234 "Invalid domain user email for productive customer".
   */
  sandboxUseRealEmail?: boolean;
};

export type PlatformSettings = {
  commissionPercentage: number;
  mercadopago: MercadoPagoSettings;
  /** Cantidad de tickets públicos en la grilla del inicio de la app (default 6) */
  marketplaceHomePublicListingsLimit: number;
  users?: Record<string, unknown>;
  visual?: Record<string, unknown>;
  updatedAt?: Date;
};

const DEFAULTS: PlatformSettings = {
  commissionPercentage: 6.5,
  marketplaceHomePublicListingsLimit: 6,
  mercadopago: {
    enabled: false,
    accessToken: '',
    publicKey: '',
    webhookSecret: '',
    sandboxMode: true,
    backUrlBase: '',
    sandboxUsePayerTestCom: false,
    sandboxUseRealEmail: false,
  },
  users: {},
  visual: {},
};

const SETTINGS_DOC_ID = 'main';

let cachedSettings: PlatformSettings | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 30_000; // 30 segundos (evita credenciales desactualizadas)

export async function getPlatformSettings(): Promise<PlatformSettings> {
  if (cachedSettings && Date.now() < cacheExpiry) {
    return cachedSettings;
  }
  const doc = await db().collection(COLLECTIONS.PLATFORM_SETTINGS).doc(SETTINGS_DOC_ID).get();
  if (!doc.exists) {
    cachedSettings = { ...DEFAULTS };
    return cachedSettings;
  }
  const d = doc.data()!;
  cachedSettings = {
    commissionPercentage: d.commissionPercentage ?? DEFAULTS.commissionPercentage,
    marketplaceHomePublicListingsLimit: Math.min(
      50,
      Math.max(1, Number(d.marketplaceHomePublicListingsLimit) || DEFAULTS.marketplaceHomePublicListingsLimit)
    ),
    mercadopago: {
      enabled: d.mercadopago?.enabled ?? DEFAULTS.mercadopago.enabled,
      accessToken: d.mercadopago?.accessToken ?? '',
      publicKey: d.mercadopago?.publicKey ?? '',
      webhookSecret: d.mercadopago?.webhookSecret ?? '',
      sandboxMode: d.mercadopago?.sandboxMode ?? true,
      backUrlBase: d.mercadopago?.backUrlBase ?? '',
      sandboxUsePayerTestCom: d.mercadopago?.sandboxUsePayerTestCom ?? false,
      sandboxUseRealEmail: d.mercadopago?.sandboxUseRealEmail ?? false,
    },
    users: d.users ?? {},
    visual: d.visual ?? {},
    updatedAt: d.updatedAt?.toDate?.() ?? undefined,
  };
  cacheExpiry = Date.now() + CACHE_TTL_MS;
  return cachedSettings;
}

export function invalidateSettingsCache(): void {
  cachedSettings = null;
  cacheExpiry = 0;
}

export async function getCommissionPercentage(): Promise<number> {
  const s = await getPlatformSettings();
  return s.commissionPercentage;
}

export async function getMarketplaceHomePublicListingsLimit(): Promise<number> {
  const s = await getPlatformSettings();
  return s.marketplaceHomePublicListingsLimit;
}
