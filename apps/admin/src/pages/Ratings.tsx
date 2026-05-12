/**
 * Valoraciones entre usuarios tras órdenes completadas (Firestore orderRatings).
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

type RatingRow = {
  id: string;
  orderId: string;
  raterId: string;
  ratedUserId: string;
  positive: boolean;
  points: number;
  createdAt: string;
  rater: { id: string; email?: string } | null;
  ratedUser: { id: string; email?: string } | null;
};

export function Ratings() {
  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [orderFilter, setOrderFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 25;

  const loadRatings = (p: number) => {
    setLoading(true);
    const q = new URLSearchParams({ page: String(p), limit: String(limit) });
    if (orderFilter.trim()) q.set('orderId', orderFilter.trim());
    api<{ ratings: RatingRow[]; total: number }>(`/api/admin/ratings?${q}`)
      .then((d) => {
        setRatings(d.ratings);
        setTotal(d.total);
      })
      .catch(() => {
        setRatings([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRatings(page);
  }, [page]);

  const applyFilter = () => {
    setPage(1);
    loadRatings(1);
  };

  const togglePositive = async (r: RatingRow) => {
    if (!confirm(`¿Marcar como ${r.positive ? 'negativa' : 'positiva'}? Se ajustará la reputación del usuario valorado.`)) return;
    try {
      await api(`/api/admin/ratings/${r.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ positive: !r.positive }),
      });
      loadRatings(page);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    }
  };

  const remove = async (r: RatingRow) => {
    if (!confirm('¿Eliminar esta valoración? Si era positiva, se restará reputación.')) return;
    try {
      await api(`/api/admin/ratings/${r.id}`, { method: 'DELETE' });
      loadRatings(page);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-title">Valoraciones</h1>
      </div>
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
            <label>Filtrar por ID de orden</label>
            <input
              className="input"
              value={orderFilter}
              onChange={(e) => setOrderFilter(e.target.value)}
              placeholder="Opcional"
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={applyFilter}>
            Buscar
          </button>
        </div>
      </div>
      {loading ? (
        <p>Cargando…</p>
      ) : ratings.length === 0 ? (
        <p className="text-muted">No hay valoraciones.</p>
      ) : (
        <div className="card table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Orden</th>
                <th>Quien valora</th>
                <th>Valorado</th>
                <th>Tipo</th>
                <th>Puntos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((r) => (
                <tr key={r.id}>
                  <td>{formatDate(r.createdAt)}</td>
                  <td>
                    <Link to={`/orders/${r.orderId}`} className="btn btn-sm">
                      {r.orderId.slice(0, 8)}…
                    </Link>
                  </td>
                  <td>
                    <Link to={`/users/${r.raterId}`}>{r.rater?.email || r.raterId.slice(0, 8)}</Link>
                  </td>
                  <td>
                    <Link to={`/users/${r.ratedUserId}`}>{r.ratedUser?.email || r.ratedUserId.slice(0, 8)}</Link>
                  </td>
                  <td>
                    <span className={`badge ${r.positive ? 'badge-approved' : 'badge-rejected'}`}>
                      {r.positive ? 'Positiva' : 'Negativa'}
                    </span>
                  </td>
                  <td>{r.points}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button type="button" className="btn btn-sm" onClick={() => togglePositive(r)}>
                      Invertir
                    </button>{' '}
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(r)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination">
            <button type="button" className="btn btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </button>
            <span style={{ color: 'var(--text-muted)' }}>
              Página {page} de {totalPages} ({total} total)
            </span>
            <button
              type="button"
              className="btn btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </>
  );
}
