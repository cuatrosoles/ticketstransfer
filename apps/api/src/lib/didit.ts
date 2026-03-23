/**
 * Servicio Didit para verificación de identidad (KYC).
 * Documentación: https://docs.didit.me
 *
 * Uso: configurar DIDIT_API_KEY en .env (obtener en business.didit.me)
 */

const DIDIT_BASE = 'https://verification.didit.me';
const DIDIT_API_KEY = process.env.DIDIT_API_KEY;
const DIDIT_WORKFLOW_ID = process.env.DIDIT_WORKFLOW_ID;

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
  if (!DIDIT_WORKFLOW_ID) {
    throw new Error(
      'DIDIT_WORKFLOW_ID no configurado. Creá un workflow en business.didit.me → Verifications → Workflows y copiá el ID.'
    );
  }

  const body = {
    workflow_id: DIDIT_WORKFLOW_ID,
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

/** Respuesta de Retrieve Session (GET /v3/session/{sessionId}/decision/) */
export type DiditSessionDecision = {
  session_id: string;
  session_number?: number;
  session_url?: string;
  status?: string;
  workflow_id?: string;
  features?: string[];
  vendor_data?: string;
  id_verifications?: Array<{
    node_id?: string;
    status?: string;
    document_type?: string;
    document_number?: string;
    personal_number?: string;
    portrait_image?: string;
    front_image?: string;
    back_image?: string;
    front_video?: string;
    back_video?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    date_of_birth?: string;
    address?: string;
    formatted_address?: string;
    expiration_date?: string;
    issuing_state?: string;
    front_image_camera_front_face_match_score?: number;
    back_image_camera_front_face_match_score?: number;
  }>;
  liveness_verifications?: Array<{
    status?: string;
    liveness_score?: number;
    selfie_image?: string;
    selfie_video?: string;
  }>;
};

export type GetDiditSessionResult =
  | { ok: true; data: DiditSessionDecision }
  | { ok: false; status: number; message: string; detail?: string };

/** Obtener detalles completos de una sesión Didit. Retorna error detallado en lugar de null. */
export async function getDiditSessionDecision(
  sessionId: string
): Promise<GetDiditSessionResult> {
  if (!DIDIT_API_KEY) {
    return { ok: false, status: 0, message: 'DIDIT_API_KEY no configurado' };
  }
  if (!sessionId?.trim()) {
    return { ok: false, status: 0, message: 'sessionId vacío' };
  }

  const url = `${DIDIT_BASE}/v3/session/${encodeURIComponent(sessionId.trim())}/decision/`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'X-Api-Key': DIDIT_API_KEY },
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const detail = (data.detail as string) ?? (data.message as string) ?? JSON.stringify(data);
    return {
      ok: false,
      status: res.status,
      message:
        res.status === 401
          ? 'API key inválida (401). Verificá DIDIT_API_KEY en Vercel.'
          : res.status === 404
            ? `Sesión no encontrada en Didit (404). Session ID: ${sessionId.slice(0, 8)}...`
            : `Didit respondió ${res.status}: ${String(detail).slice(0, 200)}`,
      detail: String(detail).slice(0, 300),
    };
  }

  return { ok: true, data: data as DiditSessionDecision };
}

