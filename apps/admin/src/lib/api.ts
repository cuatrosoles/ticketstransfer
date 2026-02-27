const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
import { auth } from './firebase';

async function getToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken(true);
  } catch {
    return null;
  }
}

export async function api<T>(path: string, options: RequestInit & { token?: string | null } = {}): Promise<T> {
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
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data as T;
}

export async function login(_email: string, _password: string) {
  throw new Error('Usá Firebase Auth en AuthContext');
}

export async function getMe() {
  return api<{ id: string; email: string; role: string }>('/api/auth/me');
}
