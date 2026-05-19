import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

const CATEGORY_FALLBACKS: Record<string, string> = {
  MUSICA: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80&fm=jpg',
  DEPORTES: 'https://images.unsplash.com/photo-1461896836934-ffe607be7d0e?auto=format&fit=crop&w=800&q=80&fm=jpg',
  TEATRO: 'https://images.unsplash.com/photo-1503090549741-5a710f340b0b?auto=format&fit=crop&w=800&q=80&fm=jpg',
  FESTIVALES: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80&fm=jpg',
  OTRO: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80&fm=jpg',
};

function eventCoverUrl(ticket: TicketDetailType): string {
  if (ticket.eventImageUrl) return ticket.eventImageUrl;
  return CATEGORY_FALLBACKS[ticket.category] || CATEGORY_FALLBACKS.OTRO;
}

const EVENT_IMAGE_SOURCE_LABELS: Record<string, string> = {
  official: 'Fuente oficial',
  wikimedia: 'Wikimedia',
  generated: 'Generada por IA',
  fallback: 'Imagen por defecto',
};

const STATUS_OPTIONS = ['PENDIENTE_VERIFICACION', 'DISPONIBLE', 'PAUSADO', 'RECHAZADO', 'ELIMINADO'];
const TIPOS_ENTRADA = ['GENERAL', 'CAMPO', 'PLATEA', 'VIP', 'OTRO'];
const TICKETERAS = ['TICKETEK', 'ALLACCESS', 'TICKET_PLUS', 'OTRA'];
const APPS_BOLETOS = ['QUENTRO', 'ENIGMA', 'OTRA'];
const CATEGORIAS = ['MUSICA', 'DEPORTES', 'TEATRO', 'FESTIVALES', 'OTRO'];

type TicketDetailType = {
  id: string;
  eventName: string;
  eventDate: string | Date;
  eventPlace: string | null;
  sector: string | null;
  row: string | null;
  seat: string | null;
  quantityEntries: string | null;
  tipoEntrada: string;
  tipoEntradaOtro: string | null;
  price: number;
  currency: string;
  ticketera: string;
  ticketeraOtra: string | null;
  appBoletos: string;
  appBoletosOtra: string | null;
  orderRef: string | null;
  category: string;
  eventImageUrl?: string | null;
  eventImageSource?: string | null;
  status: string;
  captureTicketUrl: string | null;
  captureTicketOriginalUrl?: string | null;
  captureOwnershipUrl: string | null;
  captureOwnershipOriginalUrl?: string | null;
  rejectionReason: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  seller: { id: string; email: string; firstName: string | null; lastName: string | null } | null;
};

