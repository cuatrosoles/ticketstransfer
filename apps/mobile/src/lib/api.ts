/**
 * Cliente API – Tickets Transfer móvil
 * Ubicación: apps/mobile/src/lib/api.ts
 *
 * - Desarrollo: API_BASE_OVERRIDE = null → emulador Android 10.0.2.2, simulador iOS localhost.
 * - Producción (APK para clientes): asigná API_BASE_OVERRIDE con la URL pública de tu API (ej. https://tu-api.railway.app).
 */

import { Platform } from 'react-native';

const API_TIMEOUT_MS = 15000;
const API_TIMEOUT_UPLOAD_MS = 60000; // 60 s para subidas (imágenes, FormData)

/**
 * URL de la API en producción. Cuando subas la API a un hosting (Railway, Vercel, etc.),
 * poné acá esa URL (con https) y generá el APK. Null = desarrollo (emulador/simulador).
 */
const API_BASE_OVERRIDE: string | null = 'https://ticketstransfer-api.vercel.app';

const API_BASE =
  API_BASE_OVERRIDE ??
  (Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001');

/** Asegura que la URL de imagen tenga protocolo (https://) para que Image pueda cargarla */
export function ensureImageUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
}

type TokenGetter = () => string | null | Promise<string | null>;
let getToken: TokenGetter = () => null;

export function setTokenGetter(fn: TokenGetter) {
  getToken = fn;
}

function isNetworkError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  return msg === 'Network request failed' || msg.includes('Network request failed');
}

const isProduction = Boolean(API_BASE_OVERRIDE);

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string | null; timeoutMs?: number } = {}
): Promise<T> {
  const tokenRes = options.token !== undefined ? options.token : getToken();
  const token = tokenRes instanceof Promise ? await tokenRes : tokenRes;
  const { token: _t, timeoutMs, ...rest } = options;
  const body = rest.body;
  const isFormData = body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(rest.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const timeout = timeoutMs ?? (isFormData ? API_TIMEOUT_UPLOAD_MS : API_TIMEOUT_MS);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...rest,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { error?: string }).error || 'Error en la solicitud');
    return data as T;
  } catch (e) {
    clearTimeout(timeoutId);
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error(
        isProduction
          ? 'La solicitud tardó demasiado. Probá de nuevo con mejor conexión a internet.'
          : 'La solicitud tardó demasiado. Comprobá que la API esté corriendo (pnpm dev en apps/api).'
      );
    }
    if (isNetworkError(e)) {
      throw new Error(
        isProduction
          ? 'No se pudo conectar al servidor. Verificá tu conexión a internet y probá de nuevo.'
          : 'No se pudo conectar al servidor. Comprobá que la API esté corriendo (pnpm dev en apps/api) y que en src/lib/api.ts la URL sea correcta (emulador Android: 10.0.2.2:3001, dispositivo físico: IP de tu PC).'
      );
    }
    throw e;
  }
}

export async function checkUsername(username: string): Promise<{ available: boolean; suggestions?: string[] }> {
  return api<{ available: boolean; suggestions?: string[] }>(
    `/api/auth/username/check?q=${encodeURIComponent(username)}`,
    { token: null }
  );
}

export async function sendEmailVerificationCode(email: string): Promise<{ ok: boolean }> {
  return api<{ ok: boolean }>('/api/auth/email/send-code', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
    token: null,
  });
}

export async function verifyEmailCode(email: string, code: string): Promise<{ ok: boolean; emailVerified: boolean }> {
  return api<{ ok: boolean; emailVerified: boolean }>('/api/auth/email/verify-code', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() }),
    token: null,
  });
}

/** Obtiene el email para login. Si el input es username (sin @), lo resuelve desde la API. */
export async function getEmailForLogin(emailOrUsername: string): Promise<string> {
  const q = emailOrUsername.trim();
  if (!q) throw new Error('Email o usuario requerido');
  if (q.includes('@')) return q.toLowerCase();
  const data = await api<{ email: string }>(`/api/auth/email-for-login?q=${encodeURIComponent(q)}`, {
    token: null,
  });
  return data.email;
}

export async function register(body: Record<string, unknown>) {
  return api<{ user: unknown; accessToken: string; refreshToken: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
    token: null,
  });
}

export async function getMe() {
  return api<Record<string, unknown>>('/api/auth/me');
}

/** Respuesta pública de marca (sin secretos). */
export type BrandingPayload = {
  commissionPercentage: number;
  marketplaceHomePublicListingsLimit: number;
  visual: Record<string, unknown>;
  users: {
    supportEmail?: string;
    helpCenterUrl?: string;
    registrationDisclaimer?: string;
  };
  notifications: Record<string, unknown>;
};

