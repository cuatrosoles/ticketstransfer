import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  eventImageUrl?: string | null;
  sector: string | null;
  visibility?: 'PUBLIC' | 'PRIVATE' | string;
  status: string;
  tipoEntrada: string;
  price: number;
  currency: string;
  seller: { id: string; email: string; firstName: string | null; lastName: string | null } | null;
};

const VALID_STATUSES = new Set(STATUS_OPTIONS.map((o) => o.value));

export function Tickets() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawStatus = searchParams.get('status') || 'TODOS';
  const statusFromUrl = VALID_STATUSES.has(rawStatus) ? rawStatus : 'TODOS';
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState(statusFromUrl);

  useEffect(() => {
    setStatusFilter(statusFromUrl);
  }, [statusFromUrl]);

  const load = () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (statusFilter !== 'TODOS') params.set('status', statusFilter);
    api<{ tickets: TicketItem[]; total: number }>(`/api/admin/tickets?${params}`)
      .then((r) => {
        setTickets(r.tickets || []);
        setTotal(r.total ?? 0);
      })
      .catch((e) => {
        setTickets([]);
        setTotal(0);
        setError(e instanceof Error ? e.message : 'Error al cargar tickets');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const formatDate = (d: string | Date) => {
    if (!d) return '—';
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

  const visibilityLabel = (v: string | undefined) => {
    if (v === 'PUBLIC') return 'Público';
    if (v === 'PRIVATE') return 'Privado';
    return 'Legacy';
  };

  if (loading) return <p>Cargando…</p>;
  if (error) return <div className="card" style={{ color: 'var(--danger)' }}>{error}</div>;

  return (
    <>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h1 className="admin-title">Tickets</h1>
        <select
          className="input"
          style={{ width: 200 }}
          value={statusFilter}
          onChange={(e) => {
            const v = e.target.value;
            setStatusFilter(v);
            setSearchParams(v === 'TODOS' ? {} : { status: v });
          }}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {tickets.length === 0 ? (
        <div className="card">
          <p>No hay tickets con el filtro seleccionado.</p>
          {statusFilter !== 'TODOS' && (
            <p style={{ marginTop: 8, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Probá cambiar el filtro a <strong>Todos</strong> para ver todos los tickets.
            </p>
          )}
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: 48 }} />
                  <th>Evento</th>
                  <th>Fecha</th>
                  <th>Lugar</th>
                  <th>Estado</th>
                  <th>Visibilidad</th>
                  <th>Precio</th>
                  <th>Vendedor</th>
                  <th style={{ width: 120 }} />
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr
                    key={t.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/tickets/${t.id}`)}
                    title="Clic para ver detalle completo"
                  >
                    <td>
                      {t.eventImageUrl ? (
                        <img
                          src={t.eventImageUrl}
                          alt=""
                          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }}
                        />
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>
                    <td>
                      <strong>{t.eventName}</strong>
                      {t.sector ? (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {t.sector} · {t.tipoEntrada}
                        </div>
                      ) : null}
                    </td>
                    <td>{formatDate(t.eventDate)}</td>
                    <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.eventPlace || '—'}
                    </td>
                    <td>{statusBadge(t.status)}</td>
                    <td>{visibilityLabel(t.visibility)}</td>
                    <td>
                      ${t.price?.toLocaleString?.('es-AR') ?? t.price} {t.currency}
                    </td>
                    <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.seller?.email ?? '—'}
                    </td>
                    <td>
                      <Link
                        to={`/tickets/${t.id}`}
                        className="btn btn-primary btn-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Ver / Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
