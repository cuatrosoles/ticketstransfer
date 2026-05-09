/**
 * Mis ventas – Órdenes como vendedor + Tickets a la venta con copiar ID.
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getMySales, getMyListings, type OrderItem, type TicketListingItem } from '../lib/api';

function formatListingDate(value: string | undefined): string {
  if (!value) return '—';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString('es-AR');
  }
  try {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('es-AR');
  } catch {
    return '—';
  }
}

const ORDER_STATUS: Record<string, string> = {
  PENDIENTE_PAGO: 'Pendiente de pago',
  ESPERANDO_TRANSFERENCIA: 'Debes transferir el ticket',
  TRANSFERIDO_VENDEDOR: 'Transferido',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
  EN_DISPUTA: 'En disputa',
};

const LISTING_STATUS: Record<string, string> = {
  DISPONIBLE: 'Aprobado',
  PENDIENTE_VERIFICACION: 'Pendiente de aprobación',
  RECHAZADO: 'Rechazado',
  PAUSADO: 'Pausado',
};

const DELIVERY_METHOD_LABEL: Record<string, string> = {
  usuario: 'Nombre de usuario',
  id: 'Número de ID',
  email: 'Email',
  telefono: 'Teléfono',
  otro: 'Otro',
};

function orderHasDeliveryInfo(o: OrderItem): boolean {
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

function OrderDeliveryForSeller({ order }: { order: OrderItem }) {
  if (!orderHasDeliveryInfo(order)) return null;
  return (
    <div className="mis-ventas-delivery">
      <span className="mis-ventas-delivery-title">Datos del comprador para recibir el ticket</span>
      {order.deliveryMethod ? (
        <p className="mis-ventas-delivery-line">
          Medio principal: {DELIVERY_METHOD_LABEL[order.deliveryMethod] ?? order.deliveryMethod}
        </p>
      ) : null}
      {order.deliveryUsername ? <p className="mis-ventas-delivery-line">Nombre de usuario: {order.deliveryUsername}</p> : null}
      {order.deliveryIdNumber ? <p className="mis-ventas-delivery-line">Número de ID: {order.deliveryIdNumber}</p> : null}
      {order.deliveryEmail ? <p className="mis-ventas-delivery-line">Email: {order.deliveryEmail}</p> : null}
      {order.deliveryPhone ? <p className="mis-ventas-delivery-line">Teléfono: {order.deliveryPhone}</p> : null}
      {order.deliveryOther ? <p className="mis-ventas-delivery-line">Otro: {order.deliveryOther}</p> : null}
      {order.deliveryDetail ? <p className="mis-ventas-delivery-line">Detalle adicional: {order.deliveryDetail}</p> : null}
    </div>
  );
}

export function MisVentas() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [listings, setListings] = useState<TicketListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [o, l] = await Promise.all([getMySales(), getMyListings()]);
      setOrders(o);
      setListings(l);
    } catch {
      setOrders([]);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopyFeedback(id);
      setTimeout(() => setCopyFeedback(null), 2000);
    }).catch(() => {
      window.prompt('Copiá el código del ticket:', id);
    });
  };

  if (loading) {
    return (
      <div className="page-content">
        <h1 className="page-title">Mis ventas</h1>
        <p className="text-muted">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      <h1 className="page-title">Mis ventas</h1>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Mis ventas</h2>
        {orders.length === 0 ? (
          <p className="text-muted">No tenés ventas.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {orders.map((item) => (
              <div key={item.id} className="glass" style={{ padding: 16, borderRadius: 12 }}>
                <div style={{ fontWeight: 600 }}>{item.ticketListing?.eventName ?? 'Orden'}</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
                  {item.totalAmount} {item.currency} · {ORDER_STATUS[item.status] ?? item.status}
                </div>
                {item.buyer?.email && (
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                    Comprador: {item.buyer.email}
                  </div>
                )}
                <OrderDeliveryForSeller order={item} />
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {new Date(item.createdAt).toLocaleDateString('es-AR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Mis tickets a la venta</h2>
        {listings.length === 0 ? (
          <p className="text-muted">No tenés tickets publicados.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {listings.map((item) => {
              const isApproved = item.status === 'DISPONIBLE';
              return (
                <div key={item.id} className="venta-ticket-wrap">
                  <div className="venta-ticket-cut venta-ticket-cut-left" aria-hidden />
                  <div className="venta-ticket-cut venta-ticket-cut-right" aria-hidden />
                  <div className="venta-ticket-inner glass" style={{ padding: 16, borderRadius: 12 }}>
                    <div style={{ fontWeight: 600 }}>{item.eventName}</div>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
                      {item.price} {item.currency} · {formatListingDate(item.eventDate)}
                    </div>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: 13,
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: 8,
                        marginTop: 8,
                        background: isApproved ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                        color: isApproved ? '#16a34a' : '#ca8a04',
                      }}
                    >
                      {LISTING_STATUS[item.status] ?? item.status}
                    </span>
                    {isApproved && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 12 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Código:</span>
                        <code style={{ fontSize: 13, padding: '4px 8px', background: 'rgba(0,0,0,0.2)', borderRadius: 6 }}>
                          {item.id}
                        </code>
                        <button
                          type="button"
                          className="btn-primary"
                          style={{ padding: '6px 12px', fontSize: 14 }}
                          onClick={() => handleCopyId(item.id)}
                        >
                          {copyFeedback === item.id ? 'Copiado' : 'Copiar al portapapeles'}
                        </button>
                      </div>
                    )}
                    <div className="venta-ticket-actions">
                      <Link to={`/mis-ventas/publicacion/${encodeURIComponent(item.id)}`} className="btn-secondary">
                        Ver
                      </Link>
                      <Link to={`/publicar?editar=${encodeURIComponent(item.id)}`} className="btn-primary">
                        Editar
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
