/**
 * Servicio Didit para verificación de identidad (KYC).
 * Documentación: https://docs.didit.me
 *
 * Uso: configurar DIDIT_API_KEY en .env (obtener en business.didit.me)
 */

const DIDIT_BASE = 'https://verification.didit.me';
const DIDIT_API_KEY = process.env.DIDIT_API_KEY;

export type DiditSessionResponse = {
  session_id: string;
  session_number?: number;
  session_token?: string;
  vendor_data?: string;
  status?: string;
  callback?: string;
  url: string;
  features?: string;
};

export type DiditCreateSessionParams = {
  callback: string;
  vendor_data: string;
  features?: string;
};

export async function createDiditSession(params: DiditCreateSessionParams): Promise<DiditSessionResponse> {
  if (!DIDIT_API_KEY) {
    throw new Error('DIDIT_API_KEY no configurado. Configurá en business.didit.me y en .env');
  }

  const body = {
    callback: params.callback,
    vendor_data: params.vendor_data,
    ...(params.features && { features: params.features }),
  };

  const res = await fetch(`${DIDIT_BASE}/v3/session/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': DIDIT_API_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = (data as { message?: string }).message || data?.detail || JSON.stringify(data);
    throw new Error(`Didit: ${msg}`);
  }

  if (!data.url) {
    // Fallback: v2 API usa workflow_id, v1 usa url
    const url = data.session_url || (data.session_token ? `https://verify.didit.me/session/${data.session_token}` : null);
    if (!url) throw new Error('Didit no devolvió URL de sesión');
    return { ...data, url };
  }

  return data as DiditSessionResponse;
}

export async function verifyDiditWebhookSignature(
  rawBody: string,
  signature: string | undefined,
  timestamp: string | undefined,
  secretKey: string
): boolean {
  if (!signature || !timestamp || !secretKey) return false;

  const WEBHOOK_MAX_AGE_SEC = 300; // 5 minutos
  const currentTime = Math.floor(Date.now() / 1000);
  const incomingTime = parseInt(timestamp, 10);
  if (Math.abs(currentTime - incomingTime) > WEBHOOK_MAX_AGE_SEC) return false;

  const crypto = await import('crypto');
  const hmac = crypto.createHmac('sha256', secretKey);
  const expectedSignature = hmac.update(rawBody).digest('hex');

  try {
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const providedBuf = Buffer.from(signature, 'utf8');
    return expectedBuf.length === providedBuf.length && crypto.timingSafeEqual(expectedBuf, providedBuf);
  } catch {
    return false;
  }
}