export async function getBranding(): Promise<BrandingPayload> {
  return api<BrandingPayload>('/api/settings/branding', { token: null });
}

/** Porcentaje de comisión de la plataforma (para cálculos de precio) */
export async function getCommissionPercentage(): Promise<number> {
  const data = await api<{ commissionPercentage: number }>('/api/settings/commission');
  return data.commissionPercentage ?? 6.5;
}

/** Tickets públicos para la grilla del inicio (marketplace) */
export type MarketplacePublicItem = {
  id: string;
  eventName: string;
  eventDate: string;
  eventPlace?: string | null;
  eventAddress?: string | null;
  eventCity?: string | null;
  eventImageUrl?: string | null;
  category?: string | null;
  quantityEntries?: string | null;
  /** Precio publicado cuando existe en el listing */
  price?: number | null;
  seller: { id: string; displayName: string; reputationScore: number };
};

export type EventImagePreview = {
  url: string;
  source: 'official' | 'ticketera' | 'wikimedia' | 'generated' | 'fallback';
};

export async function previewEventImage(params: {
  eventName: string;
  eventDate: string;
  eventAddress: string;
  eventCity: string;
  eventPlace?: string;
  category?: string;
  ticketera?: string;
}): Promise<EventImagePreview> {
  const q = new URLSearchParams({
    eventName: params.eventName,
    eventDate: params.eventDate,
    eventAddress: params.eventAddress,
    eventCity: params.eventCity,
    category: params.category || 'OTRO',
  });
  if (params.eventPlace) q.set('eventPlace', params.eventPlace);
  if (params.ticketera) q.set('ticketera', params.ticketera);
  return api<EventImagePreview>(`/api/tickets/event-image/preview?${q.toString()}`);
}

export async function getMarketplacePublicListings(): Promise<{ limit: number; items: MarketplacePublicItem[] }> {
  return api<{ limit: number; items: MarketplacePublicItem[] }>('/api/tickets/marketplace/public');
}

/** Todos los tickets públicos disponibles en la Tienda (hasta 100). */
export async function getMarketplaceStoreListings(): Promise<{ limit: number; items: MarketplacePublicItem[] }> {
  return api<{ limit: number; items: MarketplacePublicItem[] }>(
    '/api/tickets/marketplace/public?scope=store'
  );
}

/** Perfil */
export type Profile = {
  id: string;
  email: string;
  username: string | null;
  numeroId: string | null;
  firstName: string | null;
  lastName: string | null;
  country: string | null;
  tipoDocumento: string | null;
  phone: string | null;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  dateOfBirth: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  address: string | null;
  reputationScore: number | null;
  profileImageUrl: string | null;
  cbuCvu: string | null;
  bankName: string | null;
  kyc: { status: string; rejectionReason: string | null } | null;
};

export type ProfileUpdate = {
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  address?: string;
  fcmToken?: string;
  cbuCvu?: string;
  bankName?: string;
};

export async function getProfile(): Promise<Profile> {
  return api<Profile>('/api/users/profile');
}

export async function updateProfile(data: ProfileUpdate): Promise<Profile> {
  return api<Profile>('/api/users/profile', { method: 'PATCH', body: JSON.stringify(data) });
}

export type BiometricPreference = {
  biometricEnabled: boolean;
  biometricMethod: 'face' | 'fingerprint' | 'device' | null;
  biometricUpdatedAt: string | null;
};

export async function getBiometricPreference(): Promise<BiometricPreference> {
  return api<BiometricPreference>('/api/users/security/biometric-preference');
}

