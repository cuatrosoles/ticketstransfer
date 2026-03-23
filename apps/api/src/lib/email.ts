/**
 * Envío de emails con Resend.
 * https://resend.com – Plan gratuito: 100 emails/día.
 *
 * Si RESEND_API_KEY no está configurado, no se envía email (fallback a console en dev).
 */

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/** Email de remitente para códigos de verificación. Producción: usar dominio verificado. */
const FROM_EMAIL = process.env.EMAIL_FROM_VERIFICATION || 'Tickets Transfer <onboarding@resend.dev>';

export async function sendVerificationCodeEmail(to: string, code: string): Promise<{ ok: boolean; error?: string }> {
  if (!resend) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEV] Código de verificación de email para', to, ':', code);
    }
    return { ok: true };
  }

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [to],
    subject: 'Tu código de verificación - Tickets Transfer',
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Verificación de email</h2>
        <p>Tu código de verificación es:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 8px; color: #3b82f6;">${code}</p>
        <p style="color: #64748b; font-size: 14px;">Este código expira en 10 minutos. Si no solicitaste este código, no hagas nada.</p>
        <p style="color: #64748b; font-size: 12px;">— Tickets Transfer</p>
      </div>
    `,
  });

  if (error) {
    console.error('[Email] Error al enviar:', error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

/** Notificar al vendedor que se liberó el pago de su venta */
export async function sendTransferCompleteEmail(
  to: string,
  params: { orderId: string; amount: number; currency: string }
): Promise<{ ok: boolean; error?: string }> {
  if (!resend) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEV] Notificación de pago liberado para', to, params);
    }
    return { ok: true };
  }

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: [to],
    subject: 'Pago liberado - Tickets Transfer',
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
        <h2 style="color: #1e293b;">Pago liberado</h2>
        <p>Se realizó la transferencia del pago de tu venta (orden ${params.orderId}).</p>
        <p style="font-size: 20px; font-weight: bold; color: #22c55e;">${params.currency} ${params.amount.toLocaleString('es-AR')}</p>
        <p style="color: #64748b; font-size: 14px;">El dinero debería acreditarse en tu cuenta en 1-3 días hábiles.</p>
        <p style="color: #64748b; font-size: 12px;">— Tickets Transfer</p>
      </div>
    `,
  });

  if (error) {
    console.error('[Email] Error al enviar notificación de transferencia:', error);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
