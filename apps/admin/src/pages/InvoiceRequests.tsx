import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

type InvoiceRequestRow = {
  id: string;
  orderId: string;
  requesterEmail: string;
  role: string;
  status: string;
  orderStatus: string;
  totalAmount: number;
  currency: string;
  eventName: string;
  note: string | null;
  createdAt: string;
};

export function InvoiceRequests() {
  const [items, setItems] = useState<InvoiceRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError('');
    api<{ items: InvoiceRequestRow[] }>('/api/admin/invoice-requests')
      .then((d) => setItems(d.items))
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const markStatus = async (id: string, status: 'ATENDIDA' | 'PENDIENTE') => {
    setBusyId(id);
    try {
      await api(`/api/admin/invoice-requests/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await load();
    } catch {
      // ignore
    } finally {
      setBusyId(null);
    }
  };

  if (loading && items.length === 0) return <p>Cargando…</p>;

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-title">Facturas de transacción</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          Solicitudes registradas desde la app (comprador o vendedor). Emití la factura fuera de la plataforma y marcá como atendida.
        </p>
      </div>
      {error ? <p style={{ color: '#f87171' }}>{error}</p> : null}
      <div className="card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Orden</th>
              <th>Evento</th>
              <th>Solicitante</th>
              <th>Rol</th>
              <th>Monto</th>
              <th>Estado orden</th>
              <th>Estado</th>
              <th>Nota</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No hay solicitudes registradas.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id}>
                  <td>{row.createdAt ? new Date(row.createdAt).toLocaleString('es-AR') : '—'}</td>
                  <td>
                    <Link to={`/orders/${row.orderId}`}>{row.orderId.slice(0, 8)}…</Link>
                  </td>
                  <td>{row.eventName || '—'}</td>
                  <td>{row.requesterEmail || '—'}</td>
                  <td>{row.role === 'buyer' ? 'Comprador' : 'Vendedor'}</td>
                  <td>
                    {row.currency} {Number(row.totalAmount).toLocaleString('es-AR')}
                  </td>
                  <td>{row.orderStatus}</td>
                  <td>{row.status}</td>
                  <td style={{ maxWidth: 160, fontSize: '0.85rem' }}>{row.note || '—'}</td>
                  <td>
                    {row.status === 'PENDIENTE' ? (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={busyId === row.id}
                        onClick={() => markStatus(row.id, 'ATENDIDA')}
                      >
                        {busyId === row.id ? '…' : 'Marcar atendida'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-sm"
                        disabled={busyId === row.id}
                        onClick={() => markStatus(row.id, 'PENDIENTE')}
                      >
                        Reabrir
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