export async function updateBiometricPreference(data: {
  enabled: boolean;
  method?: 'face' | 'fingerprint' | 'device' | null;
}): Promise<{ ok: boolean; biometricEnabled: boolean; biometricMethod: 'face' | 'fingerprint' | 'device' | null }> {
  return api('/api/users/security/biometric-preference', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/** Solicitar código de verificación de teléfono */
export async function requestPhoneVerification(phone: string): Promise<{ ok: boolean }> {
  return api<{ ok: boolean }>('/api/users/phone/verify-request', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

/** Confirmar código de verificación de teléfono */
export async function confirmPhoneVerification(code: string): Promise<{ ok: boolean; phoneVerified: boolean }> {
  return api<{ ok: boolean; phoneVerified: boolean }>('/api/users/phone/verify-confirm', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

/** Subir imagen de perfil (avatar) */
export async function uploadProfileImage(formData: FormData): Promise<{ profileImageUrl: string }> {
  return api<{ profileImageUrl: string }>('/api/users/profile/avatar', {
    method: 'POST',
    body: formData,
  });
}

/** KYC – Didit */
export async function getKyc() {
  return api<{ status: string; rejectionReason?: string | null }>('/api/users/kyc');
}

/** Crear sesión Didit para KYC (platform: 'web' | 'mobile') */
export async function createKycSession(platform: 'web' | 'mobile') {
  return api<{ url: string; sessionId: string }>('/api/users/kyc/session', {
    method: 'POST',
    body: JSON.stringify({ platform }),
  });
}

/** Mis compras */
export async function getMyPurchases() {
  return api<OrderItem[]>('/api/orders/my/purchases');
}

/** Mis ventas */
export async function getMySales() {
  return api<OrderItem[]>('/api/orders/my/sales');
}

/** Mis publicaciones de tickets */
export async function getMyListings() {
  return api<TicketListingItem[]>('/api/tickets/my/listings');
}

export type MyListingDetail = TicketListingItem & {
  row?: string | null;
  seat?: string | null;
  quantityEntries?: string | null;
  visibility?: 'PUBLIC' | 'PRIVATE';
  ticketera?: string;
  appBoletos?: string;
  orderRef?: string | null;
  publicationPassword?: string | null;
  captureTicketUrl?: string | null;
  captureTicketOriginalUrl?: string | null;
  captureOwnershipUrl?: string | null;
  captureOwnershipOriginalUrl?: string | null;
  ticketeraOtra?: string | null;
  appBoletosOtra?: string | null;
  tipoEntradaOtro?: string | null;
  tipoEntrada?: string;
};

export async function getMyListingDetail(listingId: string): Promise<MyListingDetail> {
  return api<MyListingDetail>(`/api/tickets/mine/${encodeURIComponent(listingId)}`);
}

export async function updateMyListing(listingId: string, body: Record<string, unknown>): Promise<MyListingDetail> {
  return api<MyListingDetail>(`/api/tickets/mine/${encodeURIComponent(listingId)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/** Publicar ticket (multipart: body fields + captureTicket, captureOwnership) */
export async function createTicketListing(formData: FormData) {
  return api<unknown>('/api/tickets', {
    method: 'POST',
    body: formData,
  });
}

export type OrderItem = {
  id: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt?: string;
  transferDeadline?: string;
  checkoutUrl?: string;
  /** Datos de entrega / recepción del ticket indicados por el comprador */
  deliveryMethod?: 'usuario' | 'id' | 'email' | 'telefono' | 'otro' | null;
  deliveryUsername?: string | null;
  deliveryIdNumber?: string | null;
  deliveryEmail?: string | null;
  deliveryPhone?: string | null;
  deliveryOther?: string | null;
  deliveryDetail?: string | null;
  ticketListing: {
    id?: string;
    eventName: string;
    eventDate?: string;
    eventPlace?: string;
    sector?: string;
    row?: string;
    seat?: string;
    quantityEntries?: string;
    price?: number;
    currency?: string;
    captureTicketUrl?: string | null;
    captureOwnershipUrl?: string | null;
  };
  seller?: { id?: string; email?: string; reputationScore?: number };
  buyer?: { id?: string; email?: string };
  evidenceUrl?: string | null;
  buyerEvidenceUrl?: string | null;
  sellerEvidenceUrl?: string | null;
  cancelReason?: string | null;
  cancelNote?: string | null;
};

export async function uploadOrderEvidence(orderId: string, image: {
  uri: string;
  name?: string;
  type?: string;
}): Promise<{ ok: boolean; status: string }> {
  const formData = new FormData();
  formData.append('evidence', {
    uri: image.uri,
    name: image.name || `evidence-${Date.now()}.jpg`,
    type: image.type || 'image/jpeg',
  } as never);
  return api<{ ok: boolean; status: string }>(`/api/orders/${encodeURIComponent(orderId)}/evidence`, {
    method: 'POST',
    body: formData,
  });
}

export async function markTransferDone(orderId: string): Promise<{ ok: boolean }> {
  return api<{ ok: boolean }>(`/api/orders/${encodeURIComponent(orderId)}/transfer-done`, { method: 'POST' });
}

export async function confirmOrderReceived(orderId: string): Promise<{ ok: boolean }> {
  return api<{ ok: boolean }>(`/api/orders/${encodeURIComponent(orderId)}/confirm-received`, {
    method: 'POST',
    body: JSON.stringify({ received: true }),
  });
}

export async function openOrderDispute(orderId: string, reason: string): Promise<{ id: string }> {
  return api<{ id: string }>('/api/disputes', {
    method: 'POST',
    body: JSON.stringify({ orderId, reason }),
  });
}

/** Solicitud de factura de transacción (registrada para administración). POST body evita 404 en Vercel con rutas anidadas. */
export async function requestTransactionInvoice(
  orderId: string,
  body?: { note?: string }
): Promise<{ ok: boolean; id: string; alreadyExists?: boolean }> {
  return api<{ ok: boolean; id: string; alreadyExists?: boolean }>('/api/orders/invoice-request', {
    method: 'POST',
    body: JSON.stringify({ orderId, ...body }),
  });
}

export type TicketListingItem = {
  id: string;
  eventName: string;
  eventDate: string;
  eventPlace: string | null;
  sector: string | null;
  tipoEntrada: string;
  price: number;
  currency: string;
  status: string;
  createdAt: string;
};

/** Mensajería interna */
export type ConversationItem = {
  id: string;
  otherUser: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    numeroId?: string | null;
    profileImageUrl?: string | null;
  };
  lastMessage: { content: string; createdAt: string; isFromMe: boolean; readAt?: string | null } | null;
  hasUnread?: boolean;
  updatedAt: string;
};

export type MessageItem = {
  id: string;
  content: string;
  senderId: string;
  sender: { id: string; email: string; firstName?: string | null; lastName?: string | null };
  isFromMe: boolean;
  createdAt: string;
};

export type UserSearchItem = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  numeroId?: string | null;
};

export async function getConversations(): Promise<ConversationItem[]> {
  return api<ConversationItem[]>('/api/messages/conversations');
}

export async function getConversationById(conversationId: string): Promise<{
  id: string;
  otherUser: ConversationItem['otherUser'];
}> {
  return api(`/api/messages/conversations/${encodeURIComponent(conversationId)}`);
}

export async function searchUsers(q: string): Promise<UserSearchItem[]> {
  return api<UserSearchItem[]>(`/api/messages/users/search?q=${encodeURIComponent(q)}`);
}

export async function createOrGetConversation(otherUserId: string): Promise<{
  id: string;
  otherUser: UserSearchItem;
  createdAt: string;
}> {
  return api('/api/messages/conversations', {
    method: 'POST',
    body: JSON.stringify({ otherUserId }),
  });
}

export async function getConversationMessages(
  conversationId: string,
  options?: { skipMarkRead?: boolean }
): Promise<MessageItem[]> {
  const q =
    options?.skipMarkRead === true
      ? `?skipMarkRead=1`
      : '';
  return api<MessageItem[]>(`/api/messages/conversations/${conversationId}/messages${q}`);
}

export async function sendMessageToConversation(
  conversationId: string,
  content: string
): Promise<MessageItem> {
  return api<MessageItem>(`/api/messages/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

/** Tarjetas adheridas (Checkout API) */
export type CardItem = {
  id: string;
  last_four_digits: string;
  payment_method: { id: string; name: string };
};

export async function getUserCards(): Promise<{ cards: CardItem[] }> {
  return api<{ cards: CardItem[] }>('/api/users/cards');
}

/** Email del payer para el Brick (cuando sandboxUseRealEmail usa email real) */
export async function getPayerEmail(): Promise<string> {
  const data = await api<{ payerEmail: string }>('/api/mercadopago/payer-email');
  return data.payerEmail;
}

export async function addUserCard(token: string): Promise<{ card: CardItem }> {
  return api<{ card: CardItem }>('/api/users/cards', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export async function removeUserCard(cardId: string): Promise<{ ok: boolean }> {
  return api<{ ok: boolean }>(`/api/users/cards/${cardId}`, { method: 'DELETE' });
}

/** URL base de la API (para WebView baseUrl) */
export function getApiBase(): string {
  return API_BASE;
}

/** URL del formulario de tarjeta para WebView (legacy, preferir HTML embebido) */
export function getCardFormUrl(): string {
  return `${API_BASE}/api/mercadopago/card-form`;
}

/** Pago de orden con tarjeta (Checkout API) */
export async function payOrderWithCard(
  orderId: string,
  params: { token: string; paymentMethodId: string; issuerId?: number }
): Promise<{ paymentId: string; status: string; statusDetail?: string; orderStatus: string }> {
  return api(`/api/orders/${orderId}/pay`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