export function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<TicketDetailType>>({});
  const [rejectReason, setRejectReason] = useState('');

  const load = () => {
    if (!id) return;
    setLoading(true);
    api<TicketDetailType>(`/api/admin/tickets/${id}`)
      .then((t) => {
        setTicket(t);
        setForm({
          eventName: t.eventName,
          eventDate: typeof t.eventDate === 'string' ? t.eventDate.slice(0, 10) : t.eventDate ? new Date(t.eventDate).toISOString().slice(0, 10) : '',
          eventPlace: t.eventPlace ?? '',
          sector: t.sector ?? '',
          row: t.row ?? '',
          seat: t.seat ?? '',
          quantityEntries: t.quantityEntries ?? '',
          tipoEntrada: t.tipoEntrada,
          tipoEntradaOtro: t.tipoEntradaOtro ?? '',
          price: t.price,
          currency: t.currency ?? 'ARS',
          ticketera: t.ticketera,
          ticketeraOtra: t.ticketeraOtra ?? '',
          appBoletos: t.appBoletos,
          appBoletosOtra: t.appBoletosOtra ?? '',
          orderRef: t.orderRef ?? '',
          category: t.category ?? 'OTRO',
          status: t.status,
        });
      })
      .catch(() => setTicket(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const save = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      if (payload.eventPlace === '') payload.eventPlace = null;
      if (payload.sector === '') payload.sector = null;
      if (payload.row === '') payload.row = null;
      if (payload.seat === '') payload.seat = null;
      if (payload.quantityEntries === '') payload.quantityEntries = null;
      if (payload.tipoEntradaOtro === '') payload.tipoEntradaOtro = null;
      if (payload.ticketeraOtra === '') payload.ticketeraOtra = null;
      if (payload.appBoletosOtra === '') payload.appBoletosOtra = null;
      if (payload.orderRef === '') payload.orderRef = null;
      const updated = await api<TicketDetailType>(`/api/admin/tickets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setTicket(updated);
      setEditing(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const approve = async () => {
    if (!id) return;
    try {
      await api(`/api/admin/tickets/${id}/approve`, { method: 'PATCH' });
      navigate('/tickets?status=DISPONIBLE');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    }
  };

  const reject = async () => {
    if (!id) return;
    const reason = rejectReason.trim() || 'Rechazado por el administrador';
    try {
      await api(`/api/admin/tickets/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ rejectionReason: reason }),
      });
      setRejectReason('');
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    }
  };

  const remove = async () => {
    if (!id || !confirm('¿Eliminar este ticket? Se marcará como ELIMINADO.')) return;
    try {
      await api(`/api/admin/tickets/${id}`, { method: 'DELETE' });
      navigate('/tickets');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    }
  };

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
  if (!ticket) return <p>Ticket no encontrado.</p>;

  const canApprove = ticket.status === 'PENDIENTE_VERIFICACION' || !ticket.status;
  const canReject = canApprove;

  return (
    <>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Link to="/tickets" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 4, display: 'block' }}>← Volver a tickets</Link>
          <h1 className="admin-title">{ticket.eventName}</h1>
          {statusBadge(ticket.status)} {ticket.rejectionReason && <span style={{ marginLeft: 8, color: 'var(--danger)' }}>{ticket.rejectionReason}</span>}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!editing ? (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Editar</button>
          ) : (
            <>
              <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
              <button type="button" className="btn btn-sm" style={{ background: 'transparent', color: 'var(--text-muted)' }} onClick={() => { setEditing(false); load(); }}>Cancelar</button>
            </>
          )}
          {canApprove && <button type="button" className="btn btn-primary btn-sm" onClick={approve}>Aprobar</button>}
          {canReject && <button type="button" className="btn btn-danger btn-sm" onClick={reject}>Rechazar</button>}
          <button type="button" className="btn btn-danger btn-sm" onClick={remove}>Eliminar</button>
        </div>
      </div>

      {canReject && (
        <div className="card" style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 8, fontSize: '0.875rem' }}>Motivo de rechazo (opcional)</label>
          <input
            type="text"
            className="input"
            placeholder="Rechazado por el administrador"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            style={{ maxWidth: 400 }}
          />
        </div>
      )}

      <div className="card" style={{ marginBottom: 12, overflow: 'hidden', padding: 0 }}>
        <div style={{ position: 'relative' }}>
          <img
            src={eventCoverUrl(ticket)}
            alt={`Portada ${ticket.eventName}`}
            style={{ width: '100%', maxHeight: 220, objectFit: 'cover', display: 'block' }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = CATEGORY_FALLBACKS[ticket.category] || CATEGORY_FALLBACKS.OTRO;
            }}
          />
        </div>
        <div style={{ padding: '12px 16px' }}>
          <strong>Portada del evento</strong>
          {ticket.eventImageSource ? (
            <span style={{ marginLeft: 8, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              ({EVENT_IMAGE_SOURCE_LABELS[ticket.eventImageSource] ?? ticket.eventImageSource})
            </span>
          ) : null}
          {ticket.eventImageUrl ? (
            <p style={{ margin: '8px 0 0', fontSize: '0.8125rem' }}>
              <a href={ticket.eventImageUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                Abrir imagen en nueva pestaña
              </a>
            </p>
          ) : (
            <p style={{ margin: '8px 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Sin portada asignada — se muestra imagen por categoría.
            </p>
          )}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Datos del ticket</h3>
        {editing ? (
          <div className="config-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            <div className="form-group">
              <label>Nombre evento</label>
              <input value={form.eventName ?? ''} onChange={(e) => setForm((f) => ({ ...f, eventName: e.target.value }))} className="input" />
            </div>
            <div className="form-group">
              <label>Fecha (YYYY-MM-DD)</label>
              <input
                type="date"
                value={
                  form.eventDate
                    ? typeof form.eventDate === 'string'
                      ? form.eventDate.slice(0, 10)
                      : new Date(form.eventDate).toISOString().slice(0, 10)
                    : ''
                }
                onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
                className="input"
              />
            </div>
            <div className="form-group">
              <label>Lugar</label>
              <input value={form.eventPlace ?? ''} onChange={(e) => setForm((f) => ({ ...f, eventPlace: e.target.value }))} className="input" />
            </div>
            <div className="form-group">
              <label>Sector</label>
              <input value={form.sector ?? ''} onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))} className="input" />
            </div>
            <div className="form-group">
              <label>Fila</label>
              <input value={form.row ?? ''} onChange={(e) => setForm((f) => ({ ...f, row: e.target.value }))} className="input" />
            </div>
            <div className="form-group">
              <label>Asientos</label>
              <input value={form.seat ?? ''} onChange={(e) => setForm((f) => ({ ...f, seat: e.target.value }))} className="input" />
            </div>
            <div className="form-group">
              <label>Cantidad entradas</label>
              <input value={form.quantityEntries ?? ''} onChange={(e) => setForm((f) => ({ ...f, quantityEntries: e.target.value }))} className="input" />
            </div>
            <div className="form-group">
              <label>Tipo entrada</label>
              <select value={form.tipoEntrada ?? ''} onChange={(e) => setForm((f) => ({ ...f, tipoEntrada: e.target.value }))} className="input">
                {TIPOS_ENTRADA.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {form.tipoEntrada === 'OTRO' && (
              <div className="form-group">
                <label>Especificar tipo</label>
                <input value={form.tipoEntradaOtro ?? ''} onChange={(e) => setForm((f) => ({ ...f, tipoEntradaOtro: e.target.value }))} className="input" />
              </div>
            )}
            <div className="form-group">
              <label>Precio</label>
              <input type="number" value={form.price ?? ''} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} className="input" />
            </div>
            <div className="form-group">
              <label>Moneda</label>
              <input value={form.currency ?? ''} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} className="input" />
            </div>
            <div className="form-group">
              <label>Ticketera</label>
              <select value={form.ticketera ?? ''} onChange={(e) => setForm((f) => ({ ...f, ticketera: e.target.value }))} className="input">
                {TICKETERAS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {form.ticketera === 'OTRA' && (
              <div className="form-group">
                <label>Especificar ticketera</label>
                <input value={form.ticketeraOtra ?? ''} onChange={(e) => setForm((f) => ({ ...f, ticketeraOtra: e.target.value }))} className="input" />
              </div>
            )}
            <div className="form-group">
              <label>App boletos</label>
              <select value={form.appBoletos ?? ''} onChange={(e) => setForm((f) => ({ ...f, appBoletos: e.target.value }))} className="input">
                {APPS_BOLETOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {form.appBoletos === 'OTRA' && (
              <div className="form-group">
                <label>Especificar app</label>
                <input value={form.appBoletosOtra ?? ''} onChange={(e) => setForm((f) => ({ ...f, appBoletosOtra: e.target.value }))} className="input" />
              </div>
            )}
            <div className="form-group">
              <label>Código orden</label>
              <input value={form.orderRef ?? ''} onChange={(e) => setForm((f) => ({ ...f, orderRef: e.target.value }))} className="input" />
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <select value={form.category ?? ''} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="input">
                {CATEGORIAS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select value={form.status ?? ''} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="input">
                {STATUS_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            <p><strong>Evento:</strong> {ticket.eventName}</p>
            <p><strong>Fecha:</strong> {formatDate(ticket.eventDate)}</p>
            <p><strong>Lugar:</strong> {ticket.eventPlace || '-'}</p>
            <p><strong>Sector:</strong> {ticket.sector || '-'}</p>
            <p><strong>Fila:</strong> {ticket.row || '-'}</p>
            <p><strong>Asientos:</strong> {ticket.seat || '-'}</p>
            <p><strong>Cantidad:</strong> {ticket.quantityEntries || '-'}</p>
            <p><strong>Tipo:</strong> {ticket.tipoEntrada} {ticket.tipoEntradaOtro ? `(${ticket.tipoEntradaOtro})` : ''}</p>
            <p><strong>Precio:</strong> ${ticket.price?.toLocaleString?.('es-AR') ?? ticket.price} {ticket.currency}</p>
            <p><strong>Ticketera:</strong> {ticket.ticketera} {ticket.ticketeraOtra ? `(${ticket.ticketeraOtra})` : ''}</p>
            <p><strong>App boletos:</strong> {ticket.appBoletos} {ticket.appBoletosOtra ? `(${ticket.appBoletosOtra})` : ''}</p>
            <p><strong>Código orden:</strong> {ticket.orderRef || '-'}</p>
            <p><strong>Categoría:</strong> {ticket.category || '-'}</p>
            <p><strong>Creado:</strong> {formatDate(ticket.createdAt)}</p>
            <p><strong>Actualizado:</strong> {formatDate(ticket.updatedAt)}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Vendedor</h3>
        <p><strong>Email:</strong> {ticket.seller?.email}</p>
        <p><strong>Nombre:</strong> {[ticket.seller?.firstName, ticket.seller?.lastName].filter(Boolean).join(' ') || '-'}</p>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Imágenes</h3>
        <p className="text-muted" style={{ marginBottom: 12 }}>
          Vista pública (redactada) y, si existe, la captura original subida por el vendedor.
        </p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {ticket.captureTicketUrl && (
            <div>
              <a href={ticket.captureTicketUrl} target="_blank" rel="noopener noreferrer">Ticket (público / redactado)</a>
              <img src={ticket.captureTicketUrl} alt="Ticket" style={{ display: 'block', marginTop: 8, maxWidth: 300, borderRadius: 8 }} />
            </div>
          )}
          {ticket.captureTicketOriginalUrl && (
            <div>
              <a href={ticket.captureTicketOriginalUrl} target="_blank" rel="noopener noreferrer">Ticket (original)</a>
              <img src={ticket.captureTicketOriginalUrl} alt="Ticket original" style={{ display: 'block', marginTop: 8, maxWidth: 300, borderRadius: 8 }} />
            </div>
          )}
          {ticket.captureOwnershipUrl && (
            <div>
              <a href={ticket.captureOwnershipUrl} target="_blank" rel="noopener noreferrer">Titularidad (público / redactado)</a>
              <img src={ticket.captureOwnershipUrl} alt="Titularidad" style={{ display: 'block', marginTop: 8, maxWidth: 300, borderRadius: 8 }} />
            </div>
          )}
          {ticket.captureOwnershipOriginalUrl && (
            <div>
              <a href={ticket.captureOwnershipOriginalUrl} target="_blank" rel="noopener noreferrer">Titularidad (original)</a>
              <img src={ticket.captureOwnershipOriginalUrl} alt="Titularidad original" style={{ display: 'block', marginTop: 8, maxWidth: 300, borderRadius: 8 }} />
            </div>
          )}
          {!ticket.captureTicketUrl && !ticket.captureOwnershipUrl && <p className="text-muted">Sin imágenes</p>}
        </div>
      </div>
    </>
  );
}
