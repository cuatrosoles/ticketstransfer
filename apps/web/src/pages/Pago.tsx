/**
 * Pantalla de pago (orden) – Confirmar pago con Mercado Pago / escrow.
 * Ubicación: apps/web/src/pages/Pago.tsx
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

type Order = {
  id: string;
  totalAmount: number;
  currency: string;
  status: string;
  ticketListing?: { eventName: string };
};

export function Pago() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    api<Order>(`/api/orders/${id}`)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  const confirmPayment = async () => {
    if (!id) return;
    try {
      await api(`/api/orders/${id}/confirm-payment`, { method: 'POST' });
      navigate('/mis-compras');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al confirmar pago');
    }
  };

  if (loading) return <div className="page-content"><div className="loader" /></div>;
  if (!order) return <div className="page-content"><p className="text-muted">No se encontró la orden.</p></div>;

  return (
    <div className="page-content">
      <h1 className="page-title">Confirmar pago</h1>
      <div className="glass pago-card">
        <p><strong>{order.ticketListing?.eventName ?? 'Orden'}</strong></p>
        <p className="ticket-total">Total: {order.currency} {order.totalAmount.toLocaleString('es-AR')}</p>
        <p className="escrow-notice">
          Tu dinero será retenido hasta que el vendedor transfiera el ticket a tu cuenta oficial.
        </p>
        {order.status === 'PENDIENTE_PAGO' && (
          <button type="button" className="btn-primary mt-2" onClick={confirmPayment}>
            Confirmar pago
          </button>
        )}
        {order.status !== 'PENDIENTE_PAGO' && (
          <p className="text-muted">Esta orden ya fue procesada.</p>
        )}
      </div>
    </div>
  );
}
