/**
 * Cliente API para Tickets Transfer.
 * Usa Firebase ID token para autenticación.
 */

import { auth } from './firebase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function getToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken(true);
  } catch {
    return null;
  }
}

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const token = options.token !== undefined ? options.token : await getToken();
  const { token: _t, ...rest } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(rest.headers as HeadersInit),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...rest, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Error en la solicitud');
  }
  return data as T;
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
  const data = await api<{ user: unknown; customToken: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
    token: null,
  });
  return data;
}

/** Subida de archivos (FormData). */
export async function apiUpload<T = unknown>(path: string, formData: FormData, method = 'POST'): Promise<T> {
  const token = await getToken();
  const headers: HeadersInit = {};
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { method, headers, body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data as T;
}

export async function getMe() {
  return api<Record<string, unknown>>('/api/auth/me');
}

export type Profile = {
  id: string;
  email: string;
  username: string | null;
  numeroId?: string | null;
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
  cbuCvu: string | null;
  bankName: string | null;
  reputationScore: number | null;
  kyc: { status: string; rejectionReason: string | null } | null;
};

export async function getProfile(): Promise<Profile> {
  return api<Profile>('/api/users/profile');
}

export type ProfileUpdate = {
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  address?: string;
  cbuCvu?: string;
  bankName?: string;
};

export async function updateProfile(data: ProfileUpdate): Promise<Profile> {
  return api<Profile>('/api/users/profile', { method: 'PATCH', body: JSON.stringify(data) });
}

/** Crear sesión Didit para KYC (platform: 'web' | 'mobile') */
export async function createKycSession(platform: 'web' | 'mobile') {
  return api<{ url: string; sessionId: string }>('/api/users/kyc/session', {
    method: 'POST',
    body: JSON.stringify({ platform }),
  });
}

export async function getKyc() {
  return api<{ status: string; rejectionReason?: string | null }>('/api/users/kyc');
}

/** Publicar ticket (multipart: body + captureTicket, captureOwnership). Opcional: pixelateRegions (Fase 2). */
export async function createTicketListing(formData: FormData) {
  return apiUpload<{ id: string }>('/api/tickets', formData);
}

export type TicketListingItem = {
  id: string;
  eventName: string;
  eventDate: string;
  eventPlace?: string | null;
  sector?: string | null;
  tipoEntrada: string;
  price: number;
  currency: string;
  status: string;
  createdAt: string;
};

export async function getMyListings() {
  return api<TicketListingItem[]>('/api/tickets/my/listings');
}

export type MyListingDetail = TicketListingItem & {
  row?: string | null;
  seat?: string | null;
  quantityEntries?: string | null;
  orderRef?: string | null;
  publicationPassword?: string | null;
  captureTicketUrl?: string | null;
  captureOwnershipUrl?: string | null;
  ticketera?: string;
  appBoletos?: string;
  ticketeraOtra?: string | null;
  appBoletosOtra?: string | null;
  tipoEntrada?: string;
  tipoEntradaOtro?: string | null;
};

export async function getMyListingDetail(listingId: string): Promise<MyListingDetail> {
  return api<MyListingDetail>(`/api/tickets/mine/${encodeURIComponent(listingId)}`);
}

export async function updateMyListing(listingId: string, doc: Record<string, unknown>): Promise<MyListingDetail> {
  return api<MyListingDetail>(`/api/tickets/mine/${encodeURIComponent(listingId)}`, {
    method: 'PATCH',
    body: JSON.stringify(doc),
  });
}

export function ensureImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
}

export type CardItem = {
  id: string;
  last_four_digits: string;
  payment_method: { id: string; name: string };
};

export async function getUserCards(): Promise<{ cards: CardItem[] }> {
  return api<{ cards: CardItem[] }>('/api/users/cards');
}

export async function addUserCard(token: string): Promise<{ card: CardItem }> {
  return api<{ card: CardItem }>('/api/users/cards', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export async function removeUserCard(cardId: string): Promise<{ ok: boolean }> {
  return api<{ ok: boolean }>(`/api/users/cards/${encodeURIComponent(cardId)}`, { method: 'DELETE' });
}

export type OrderItem = {
  id: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  ticketListing: { id: string; eventName?: string; eventDate?: string; price?: number } | null;
  buyer?: { email?: string } | null;
  /** Datos de recepción del ticket (comprador) */
  deliveryMethod?: 'usuario' | 'id' | 'email' | 'telefono' | 'otro' | null;
  deliveryUsername?: string | null;
  deliveryIdNumber?: string | null;
  deliveryEmail?: string | null;
  deliveryPhone?: string | null;
  deliveryOther?: string | null;
  deliveryDetail?: string | null;
};

export async function getMySales() {
  return api<OrderItem[]>('/api/orders/my/sales');
}
