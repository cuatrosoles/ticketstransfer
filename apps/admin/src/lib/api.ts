const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getToken(): string | null {
  return localStorage.getItem('adminToken');
}

export async function api<T>(path: string, options: RequestInit & { token?: string | null } = {}): Promise<T> {
  const { token = getToken(), ...rest } = options;
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

export async function login(email: string, password: string) {
  const data = await api<{ user: { role: string }; accessToken: string; refreshToken: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    token: null,
  });
  if (data.user.role !== 'admin') throw new Error('Acceso solo para administradores');
  return data;
}

export async function getMe() {
  return api<{ id: string; email: string; role: string }>('/api/auth/me');
}
