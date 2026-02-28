/**
 * Pantalla de pago (orden) – Mercado Pago Checkout Pro / escrow.
 * Ubicación: apps/web/src/pages/Pago.tsx
 */

import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

type Order = {
  id: string;
  totalAmount: number;
  currency: string;
  status: string;
  ticketListing?: { eventName: string };
  checkoutUrl?: string;
};

export function Pago() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(
    (location.state as { checkoutUrl?: string } | null)?.checkoutUrl ?? null
  );

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    api<Order>(`/api/orders/${id}`)
      .then((o) => {
        setOrder(o);
        setCheckoutUrl((prev) => prev || o.checkoutUrl || null);
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !order || order.status !== 'PENDIENTE_PAGO' || checkoutUrl) return;
    api<{ checkoutUrl: string }>(`/api/orders/${id}/checkout-url`)
      .then((r) => setCheckoutUrl(r.checkoutUrl))
      .catch(() => {});
  }, [id, order?.status, checkoutUrl]);

  const payWithMercadoPago = () => {
    if (checkoutUrl) window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
  };

  const searchParams = new URLSearchParams(location.search);
  const statusParam = searchParams.get('status');

  if (loading) return <div className="page-content"><div className="loader" /></div>;
  if (!order) return <div className="page-content"><p className="text-muted">No se encontró la orden.</p></div>;

  const isPendingPayment = order.status === 'PENDIENTE_PAGO';
  const isWaitingTransfer =
    ['ESPERANDO_TRANSFERENCIA', 'TRANSFERIDO_VENDEDOR', 'ESPERANDO_CONFIRMACION_COMPRADOR', 'EVIDENCIA_SUBIDA', 'VERIFICANDO'].includes(
      order.status
    );

  return (
    <div className="page-content">
      <h1 className="page-title">Pago</h1>
      <div className="glass pago-card">
        <p><strong>{order.ticketListing?.eventName ?? 'Orden'}</strong></p>
        <p className="ticket-total">Total: {order.currency} {order.totalAmount.toLocaleString('es-AR')}</p>
        <p className="escrow-notice">
          Tu dinero será retenido hasta que el vendedor transfiera el ticket a tu cuenta oficial.
        </p>

        {statusParam === 'success' && isPendingPayment && (
          <p className="text-success">Procesando tu pago… Recargá en unos segundos.</p>
        )}
        {statusParam === 'pending' && (
          <p className="text-muted">Tu pago está pendiente. Te avisaremos cuando se acredite.</p>
        )}
        {statusParam === 'failure' && (
          <p className="form-error">El pago no se completó. Intentá de nuevo.</p>
        )}

        {isPendingPayment && checkoutUrl && (
          <button type="button" className="btn-primary mt-2" onClick={payWithMercadoPago}>
            Pagar con Mercado Pago
          </button>
        )}
        {isPendingPayment && !checkoutUrl && (
          <p className="text-muted">Generando link de pago…</p>
        )}
        {isWaitingTransfer && (
          <p className="text-success">Pago recibido. Esperando la transferencia del vendedor.</p>
        )}
        {order.status === 'COMPLETADA' && (
          <p className="text-success">¡Orden completada!</p>
        )}
        {!isPendingPayment && !isWaitingTransfer && order.status !== 'COMPLETADA' && (
          <p className="text-muted">Estado: {order.status}</p>
        )}
      </div>
    </div>
  );
}
