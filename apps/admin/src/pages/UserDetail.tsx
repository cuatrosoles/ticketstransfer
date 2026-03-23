/**
 * Detalle de usuario – datos completos, editar (modal), eliminar (confirmación).
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { CreditCard, Pencil, Trash2 } from 'lucide-react';

type UserDetailType = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  numeroId: string | null;
  country: string | null;
  tipoDocumento: string | null;
  documentNumber: string | null;
  sexo: string | null;
  phone: string | null;
  phoneVerified: boolean;
  dateOfBirth: string | Date | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  role: string;
  emailVerified: boolean;
  reputationScore: number;
  profileImageUrl: string | null;
  cbuCvu: string | null;
  bankName: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  kyc: {
    status: string;
    rejectionReason?: string | null;
    diditSessionId?: string | null;
    reviewedAt?: string | Date | null;
    updatedAt?: string | Date | null;
  } | null;
};

type CardItem = {
  id: string;
  last_four_digits: string;
  payment_method: { id: string; name: string };
};

const ROLES = ['user', 'admin'];

export function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [form, setForm] = useState<Partial<UserDetailType>>({});

  const load = () => {
    if (!id) return;
    setLoading(true);
    api<UserDetailType>(`/api/admin/users/${id}`)
      .then((u) => {
        setUser(u);
        setForm({
          firstName: u.firstName ?? '',
          lastName: u.lastName ?? '',
          username: u.username ?? '',
          country: u.country ?? '',
          tipoDocumento: u.tipoDocumento ?? '',
          documentNumber: u.documentNumber ?? '',
          sexo: u.sexo ?? '',
          phone: u.phone ?? '',
          city: u.city ?? '',
          province: u.province ?? '',
          postalCode: u.postalCode ?? '',
          role: u.role,
          reputationScore: u.reputationScore ?? 0,
          cbuCvu: u.cbuCvu ?? '',
          bankName: u.bankName ?? '',
        });
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  };

  const loadCards = () => {
    if (!id) return;
    api<{ cards: CardItem[] }>(`/api/admin/users/${id}/cards`)
      .then((d) => setCards(d.cards))
      .catch(() => setCards([]));
  };

  useEffect(() => {
    load();
    loadCards();
  }, [id]);

  const save = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      for (const k of Object.keys(payload)) {
        if (payload[k] === '') payload[k] = null;
      }
      const updated = await api<UserDetailType>(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setUser(updated);
      setEditModal(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!id || !deleteConfirm) return;
    setDeleting(true);
    try {
      await api(`/api/admin/users/${id}`, { method: 'DELETE' });
      navigate('/users');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al eliminar');
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
      setDeleteConfirmText('');
    }
  };

  const formatDate = (d: string | Date | null | undefined) => {
    if (!d) return '-';
    const date = typeof d === 'string' ? new Date(d) : d;
    return date.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const kycBadge = (status: string) => {
    const c =
      status === 'APROBADO' ? 'approved' :
      status === 'RECHAZADO' ? 'rejected' :
      status === 'EN_REVISION' ? 'open' : 'pending';
    return <span className={`badge badge-${c}`}>{status}</span>;
  };

  if (loading) return <p>Cargando…</p>;
  if (!user) return <p>Usuario no encontrado.</p>;

  return (
    <>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Link to="/users" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 4, display: 'block' }}>← Volver a usuarios</Link>
          <h1 className="admin-title">Detalle de usuario</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>{user.email}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setEditModal(true)}>
            <Pencil size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Editar
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(true)}>
            <Trash2 size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Eliminar
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Identificación</h3>
          <dl className="detail-dl">
            <dt>ID</dt><dd><code>{user.id}</code></dd>
            <dt>Email</dt><dd>{user.email}</dd>
            <dt>Usuario</dt><dd>{user.username || '—'}</dd>
            <dt>Nº ID</dt><dd>{user.numeroId || '—'}</dd>
            <dt>Email verificado</dt><dd>{user.emailVerified ? 'Sí' : 'No'}</dd>
          </dl>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Datos personales</h3>
          <dl className="detail-dl">
            <dt>Nombre</dt><dd>{[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}</dd>
            <dt>País</dt><dd>{user.country || '—'}</dd>
            <dt>Tipo documento</dt><dd>{user.tipoDocumento || '—'}</dd>
            <dt>Nº documento</dt><dd>{user.documentNumber || '—'}</dd>
            <dt>Sexo</dt><dd>{user.sexo || '—'}</dd>
            <dt>Fecha nacimiento</dt><dd>{formatDate(user.dateOfBirth)}</dd>
          </dl>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Contacto y ubicación</h3>
          <dl className="detail-dl">
            <dt>Teléfono</dt><dd>{user.phone || '—'} {user.phoneVerified ? '(verificado)' : ''}</dd>
            <dt>Ciudad</dt><dd>{user.city || '—'}</dd>
            <dt>Provincia</dt><dd>{user.province || '—'}</dd>
            <dt>Código postal</dt><dd>{user.postalCode || '—'}</dd>
          </dl>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Datos bancarios (para recibir pagos)</h3>
          <dl className="detail-dl">
            <dt>CBU/CVU</dt><dd>{user.cbuCvu ? `****${user.cbuCvu.slice(-4)} (22 dígitos)` : '—'}</dd>
            <dt>Banco</dt><dd>{user.bankName || '—'}</dd>
          </dl>
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Cuenta y verificación</h3>
          <dl className="detail-dl">
            <dt>Rol</dt><dd>{user.role}</dd>
            <dt>Reputación</dt><dd>{user.reputationScore ?? 0}</dd>
            <dt>KYC</dt><dd>{user.kyc ? kycBadge(user.kyc.status) : kycBadge('PENDIENTE')}</dd>
            {user.kyc?.rejectionReason && <><dt>Motivo rechazo KYC</dt><dd>{user.kyc.rejectionReason}</dd></>}
            <dt>Registro</dt><dd>{formatDate(user.createdAt)}</dd>
            <dt>Última actualización</dt><dd>{formatDate(user.updatedAt)}</dd>
          </dl>
        </div>

        {user.profileImageUrl && (
          <div className="card">
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Avatar</h3>
            <img src={user.profileImageUrl} alt="Avatar" style={{ maxWidth: 120, borderRadius: 8 }} />
          </div>
        )}

        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}><CreditCard size={18} style={{ verticalAlign: 'middle', marginRight: 6 }} />Tarjetas adheridas</h3>
          {cards.length === 0 ? (
            <p className="text-muted">No tiene tarjetas guardadas.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {cards.map((c) => (
                <li key={c.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  {c.payment_method?.name || c.payment_method?.id || 'Tarjeta'} •••• {c.last_four_digits}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal Editar */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>Editar usuario</h2>
            <div className="config-section" style={{ display: 'grid', gap: 12 }}>
              <div className="form-group">
                <label>Nombre</label>
                <input value={form.firstName ?? ''} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} className="input" />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input value={form.lastName ?? ''} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} className="input" />
              </div>
              <div className="form-group">
                <label>Usuario</label>
                <input value={form.username ?? ''} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} className="input" />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input value={form.phone ?? ''} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="input" />
              </div>
              <div className="form-group">
                <label>País</label>
                <input value={form.country ?? ''} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} className="input" />
              </div>
              <div className="form-group">
                <label>Ciudad</label>
                <input value={form.city ?? ''} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="input" />
              </div>
              <div className="form-group">
                <label>Provincia</label>
                <input value={form.province ?? ''} onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))} className="input" />
              </div>
              <div className="form-group">
                <label>Código postal</label>
                <input value={form.postalCode ?? ''} onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))} className="input" />
              </div>
              <div className="form-group">
                <label>Rol</label>
                <select value={form.role ?? ''} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="input">
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Reputación</label>
                <input type="number" value={form.reputationScore ?? 0} onChange={(e) => setForm((f) => ({ ...f, reputationScore: Number(e.target.value) }))} className="input" />
              </div>
              <div className="form-group">
                <label>CBU/CVU (22 dígitos, para recibir pagos)</label>
                <input value={form.cbuCvu ?? ''} onChange={(e) => setForm((f) => ({ ...f, cbuCvu: e.target.value.replace(/\D/g, '').slice(0, 22) }))} className="input" placeholder="0000000000000000000000" maxLength={22} />
              </div>
              <div className="form-group">
                <label>Nombre del banco</label>
                <input value={form.bankName ?? ''} onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))} className="input" placeholder="Opcional" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
              <button type="button" className="btn btn-sm" style={{ background: 'transparent', color: 'var(--text-muted)' }} onClick={() => setEditModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación Eliminar */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h2>¿Eliminar usuario?</h2>
            <p style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>
              Se eliminará permanentemente <strong>{user.email}</strong> de Firebase Auth y Firestore. Esta acción no se puede deshacer.
            </p>
            <p style={{ margin: '0.5rem 0', fontSize: '0.875rem', color: 'var(--danger)' }}>
              Escribí <strong>ELIMINAR</strong> para confirmar:
            </p>
            <input
              type="text"
              className="input"
              placeholder="ELIMINAR"
              value={deleteConfirmText}
              style={{ marginBottom: 16 }}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn btn-danger"
                onClick={remove}
                disabled={deleting || deleteConfirmText.toUpperCase() !== 'ELIMINAR'}
              >
                {deleting ? 'Eliminando…' : 'Eliminar'}
              </button>
              <button type="button" className="btn btn-sm" style={{ background: 'transparent', color: 'var(--text-muted)' }} onClick={() => setDeleteConfirm(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
