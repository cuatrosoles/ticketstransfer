/**
 * Detalle de orden – datos completos, editar (modal), eliminar/cancelar (confirmación).
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Pencil, Trash2 } from 'lucide-react';

const STATUS_OPTIONS = [
  'PENDIENTE_PAGO', 'PAGADO', 'ESPERANDO_TRANSFERENCIA', 'TRANSFERIDO_VENDEDOR',
  'ESPERANDO_CONFIRMACION_COMPRADOR', 'EVIDENCIA_SUBIDA', 'VERIFICANDO', 'COMPLETADA',
  'CANCELADA', 'EN_DISPUTA', 'DISPUTA_RESUELTA_COMPRADOR', 'DISPUTA_RESUELTA_VENDEDOR',
];

type OrderDetailType = {
  id: string;
  ticketListingId: string;
  buyerId: string;
  sellerId: string;
  status: string;
  totalAmount: number;
  commissionAmount?: number;
  currency: string;
  paymentMethod: string;
  transferDeadline?: string | Date | null;
  mercadopagoPreferenceId?: string | null;
  mercadopagoPaymentId?: string | null;
  mercadopagoPaymentStatus?: string | null;
  paidAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  ticketListing: {
    id: string;
    eventName: string;
    eventDate?: string | Date | null;
    eventPlace?: string | null;
    sector?: string | null;
    price: number;
    currency: string;
    status?: string;
  } | null;
  buyer: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
  } | null;
  seller: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    cbuCvu?: string | null;
    bankAlias?: string | null;
    bankName?: string | null;
  } | null;
  dispute: {
    id: string;
    status: string;
    reason?: string | null;
  } | null;
  buyerEvidenceUrl?: string | null;
  sellerEvidenceUrl?: string | null;
  buyerConfirmedAt?: string | Date | null;
};

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<Partial<OrderDetailType>>({});

  const load = () => {
    if (!id) return;
    setLoading(true);
    api<OrderDetailType>(`/api/admin/orders/${id}`)
      .then((o) => {
        setOrder(o);
        setForm({
          status: o.status,
          totalAmount: o.totalAmount,
          commissionAmount: o.commissionAmount ?? 0,
        });
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const save = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const updated = await api<OrderDetailType>(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(form),
      });
      setOrder(updated);
      setEditModal(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await api(`/api/admin/orders/${id}`, { method: 'DELETE' });
      navigate('/orders');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al cancelar');
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  const formatDate = (d: string | Date | null | undefined) => {
    if (!d) return '-';
    const date = typeof d === 'string' ? new Date(d) : d;
    return date.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const statusBadge = (s: string) => {
    const c =
      s === 'COMPLETADA' ? 'approved' :
      s === 'CANCELADA' || s === 'RECHAZADO' ? 'rejected' :
      s === 'EN_DISPUTA' ? 'open' : 'pending';
    return <span className={`badge badge-${c}`}>{s}</span>;
  };

  if (loading) return <p>Cargando…</p>;
  if (!order) return <p>Orden no encontrada.</p>;

  const canCancel = order.status !== 'COMPLETADA';
  const canMarkCompleted = order.status === 'VERIFICANDO' || order.status === 'EVIDENCIA_SUBIDA';

  const markCompleted = async () => {
    if (!id || !window.confirm('¿Marcar la orden como COMPLETADA y liberar el pago al vendedor?')) return;
    setSaving(true);
    try {
      const updated = await api<OrderDetailType>(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'COMPLETADA' }),
      });
      setOrder(updated);
      setForm((f) => ({ ...f, status: 'COMPLETADA' }));
      alert('Orden completada. Se inició el pago al vendedor (o quedó pendiente manual si no hay CBU).');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al completar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Link to="/orders" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 4, display: 'block' }}>← Volver a órdenes</Link>
          <h1 className="admin-title">Detalle de orden</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}><code>{order.id}</code></p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {canMarkCompleted && (
            <button type="button" className="btn btn-primary btn-sm" onClick={markCompleted} disabled={saving}>
              Marcar COMPLETADA (pagar vendedor)
            </button>
          )}
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditModal(true)}>
            <Pencil size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Editar
          </button>
          {canCancel && (
            <button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(true)}>
              <Trash2 size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Cancelar orden
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Información general</h3>
          <dl className="detail-dl">
            <dt>ID</dt><dd><code>{order.id}</code></dd>
            <dt>Estado</dt><dd>{statusBadge(order.status)}</dd>
            <dt>Total</dt><dd>{order.totalAmount?.toLocaleString?.('es-AR') ?? order.totalAmount} {order.currency}</dd>
            <dt>Comisión</dt><dd>{(order.commissionAmount ?? 0).toLocaleString?.('es-AR')} {order.currency}</dd>
            <dt>Método de pago</dt><dd>{order.paymentMethod || '—'}</dd>
            <dt>Fecha creación</dt><dd>{formatDate(order.createdAt)}</dd>
            <dt>Última actualización</dt><dd>{formatDate(order.updatedAt)}</dd>
            {order.transferDeadline && <><dt>Límite transferencia</dt><dd>{formatDate(order.transferDeadline)}</dd></>}
            {order.mercadopagoPreferenceId && (
              <>
                <dt>MP Preference ID</dt>
                <dd><code>{order.mercadopagoPreferenceId}</code></dd>
              </>
            )}
            {order.mercadopagoPaymentId && (
              <>
                <dt>MP Payment ID</dt>
                <dd><code>{order.mercadopagoPaymentId}</code></dd>
              </>
            )}
            {order.mercadopagoPaymentStatus && (
              <>
                <dt>Estado pago MP</dt>
                <dd><code>{order.mercadopagoPaymentStatus}</code></dd>
              </>
            )}
            {order.paidAt && <><dt>Pagado el</dt><dd>{formatDate(order.paidAt)}</dd></>}
          </dl>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Ticket / Evento</h3>
          {order.ticketListing ? (
            <dl className="detail-dl">
              <dt>Evento</dt><dd>{order.ticketListing.eventName}</dd>
              <dt>Fecha evento</dt><dd>{formatDate(order.ticketListing.eventDate)}</dd>
              <dt>Lugar</dt><dd>{order.ticketListing.eventPlace || '—'}</dd>
              <dt>Sector</dt><dd>{order.ticketListing.sector || '—'}</dd>
              <dt>Precio ticket</dt><dd>{order.ticketListing.price?.toLocaleString?.('es-AR')} {order.ticketListing.currency}</dd>
              <dt>Estado listing</dt><dd>{order.ticketListing.status || '—'}</dd>
              <dt>ID listing</dt><dd><Link to={`/tickets/${order.ticketListing.id}`} style={{ color: 'var(--primary)' }}>{order.ticketListing.id}</Link></dd>
            </dl>
          ) : (
            <p className="text-muted">Ticket no encontrado</p>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Comprador</h3>
          {order.buyer ? (
            <dl className="detail-dl">
              <dt>Email</dt><dd>{order.buyer.email}</dd>
              <dt>Nombre</dt><dd>{[order.buyer.firstName, order.buyer.lastName].filter(Boolean).join(' ') || '—'}</dd>
              <dt>Teléfono</dt><dd>{order.buyer.phone || '—'}</dd>
              <dt>ID</dt><dd><Link to={`/users/${order.buyer.id}`} style={{ color: 'var(--primary)' }}>{order.buyer.id}</Link></dd>
            </dl>
          ) : (
            <p className="text-muted">Comprador no encontrado</p>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Vendedor</h3>
          {order.seller ? (
            <dl className="detail-dl">
              <dt>Email</dt><dd>{order.seller.email}</dd>
              <dt>Nombre</dt><dd>{[order.seller.firstName, order.seller.lastName].filter(Boolean).join(' ') || '—'}</dd>
              <dt>Teléfono</dt><dd>{order.seller.phone || '—'}</dd>
              <dt>CBU/CVU</dt><dd>{order.seller.cbuCvu ? `****${order.seller.cbuCvu.slice(-4)}` : '—'}</dd>
              <dt>Alias bancario</dt><dd>{order.seller.bankAlias || '—'}</dd>
              <dt>Banco</dt><dd>{order.seller.bankName || '—'}</dd>
              <dt>ID</dt><dd><Link to={`/users/${order.seller.id}`} style={{ color: 'var(--primary)' }}>{order.seller.id}</Link></dd>
            </dl>
          ) : (
            <p className="text-muted">Vendedor no encontrado</p>
          )}
        </div>

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Evidencia y confirmación del comprador</h3>
          <dl className="detail-dl">
            <dt>Captura vendedor (transferencia ticket)</dt>
            <dd>
              {order.sellerEvidenceUrl ? (
                <a href={order.sellerEvidenceUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>Ver captura</a>
              ) : '—'}
            </dd>
            <dt>Captura comprador (ticket recibido)</dt>
            <dd>
              {order.buyerEvidenceUrl ? (
                <a href={order.buyerEvidenceUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>Ver captura</a>
              ) : '—'}
            </dd>
            <dt>Comprador confirmó recepción</dt>
            <dd>{order.buyerConfirmedAt ? formatDate(order.buyerConfirmedAt) : '—'}</dd>
          </dl>
          {order.status === 'VERIFICANDO' && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
              El comprador confirmó haber recibido el ticket. Revisá las capturas y marcá la orden como COMPLETADA para liberar el pago al vendedor.
            </p>
          )}
        </div>

        {order.dispute && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Disputa</h3>
            <dl className="detail-dl">
              <dt>ID</dt><dd><Link to={`/disputes`} style={{ color: 'var(--primary)' }}>{order.dispute.id}</Link></dd>
              <dt>Estado</dt><dd>{order.dispute.status}</dd>
              {order.dispute.reason && <><dt>Motivo</dt><dd>{order.dispute.reason}</dd></>}
            </dl>
          </div>
        )}
      </div>

      {/* Modal Editar */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h2>Editar orden</h2>
            <div className="config-section" style={{ display: 'grid', gap: 12 }}>
              <div className="form-group">
                <label>Estado</label>
                <select value={form.status ?? ''} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="input">
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Total</label>
                <input type="number" value={form.totalAmount ?? ''} onChange={(e) => setForm((f) => ({ ...f, totalAmount: Number(e.target.value) }))} className="input" />
              </div>
              <div className="form-group">
                <label>Comisión</label>
                <input type="number" value={form.commissionAmount ?? ''} onChange={(e) => setForm((f) => ({ ...f, commissionAmount: Number(e.target.value) }))} className="input" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
              <button type="button" className="btn btn-sm" style={{ background: 'transparent', color: 'var(--text-muted)' }} onClick={() => setEditModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación Cancelar */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h2>¿Cancelar orden?</h2>
            <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>
              La orden <code>{order.id}</code> se marcará como <strong>CANCELADA</strong>. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn btn-danger" onClick={remove} disabled={deleting}>
                {deleting ? 'Cancelando…' : 'Sí, cancelar orden'}
              </button>
              <button type="button" className="btn btn-sm" style={{ background: 'transparent', color: 'var(--text-muted)' }} onClick={() => setDeleteConfirm(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