/** Actualizar estado de sesión Didit (aprobación/rechazo manual, resubmit) */
export async function updateDiditSessionStatus(
  sessionId: string,
  params: {
    new_status: 'Approved' | 'Declined' | 'Resubmitted';
    comment?: string;
    send_email?: boolean;
    email_address?: string;
    email_language?: string;
  }
): Promise<{ ok: boolean; error?: string }> {
  if (!DIDIT_API_KEY) {
    return { ok: false, error: 'DIDIT_API_KEY no configurado' };
  }
  if (!sessionId) return { ok: false, error: 'sessionId requerido' };

  const res = await fetch(`${DIDIT_BASE}/v3/session/${sessionId}/update-status/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': DIDIT_API_KEY,
    },
    body: JSON.stringify({
      new_status: params.new_status,
      ...(params.comment && { comment: params.comment }),
      ...(params.send_email && { send_email: params.send_email }),
      ...(params.email_address && { email_address: params.email_address }),
      ...(params.email_language && { email_language: params.email_language }),
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { detail?: string }).detail || (data as { message?: string }).message || 'Error Didit';
    return { ok: false, error: msg };
  }
  return { ok: true };
}

function shortenFloats(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map(shortenFloats);
  }
  if (data !== null && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, shortenFloats(v)])
    );
  }
  if (typeof data === 'number' && !Number.isInteger(data) && data % 1 === 0) {
    return Math.trunc(data);
  }
  return data;
}

function sortKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((acc: Record<string, unknown>, key) => {
        acc[key] = sortKeys((obj as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return obj;
}

/** Verifica X-Signature (raw body) - requiere raw body exacto */
export async function verifyDiditWebhookSignature(
  rawBody: string,
  signature: string | undefined,
  timestamp: string | undefined,
  secretKey: string
): Promise<boolean> {
  if (!signature || !timestamp || !secretKey) return false;

  const WEBHOOK_MAX_AGE_SEC = 300; // 5 minutos
  const currentTime = Math.floor(Date.now() / 1000);
  const incomingTime = parseInt(timestamp, 10);
  if (Math.abs(currentTime - incomingTime) > WEBHOOK_MAX_AGE_SEC) return false;

  const crypto = await import('crypto');
  const hmac = crypto.createHmac('sha256', secretKey);
  const expectedSignature = hmac.update(rawBody, 'utf8').digest('hex');

  try {
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const providedBuf = Buffer.from(signature, 'utf8');
    return expectedBuf.length === providedBuf.length && crypto.timingSafeEqual(expectedBuf, providedBuf);
  } catch {
    return false;
  }
}

/** Verifica X-Signature-V2 (recomendado por Didit - soporta re-encoding de middleware) */
export async function verifyDiditWebhookSignatureV2(
  jsonBody: Record<string, unknown>,
  signature: string | undefined,
  timestamp: string | undefined,
  secretKey: string
): Promise<boolean> {
  if (!signature || !timestamp || !secretKey) return false;

  const WEBHOOK_MAX_AGE_SEC = 300;
  const currentTime = Math.floor(Date.now() / 1000);
  const incomingTime = parseInt(timestamp, 10);
  if (Math.abs(currentTime - incomingTime) > WEBHOOK_MAX_AGE_SEC) return false;

  const processed = shortenFloats(jsonBody) as Record<string, unknown>;
  const canonical = JSON.stringify(sortKeys(processed));

  const crypto = await import('crypto');
  const hmac = crypto.createHmac('sha256', secretKey);
  const expectedSignature = hmac.update(canonical, 'utf8').digest('hex');

  try {
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const providedBuf = Buffer.from(signature, 'utf8');
    return expectedBuf.length === providedBuf.length && crypto.timingSafeEqual(expectedBuf, providedBuf);
  } catch {
    return false;
  }
}

/** Verifica X-Signature-Simple (fallback - verifica solo campos core) */
export async function verifyDiditWebhookSignatureSimple(
  jsonBody: Record<string, unknown>,
  signature: string | undefined,
  timestamp: string | undefined,
  secretKey: string
): Promise<boolean> {
  if (!signature || !timestamp || !secretKey) return false;

  const WEBHOOK_MAX_AGE_SEC = 300;
  const currentTime = Math.floor(Date.now() / 1000);
  const incomingTime = parseInt(timestamp, 10);
  if (Math.abs(currentTime - incomingTime) > WEBHOOK_MAX_AGE_SEC) return false;

  const canonical = [
    String(jsonBody.timestamp ?? ''),
    String(jsonBody.session_id ?? ''),
    String(jsonBody.status ?? ''),
    String(jsonBody.webhook_type ?? ''),
  ].join(':');

  const crypto = await import('crypto');
  const hmac = crypto.createHmac('sha256', secretKey);
  const expectedSignature = hmac.update(canonical, 'utf8').digest('hex');

  try {
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const providedBuf = Buffer.from(signature, 'utf8');
    return expectedBuf.length === providedBuf.length && crypto.timingSafeEqual(expectedBuf, providedBuf);
  } catch {
    return false;
  }
}
