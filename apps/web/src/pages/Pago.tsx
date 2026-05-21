/**
 * Pago de orden – Mercado Pago (misma ventana para volver con back_urls) + tarjetas adheridas.
 */

import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { api, getUserCards, removeUserCard, type CardItem } from '../lib/api';

type Order = {
  id: string;
  totalAmount: number;
  currency: string;
  status: string;
  ticketListing?: { eventName: string };
  checkoutUrl?: string;
  deliveryMethod?: 'usuario' | 'id' | 'email' | 'telefono' | 'otro' | null;
  deliveryUsername?: string | null;
  deliveryIdNumber?: string | null;
  deliveryEmail?: string | null;
  deliveryPhone?: string | null;
  deliveryOther?: string | null;
  deliveryDetail?: string | null;
};

const DELIVERY_METHOD_LABEL: Record<string, string> = {
  usuario: 'Nombre de usuario',
  id: 'Número de ID',
  email: 'Email',
  telefono: 'Teléfono',
  otro: 'Otro',
};

function orderHasDeliveryInfo(o: Order): boolean {
  return !!(
    o.deliveryMethod ||
    o.deliveryUsername ||
    o.deliveryIdNumber ||
    o.deliveryEmail ||
    o.deliveryPhone ||
    o.deliveryOther ||
    o.deliveryDetail
  );
}

export function Pago() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(
    (location.state as { checkoutUrl?: string } | null)?.checkoutUrl ?? null
  );
  const [cards, setCards] = useState<CardItem[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!id) return;
    try {
      const o = await api<Order>(`/api/orders/${id}`);
      setOrder(o);
      setCheckoutUrl((prev) => prev || o.checkoutUrl || null);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    if (!id || !order || order.status !== 'PENDIENTE_PAGO' || checkoutUrl) return;
    api<{ checkoutUrl: string }>(`/api/orders/${id}/checkout-url`)
      .then((r) => setCheckoutUrl(r.checkoutUrl))
      .catch(() => {});
  }, [id, order?.status, checkoutUrl]);

  useEffect(() => {
    let cancelled = false;
    setCardsLoading(true);
    getUserCards()
      .then((r) => {
        if (!cancelled) setCards(r.cards || []);
      })
      .catch(() => {
        if (!cancelled) setCards([]);
      })
      .finally(() => {
        if (!cancelled) setCardsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, location.key]);

  const payWithMercadoPago = () => {
    if (checkoutUrl) {
      window.location.assign(checkoutUrl);
    }
  };

  const goAddCard = () => {
    if (id) navigate('/tarjetas', { state: { returnTo: `/orden/${id}/pago` } });
    else navigate('/tarjetas');
  };

  const handleRemoveCard = (card: CardItem) => {
    if (!window.confirm('¿Eliminar esta tarjeta de tu cuenta?')) return;
    setDeletingId(card.id);
    removeUserCard(card.id)
      .then(() => setCards((c) => c.filter((x) => x.id !== card.id)))
      .catch((e) => window.alert(e instanceof Error ? e.message : 'Error'))
      .finally(() => setDeletingId(null));
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
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-muted)' }}>Confirmar pago</h2>
      <div className="glass pago-card">
        <p><strong>{order.ticketListing?.eventName ?? 'Orden'}</strong></p>
        <p className="ticket-total">Total: {order.currency} {order.totalAmount.toLocaleString('es-AR')}</p>
        <p className="escrow-notice">
          Tu dinero será retenido hasta que el vendedor transfiera el ticket a tu cuenta oficial.
        </p>

        {orderHasDeliveryInfo(order) && (
          <div className="pago-delivery-summary" style={{ marginTop: 12, marginBottom: 8 }}>
            <strong style={{ display: 'block', marginBottom: 8, fontSize: '0.95rem' }}>Datos indicados para recibir el ticket</strong>
            {order.deliveryMethod ? (
              <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0 0 4px' }}>
                Medio principal: {DELIVERY_METHOD_LABEL[order.deliveryMethod] ?? order.deliveryMethod}
              </p>
            ) : null}
            {order.deliveryUsername ? (
              <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0 0 4px' }}>
                Nombre de usuario: {order.deliveryUsername}
              </p>
            ) : null}
            {order.deliveryIdNumber ? (
              <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0 0 4px' }}>
                Número de ID: {order.deliveryIdNumber}
              </p>
            ) : null}
            {order.deliveryEmail ? (
              <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0 0 4px' }}>
                Email: {order.deliveryEmail}
              </p>
            ) : null}
            {order.deliveryPhone ? (
              <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0 0 4px' }}>
                Teléfono: {order.deliveryPhone}
              </p>
            ) : null}
            {order.deliveryOther ? (
              <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0 0 4px' }}>
                Otro: {order.deliveryOther}
              </p>
            ) : null}
            {order.deliveryDetail ? (
              <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0 0 4px' }}>
                Detalle adicional: {order.deliveryDetail}
              </p>
            ) : null}
          </div>
        )}

        <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: 8 }}>
          Podés usar tarjeta, débito o cuenta de Mercado Pago. Agregá tarjetas desde esta pantalla o desde Perfil. En el checkout de Mercado Pago también podés usar medios guardados en tu cuenta MP.
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

        {isPendingPayment && (
          <>
            <div className="pago-cards-section">
              <strong>Tarjetas adheridas</strong>
              {cardsLoading ? (
                <p className="text-muted">Cargando…</p>
              ) : cards.length === 0 ? (
                <p className="text-muted">No tenés tarjetas guardadas.</p>
              ) : (
                cards.map((c) => (
                  <div key={c.id} className="pago-card-row">
                    <span>
                      {c.payment_method?.name || 'Tarjeta'} •••• {c.last_four_digits}
                    </span>
                    <button
                      type="button"
                      className="link-danger"
                      disabled={deletingId === c.id}
                      onClick={() => handleRemoveCard(c)}
                    >
                      {deletingId === c.id ? '…' : 'Eliminar'}
                    </button>
                  </div>
                ))
              )}
            </div>

            {checkoutUrl && (
              <button type="button" className="btn-primary mt-2" onClick={payWithMercadoPago}>
                Pagar con Mercado Pago
              </button>
            )}
            <button type="button" className="btn-secondary mt-2" onClick={goAddCard}>
              + Agregar tarjeta
            </button>
            {isPendingPayment && !checkoutUrl && (
              <p className="text-muted">Generando link de pago…</p>
            )}
          </>
        )}

        {isWaitingTransfer && (
          <>
            <p className="text-success">Pago recibido. Esperando la transferencia del vendedor.</p>
            <button
              type="button"
              className="btn-secondary mt-2"
              onClick={() => navigate(`/orden/${id}/pago/resultado?status=success`)}
            >
              Ver resumen del pago
            </button>
          </>
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
