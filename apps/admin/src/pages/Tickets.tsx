import { useState, useEffect } from 'react';
import { api } from '../lib/api';

type TicketItem = {
  id: string;
  eventName: string;
  eventDate: string | Date;
  eventPlace: string | null;
  sector: string | null;
  tipoEntrada: string;
  price: number;
  currency: string;
  ticketera: string;
  appBoletos: string;
  captureTicketUrl: string | null;
  captureOwnershipUrl: string | null;
  createdAt: string | Date;
  seller: { id: string; email: string; firstName: string | null; lastName: string | null } | null;
};

export function Tickets() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  const load = () => {
    setLoading(true);
    api<{ tickets: TicketItem[] }>('/api/admin/tickets/pending')
      .then((r) => setTickets(r.tickets || []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id: string) => {
    try {
      await api(`/api/admin/tickets/${id}/approve`, { method: 'PATCH' });
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    }
  };

  const reject = async (id: string) => {
    const reason = rejectReason[id]?.trim() || 'Rechazado por el administrador';
    setRejecting(id);
    try {
      await api(`/api/admin/tickets/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ rejectionReason: reason }),
      });
      setRejectReason((prev) => ({ ...prev, [id]: '' }));
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    } finally {
      setRejecting(null);
    }
  };

  const formatDate = (d: string | Date) => {
    if (!d) return '-';
    const date = typeof d === 'string' ? new Date(d) : d;
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) return <p>Cargando…</p>;

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-title">Tickets pendientes de verificación</h1>
      </div>
      {tickets.length === 0 ? (
        <div className="card">No hay tickets pendientes de revisión.</div>
      ) : (
        tickets.map((t) => (
          <div key={t.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <strong style={{ fontSize: '1.1rem' }}>{t.eventName}</strong>
                <div style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Fecha: {formatDate(t.eventDate)} · {t.eventPlace || 'Sin lugar'}
                </div>
                <div style={{ marginTop: 4 }}>
                  {t.sector && <span>Sector: {t.sector}</span>}
                  <span style={{ marginLeft: 12 }}>{t.tipoEntrada}</span>
                  <span style={{ marginLeft: 12, fontWeight: 600 }}>
                    ${t.price.toLocaleString('es-AR')} {t.currency}
                  </span>
                </div>
                <div style={{ marginTop: 8, fontSize: '0.875rem' }}>
                  Vendido por: <strong>{t.seller?.email}</strong>{' '}
                  {[t.seller?.firstName, t.seller?.lastName].filter(Boolean).join(' ')}
                </div>
                <div style={{ marginTop: 8, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {t.captureTicketUrl && (
                    <a href={t.captureTicketUrl} target="_blank" rel="noopener noreferrer">
                      Ver captura ticket
                    </a>
                  )}
                  {t.captureOwnershipUrl && (
                    <a href={t.captureOwnershipUrl} target="_blank" rel="noopener noreferrer">
                      Ver titularidad
                    </a>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => approve(t.id)}>
                    Aprobar
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => reject(t.id)}
                    disabled={rejecting === t.id}
                  >
                    {rejecting === t.id ? 'Rechazando…' : 'Rechazar'}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Motivo de rechazo (opcional)"
                  className="input"
                  style={{ width: 220, fontSize: '0.875rem' }}
                  value={rejectReason[t.id] ?? ''}
                  onChange={(e) => setRejectReason((prev) => ({ ...prev, [t.id]: e.target.value }))}
                />
              </div>
            </div>
          </div>
        ))
      )}
    </>
  );
}
