import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { downloadCsv } from '../utils/exportCsv';

type Dispute = {
  id: string;
  status: string;
  reason: string | null;
  createdAt: string;
  order: {
    id: string;
    ticketListing: { eventName: string; eventDate: string };
    buyer: { id: string; email: string };
    seller: { id: string; email: string };
  };
};

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'ABIERTA', label: 'Abierta' },
  { value: 'EN_REVISION', label: 'En revisión' },
  { value: 'ESPERANDO_INFO', label: 'Esperando info' },
  { value: 'RESUELTA_FAVOR_COMPRADOR', label: 'Resuelta (comprador)' },
  { value: 'RESUELTA_FAVOR_VENDEDOR', label: 'Resuelta (vendedor)' },
];

export function Disputes() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const q = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : '';
    api<Dispute[]>(`/api/admin/disputes${q}`)
      .then(setDisputes)
      .catch(() => setDisputes([]))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const handleExport = () => {
    setExporting(true);
    const rows = disputes.map((d) => [
      d.id,
      d.order.ticketListing.eventName,
      d.order.id,
      d.order.buyer.email,
      d.order.seller.email,
      d.status,
      (d.reason ?? '').slice(0, 200),
      new Date(d.createdAt).toISOString(),
    ]);
    downloadCsv(
      `disputas-${new Date().toISOString().slice(0, 10)}.csv`,
      ['ID disputa', 'Evento', 'ID orden', 'Comprador', 'Vendedor', 'Estado', 'Motivo', 'Fecha'],
      rows
    );
    setExporting(false);
  };

  if (loading && disputes.length === 0) return <p>Cargando…</p>;

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-title">Disputas</h1>
        <div className="admin-header-actions">
          <select className="input" style={{ width: 180 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleExport} disabled={exporting || disputes.length === 0}>
            {exporting ? 'Exportando…' : 'Exportar CSV'}
          </button>
        </div>
      </div>
      {disputes.length === 0 ? (
        <div className="card">No hay disputas.</div>
      ) : (
        disputes.map((d) => (
          <div key={d.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <strong>{d.order.ticketListing.eventName}</strong>
                <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>Orden {d.order.id.slice(0, 8)}…</span>
                <div style={{ marginTop: 4, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Comprador: {d.order.buyer.email} · Vendedor: {d.order.seller.email}
                </div>
                {d.reason && <p style={{ marginTop: 8, marginBottom: 0 }}>{d.reason}</p>}
              </div>
              <span className={`badge badge-${d.status.includes('RESUELTA') ? 'approved' : 'open'}`}>{d.status}</span>
              <Link to={`/disputes/${d.id}`} className="btn btn-primary btn-sm">Ver y resolver</Link>
            </div>
          </div>
        ))
      )}
    </>
  );
}
