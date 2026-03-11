import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { downloadCsv } from '../utils/exportCsv';
import { CreditCard } from 'lucide-react';

type CardItem = {
  id: string;
  last_four_digits: string;
  payment_method: { id: string; name: string };
};

type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: string;
  kyc: { status: string } | null;
};

export function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [kycStatus, setKycStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [cardsModal, setCardsModal] = useState<{
    user: User;
    cards: CardItem[];
    loading: boolean;
  } | null>(null);

  const limit = 20;
  const queryParams = () => {
    const p = new URLSearchParams();
    p.set('page', String(page));
    p.set('limit', String(limit));
    if (q) p.set('q', q);
    if (role) p.set('role', role);
    if (kycStatus) p.set('kycStatus', kycStatus);
    return p.toString();
  };

  useEffect(() => {
    setLoading(true);
    api<{ users: User[]; total: number }>(`/api/admin/users?${queryParams()}`)
      .then((data) => {
        setUsers(data.users);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, q, role, kycStatus]);

  const openCardsModal = async (user: User) => {
    setCardsModal({ user, cards: [], loading: true });
    try {
      const data = await api<{ cards: CardItem[] }>(`/api/admin/users/${user.id}/cards`);
      setCardsModal((m) => (m ? { ...m, cards: data.cards, loading: false } : null));
    } catch {
      setCardsModal((m) => (m ? { ...m, cards: [], loading: false } : null));
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const p = new URLSearchParams();
      p.set('page', '1');
      p.set('limit', '5000');
      if (q) p.set('q', q);
      if (role) p.set('role', role);
      if (kycStatus) p.set('kycStatus', kycStatus);
      const data = await api<{ users: User[] }>(`/api/admin/users?${p.toString()}`);
      const rows = data.users.map((u) => [
        u.email,
        u.firstName ?? '',
        u.lastName ?? '',
        u.role,
        u.kyc?.status ?? 'PENDIENTE',
        new Date(u.createdAt).toISOString(),
      ]);
      downloadCsv(
        `usuarios-${new Date().toISOString().slice(0, 10)}.csv`,
        ['Email', 'Nombre', 'Apellido', 'Rol', 'KYC', 'Fecha registro'],
        rows
      );
    } catch {
      // ignore
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-title">Usuarios</h1>
        <div className="admin-header-actions">
          <input
            type="search"
            className="input"
            placeholder="Buscar..."
            style={{ width: 200 }}
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
          />
          <select className="input" style={{ width: 120 }} value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }} aria-label="Filtrar por rol">
            <option value="">Rol: todos</option>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <select className="input" style={{ width: 140 }} value={kycStatus} onChange={(e) => { setKycStatus(e.target.value); setPage(1); }}>
            <option value="">KYC: todos</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_REVISION">En revisión</option>
            <option value="APROBADO">Aprobado</option>
            <option value="RECHAZADO">Rechazado</option>
          </select>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exportando…' : 'Exportar CSV'}
          </button>
        </div>
      </div>
      <div className="card">
        <div className="table-wrap">
          {loading ? (
            <p>Cargando…</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Nombre</th>
                  <th>Rol</th>
                  <th>KYC</th>
                  <th>Registro</th>
                  <th>Tarjetas</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/users/${u.id}`)}>
                    <td><Link to={`/users/${u.id}`} onClick={(e) => e.stopPropagation()} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{u.email}</Link></td>
                    <td>{[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}</td>
                    <td>{u.role}</td>
                    <td>
                      <span className={`badge badge-${u.kyc?.status === 'APROBADO' ? 'approved' : u.kyc?.status === 'RECHAZADO' ? 'rejected' : 'pending'}`}>
                        {u.kyc?.status || 'PENDIENTE'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={(e) => { e.stopPropagation(); openCardsModal(u); }}
                        title="Ver tarjetas adheridas"
                      >
                        <CreditCard size={16} style={{ marginRight: 4 }} />
                        Tarjetas
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {total > limit && (
          <div className="pagination">
            <button type="button" className="btn btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</button>
            <span>Página {page} de {Math.ceil(total / limit)}</span>
            <button type="button" className="btn btn-sm" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage((p) => p + 1)}>Siguiente</button>
          </div>
        )}
      </div>

      {cardsModal && (
        <div className="modal-overlay" onClick={() => setCardsModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Tarjetas adheridas – {cardsModal.user.email}</h2>
            <p className="text-muted">
              {[cardsModal.user.firstName, cardsModal.user.lastName].filter(Boolean).join(' ') || 'Sin nombre'}
            </p>
            {cardsModal.loading ? (
              <p>Cargando…</p>
            ) : cardsModal.cards.length === 0 ? (
              <p>No tiene tarjetas guardadas.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {cardsModal.cards.map((c) => (
                  <li key={c.id} style={{ padding: '8px 0', borderBottom: '1px solid #334155' }}>
                    {c.payment_method?.name || c.payment_method?.id || 'Tarjeta'} •••• {c.last_four_digits}
                  </li>
                ))}
              </ul>
            )}
            <button type="button" className="btn btn-primary" onClick={() => setCardsModal(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
