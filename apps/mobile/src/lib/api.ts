/**
 * Cliente API – Tickets Transfer móvil
 * Ubicación: apps/mobile/src/lib/api.ts
 *
 * - Desarrollo: API_BASE_OVERRIDE = null → emulador Android 10.0.2.2, simulador iOS localhost.
 * - Producción (APK para clientes): asigná API_BASE_OVERRIDE con la URL pública de tu API (ej. https://tu-api.railway.app).
 */

import { Platform } from 'react-native';

const API_TIMEOUT_MS = 15000;

/**
 * URL de la API en producción. Cuando subas la API a un hosting (Railway, Hostinger, etc.),
 * poné acá esa URL (con https) y generá el APK. Null = desarrollo (emulador/simulador).
 */
const API_BASE_OVERRIDE: string | null = 'https://ticketstransfer-production.up.railway.app';

const API_BASE =
  API_BASE_OVERRIDE ??
  (Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001');

/*
const API_BASE =
  API_BASE_OVERRIDE ??
  (Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001');
*/

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

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const tokenRes = options.token !== undefined ? options.token : getToken();
  const token = tokenRes instanceof Promise ? await tokenRes : tokenRes;
  const { token: _t, ...rest } = options;
  const body = rest.body;
  const isFormData = body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(rest.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

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
      throw new Error('La solicitud tardó demasiado. Comprobá que la API esté corriendo (pnpm dev en apps/api).');
    }
    if (isNetworkError(e)) {
      throw new Error(
        'No se pudo conectar al servidor. Comprobá que la API esté corriendo (pnpm dev en apps/api) y que en src/lib/api.ts la URL sea correcta (emulador Android: 10.0.2.2:3001, dispositivo físico: IP de tu PC).'
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

export async function login(email: string, password: string) {
  return api<{ user: unknown; accessToken: string; refreshToken: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    token: null,
  });
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
  dateOfBirth: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  reputationScore: number | null;
  profileImageUrl: string | null;
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
  fcmToken?: string;
};

export async function getProfile(): Promise<Profile> {
  return api<Profile>('/api/users/profile');
}

export async function updateProfile(data: ProfileUpdate): Promise<Profile> {
  return api<Profile>('/api/users/profile', { method: 'PATCH', body: JSON.stringify(data) });
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
  ticketListing: { eventName: string; eventDate?: string; price?: number };
  seller?: { email?: string };
  buyer?: { email?: string };
};

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

export async function getConversationMessages(conversationId: string): Promise<MessageItem[]> {
  return api<MessageItem[]>(`/api/messages/conversations/${conversationId}/messages`);
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
