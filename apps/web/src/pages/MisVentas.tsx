/**
 * Mis ventas – Órdenes como vendedor + Tickets a la venta con copiar ID.
 */

import { useState, useEffect, useCallback } from 'react';
import { getMySales, getMyListings, type OrderItem, type TicketListingItem } from '../lib/api';

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
                <div key={item.id} className="glass" style={{ padding: 16, borderRadius: 12 }}>
                  <div style={{ fontWeight: 600 }}>{item.eventName}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
                    {item.price} {item.currency} · {new Date(item.eventDate).toLocaleDateString('es-AR')}
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
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
