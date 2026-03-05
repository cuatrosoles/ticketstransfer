/**
 * Envío de SMS con Twilio.
 * https://www.twilio.com – Verificación de teléfono en producción.
 *
 * Requiere: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 */

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client =
  accountSid && authToken ? twilio(accountSid, authToken) : null;

/** Normaliza teléfono a formato E.164 para Argentina (+54...) */
function normalizePhone(phone: string): string {
  let p = phone.replace(/\s/g, '').replace(/-/g, '');
  if (!p.startsWith('+')) {
    if (p.startsWith('0')) p = p.slice(1);
    if (!p.startsWith('54')) p = '54' + p;
    p = '+' + p;
  }
  return p;
}

export async function sendVerificationSms(
  phone: string,
  code: string
): Promise<{ ok: boolean; error?: string }> {
  if (!client || !fromNumber) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEV] Código de verificación para', phone, ':', code);
      return { ok: true };
    }
    return { ok: false, error: 'SMS no configurado. Configurá Twilio (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER).' };
  }

  try {
    const to = normalizePhone(phone);
    const body = `Tu código de verificación Tickets Transfer: ${code}. Válido 10 minutos.`;

    await client.messages.create({
      body,
      from: fromNumber,
      to,
    });

    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[SMS] Error al enviar:', e);
    return { ok: false, error: msg };
  }
}
