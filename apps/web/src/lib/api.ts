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

/** Login se hace con Firebase Auth en el cliente. */
export async function login(_email: string, _password: string) {
  throw new Error('Usá Firebase Auth: signInWithEmailAndPassword en AuthContext');
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
  firstName: string | null;
  lastName: string | null;
  country: string | null;
  tipoDocumento: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  reputationScore: number | null;
  kyc: { status: string; rejectionReason: string | null } | null;
};

export async function getProfile(): Promise<Profile> {
  return api<Profile>('/api/users/profile');
}

export type ProfileUpdate = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  province?: string;
  postalCode?: string;
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
