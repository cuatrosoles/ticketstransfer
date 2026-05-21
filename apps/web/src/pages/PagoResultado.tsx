/**
 * Resultado del pago Mercado Pago (retorno desde checkout).
 */

import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

type OrderSummary = {
  id: string;
  status: string;
  totalAmount: number;
  currency: string;
  ticketListing?: { eventName: string };
};

async function syncOrderPayment(orderId: string) {
  return api<{ orderStatus: string; paymentStatus: string | null; synced: boolean }>(
    `/api/orders/${orderId}/sync-payment`,
    { method: 'POST' }
  );
}

export function PagoResultado() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const returnStatus = searchParams.get('status') === 'failure' ? 'failure' : searchParams.get('status') === 'pending' ? 'pending' : 'success';

  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Procesando tu pago…');

  const loadOrder = useCallback(async () => {
    if (!id) return null;
    const o = await api<OrderSummary>(`/api/orders/${id}`);
    setOrder(o);
    return o;
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    void (async () => {
      try {
        let o = await loadOrder();
        let status = o?.status || 'PENDIENTE_PAGO';

        if (returnStatus === 'success' && status === 'PENDIENTE_PAGO') {
          for (let i = 0; i < 8 && !cancelled && status === 'PENDIENTE_PAGO'; i++) {
            const sync = await syncOrderPayment(id);
            status = sync.orderStatus;
            o = await loadOrder();
            status = o?.status || status;
            if (status !== 'PENDIENTE_PAGO') break;
            await new Promise((r) => setTimeout(r, 2000));
          }
        } else if (returnStatus === 'pending') {
          await syncOrderPayment(id).catch(() => {});
          o = await loadOrder();
          status = o?.status || status;
        }

        if (cancelled) return;

        const paid =
          status === 'ESPERANDO_TRANSFERENCIA' ||
          ['TRANSFERIDO_VENDEDOR', 'ESPERANDO_CONFIRMACION_COMPRADOR', 'EVIDENCIA_SUBIDA', 'COMPLETADA'].includes(status);

        if (paid) {
          setMessage(
            '¡Pago confirmado! El vendedor fue notificado y debe transferirte el ticket. Podés seguir el estado desde Mis compras.'
          );
        } else if (returnStatus === 'failure') {
          setMessage('El pago no se completó. Podés reintentar desde la pantalla de pago.');
        } else if (returnStatus === 'pending') {
          setMessage('Tu pago está pendiente de acreditación. Te avisaremos por email cuando se confirme.');
        } else {
          setMessage('No pudimos confirmar el pago aún. Revisá Mercado Pago o reintentá.');
        }
      } catch (e) {
        if (!cancelled) {
          setMessage(e instanceof Error ? e.message : 'Error al verificar el pago');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, returnStatus, loadOrder]);

  const paid = order && order.status !== 'PENDIENTE_PAGO' && order.status !== 'CANCELADA';

  return (
    <div className="page-content">
      <h1 className="page-title">Resultado del pago</h1>
      {loading ? (
        <div className="loader" />
      ) : (
        <>
          <p className={paid ? 'text-success' : returnStatus === 'failure' ? 'form-error' : 'text-muted'}>{message}</p>
          {order && (
            <div className="glass pago-card" style={{ marginTop: 16 }}>
              <p><strong>{order.ticketListing?.eventName ?? 'Ticket'}</strong></p>
              <p className="ticket-total">
                {order.currency} {order.totalAmount.toLocaleString('es-AR')}
              </p>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                Orden: <code>{order.id}</code>
              </p>
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 20 }}>
            {paid && (
              <Link to="/mis-compras" className="btn-primary">
                Ir a mis compras
              </Link>
            )}
            {!paid && returnStatus !== 'pending' && id && (
              <button type="button" className="btn-primary" onClick={() => navigate(`/orden/${id}/pago`)}>
                Reintentar pago
              </button>
            )}
            <Link to="/home" className="btn-secondary">
              Volver al inicio
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
