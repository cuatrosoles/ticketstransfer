import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { downloadCsv } from '../utils/exportCsv';

type Order = {
  id: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  ticketListing: { eventName: string; price: number };
  buyer: { email: string };
  seller: { email: string };
};

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'PENDIENTE_PAGO', label: 'Pendiente pago' },
  { value: 'PAGADO', label: 'Pagado' },
  { value: 'ESPERANDO_TRANSFERENCIA', label: 'Esperando transferencia' },
  { value: 'COMPLETADA', label: 'Completada' },
  { value: 'CANCELADA', label: 'Cancelada' },
  { value: 'EN_DISPUTA', label: 'En disputa' },
];

export function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const limit = 20;

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams();
    p.set('page', String(page));
    p.set('limit', String(limit));
    if (statusFilter) p.set('status', statusFilter);
    api<{ orders: Order[]; total: number }>(`/api/admin/orders?${p.toString()}`)
      .then((data) => {
        setOrders(data.orders);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const p = new URLSearchParams();
      p.set('page', '1');
      p.set('limit', '5000');
      if (statusFilter) p.set('status', statusFilter);
      const data = await api<{ orders: Order[] }>(`/api/admin/orders?${p.toString()}`);
      const rows = data.orders.map((o) => [
        o.id,
        o.ticketListing.eventName,
        o.buyer.email,
        o.seller.email,
        o.totalAmount,
        o.currency,
        o.status,
        new Date(o.createdAt).toISOString(),
      ]);
      downloadCsv(
        `ordenes-${new Date().toISOString().slice(0, 10)}.csv`,
        ['ID', 'Evento', 'Comprador', 'Vendedor', 'Total', 'Moneda', 'Estado', 'Fecha'],
        rows
      );
    } catch {
      // ignore
    } finally {
      setExporting(false);
    }
  };

  if (loading && page === 1) return <p>Cargando…</p>;

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-title">Órdenes</h1>
        <div className="admin-header-actions">
          <select className="input" style={{ width: 180 }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exportando…' : 'Exportar CSV'}
          </button>
        </div>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Evento</th>
                <th>Comprador</th>
                <th>Vendedor</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/orders/${o.id}`)}>
                  <td><Link to={`/orders/${o.id}`} onClick={(e) => e.stopPropagation()} style={{ color: 'var(--primary)', textDecoration: 'none' }}><code>{o.id.slice(0, 8)}…</code></Link></td>
                  <td>{o.ticketListing.eventName}</td>
                  <td>{o.buyer.email}</td>
                  <td>{o.seller.email}</td>
                  <td>{o.totalAmount} {o.currency}</td>
                  <td><span className="badge badge-pending">{o.status}</span></td>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > limit && (
          <div className="pagination">
            <button type="button" className="btn btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</button>
            <span>Página {page} de {Math.ceil(total / limit)}</span>
            <button type="button" className="btn btn-sm" disabled={page >= Math.ceil(total / limit)} onClick={() => setPage((p) => p + 1)}>Siguiente</button>
          </div>
        )}
      </div>
    </>
  );
}
