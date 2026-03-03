import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

const STATUS_OPTIONS = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'PENDIENTE_VERIFICACION', label: 'Pendientes' },
  { value: 'DISPONIBLE', label: 'Disponibles' },
  { value: 'PAUSADO', label: 'Pausados' },
  { value: 'RECHAZADO', label: 'Rechazados' },
  { value: 'VENDIDO', label: 'Vendidos' },
  { value: 'ELIMINADO', label: 'Eliminados' },
];

type TicketItem = {
  id: string;
  eventName: string;
  eventDate: string | Date;
  eventPlace: string | null;
  sector: string | null;
  status: string;
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
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('TODOS');

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'TODOS') params.set('status', statusFilter);
    api<{ tickets: TicketItem[]; total: number }>(`/api/admin/tickets?${params}`)
      .then((r) => {
        setTickets(r.tickets || []);
        setTotal(r.total ?? 0);
      })
      .catch(() => {
        setTickets([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const formatDate = (d: string | Date) => {
    if (!d) return '-';
    const date = typeof d === 'string' ? new Date(d) : d;
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const statusBadge = (s: string) => {
    const c =
      s === 'DISPONIBLE' ? 'approved' :
      s === 'PENDIENTE_VERIFICACION' ? 'open' :
      s === 'RECHAZADO' || s === 'ELIMINADO' ? 'rejected' :
      'pending';
    return <span className={`badge badge-${c}`}>{s}</span>;
  };

  if (loading) return <p>Cargando…</p>;

  return (
    <>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h1 className="admin-title">Tickets</h1>
        <select
          className="input"
          style={{ width: 200 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      {tickets.length === 0 ? (
        <div className="card">No hay tickets con el filtro seleccionado.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tickets.map((t) => (
            <div key={t.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <Link to={`/tickets/${t.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    <strong style={{ fontSize: '1.1rem' }}>{t.eventName}</strong>
                  </Link>
                  <div style={{ marginTop: 4 }}>{statusBadge(t.status)}</div>
                  <div style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Fecha: {formatDate(t.eventDate)} · {t.eventPlace || 'Sin lugar'}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    {t.sector && <span>Sector: {t.sector}</span>}
                    <span style={{ marginLeft: 12 }}>{t.tipoEntrada}</span>
                    <span style={{ marginLeft: 12, fontWeight: 600 }}>
                      ${t.price?.toLocaleString?.('es-AR') ?? t.price} {t.currency}
                    </span>
                  </div>
                  <div style={{ marginTop: 8, fontSize: '0.875rem' }}>
                    Vendedor: <strong>{t.seller?.email}</strong>{' '}
                    {[t.seller?.firstName, t.seller?.lastName].filter(Boolean).join(' ')}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {t.captureTicketUrl && (
                      <a href={t.captureTicketUrl} target="_blank" rel="noopener noreferrer">
                        Ver captura
                      </a>
                    )}
                    {t.captureOwnershipUrl && (
                      <a href={t.captureOwnershipUrl} target="_blank" rel="noopener noreferrer">
                        Ver titularidad
                      </a>
                    )}
                  </div>
                </div>
                <Link to={`/tickets/${t.id}`} className="btn btn-primary btn-sm">
                  Ver / Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      {total > 0 && (
        <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Total: {total} ticket{total !== 1 ? 's' : ''}
        </p>
      )}
    </>
  );
}
