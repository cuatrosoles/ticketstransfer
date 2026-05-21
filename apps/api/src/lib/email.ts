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

type PaymentEmailParams = { orderId: string; eventName: string; amountLabel?: string };

export async function sendPaymentApprovedBuyerEmail(
  to: string,
  params: PaymentEmailParams
): Promise<{ ok: boolean; error?: string }> {
  const subject = 'Pago confirmado - Tickets Transfer';
  const html = `
    <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto;">
      <h2 style="color: #1e293b;">¡Pago confirmado!</h2>
      <p>Tu compra de <strong>${params.eventName}</strong> fue acreditada correctamente.</p>
      ${params.amountLabel ? `<p style="font-size: 18px; font-weight: bold; color: #22c55e;">${params.amountLabel}</p>` : ''}
      <p style="color: #64748b; font-size: 14px;">El vendedor debe transferirte el ticket en las próximas horas. Podés seguir el estado desde <strong>Mis compras</strong> en la app.</p>
      <p style="color: #64748b; font-size: 12px;">Orden: ${params.orderId}</p>
      <p style="color: #64748b; font-size: 12px;">— Tickets Transfer</p>
    </div>
  `;
  return sendHtmlEmail(to, subject, html);
}

export async function sendPaymentApprovedSellerEmail(
  to: string,
  params: PaymentEmailParams
): Promise<{ ok: boolean; error?: string }> {
  const subject = '¡Nueva venta! Pago recibido - Tickets Transfer';
  const html = `
    <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto;">
      <h2 style="color: #1e293b;">¡Vendiste un ticket!</h2>
      <p>El comprador pagó <strong>${params.eventName}</strong>. El dinero queda retenido hasta que transfieras el ticket y se valide la entrega.</p>
      ${params.amountLabel ? `<p style="font-size: 18px; font-weight: bold; color: #22c55e;">${params.amountLabel}</p>` : ''}
      <p style="color: #64748b; font-size: 14px;">Ingresá a la app → <strong>Mis ventas</strong> y marcá la transferencia cuando envíes el ticket al comprador.</p>
      <p style="color: #64748b; font-size: 12px;">Orden: ${params.orderId}</p>
      <p style="color: #64748b; font-size: 12px;">— Tickets Transfer</p>
    </div>
  `;
  return sendHtmlEmail(to, subject, html);
}

export async function sendPaymentFailedBuyerEmail(
  to: string,
  params: { orderId: string; eventName: string }
): Promise<{ ok: boolean; error?: string }> {
  const subject = 'Pago no completado - Tickets Transfer';
  const html = `
    <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto;">
      <h2 style="color: #1e293b;">Pago no completado</h2>
      <p>No se acreditó el pago de <strong>${params.eventName}</strong>. Podés reintentar desde la app.</p>
      <p style="color: #64748b; font-size: 12px;">Orden: ${params.orderId}</p>
      <p style="color: #64748b; font-size: 12px;">— Tickets Transfer</p>
    </div>
  `;
  return sendHtmlEmail(to, subject, html);
}

export async function sendPaymentPendingBuyerEmail(
  to: string,
  params: { orderId: string; eventName: string }
): Promise<{ ok: boolean; error?: string }> {
  const subject = 'Pago pendiente - Tickets Transfer';
  const html = `
    <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto;">
      <h2 style="color: #1e293b;">Pago en proceso</h2>
      <p>Tu pago de <strong>${params.eventName}</strong> está pendiente de acreditación. Te avisaremos cuando se confirme.</p>
      <p style="color: #64748b; font-size: 12px;">Orden: ${params.orderId}</p>
      <p style="color: #64748b; font-size: 12px;">— Tickets Transfer</p>
    </div>
  `;
  return sendHtmlEmail(to, subject, html);
}

export async function sendNewSaleAdminEmail(
  to: string,
  params: PaymentEmailParams
): Promise<{ ok: boolean; error?: string }> {
  const subject = `[Admin] Nueva venta pagada - ${params.eventName}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto;">
      <h2 style="color: #1e293b;">Nueva venta pagada</h2>
      <p><strong>${params.eventName}</strong></p>
      ${params.amountLabel ? `<p>${params.amountLabel}</p>` : ''}
      <p style="color: #64748b; font-size: 14px;">Revisá la orden en el panel de administración. El pago al vendedor se libera cuando marques la orden como <strong>COMPLETADA</strong> tras validar la entrega del ticket.</p>
      <p style="color: #64748b; font-size: 12px;">Orden: ${params.orderId}</p>
    </div>
  `;
  return sendHtmlEmail(to, subject, html);
}

async function sendHtmlEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  if (!resend) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEV] Email:', subject, '→', to);
    }
    return { ok: true };
  }
  const { error } = await resend.emails.send({ from: FROM_EMAIL, to: [to], subject, html });
  if (error) {
    console.error('[Email] Error:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
