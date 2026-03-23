/**
 * Dashboard de transferencias a vendedores.
 * Lista transferencias, permite marcar como enviada manualmente y reintentar fallidas.
 */

import { useEffect, useState } from 'react';
import { api } from '../lib/api';

type Transfer = {
  id: string;
  orderId: string;
  sellerId: string;
  amount: number;
  currency: string;
  status: string;
  payoutId?: string;
  errorMessage?: string;
  seller?: { id: string; email?: string; firstName?: string; lastName?: string; cbuCvu?: string };
  order?: { id: string; totalAmount?: number };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  ENVIADO: 'Enviado (MP)',
  COMPLETADO: 'Completado',
  FALLIDO: 'Fallido',
  PENDIENTE_MANUAL: 'Pendiente manual',
  ENVIADO_MANUAL: 'Enviado manual',
};

const STATUS_COLOR: Record<string, string> = {
  PENDIENTE: '#f59e0b',
  ENVIADO: '#22c55e',
  COMPLETADO: '#22c55e',
  FALLIDO: '#ef4444',
  PENDIENTE_MANUAL: '#f59e0b',
  ENVIADO_MANUAL: '#22c55e',
};

export function Transfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const data = await api<{ transfers: Transfer[] }>(`/api/admin/transfers?${params}`);
      setTransfers(data.transfers || []);
    } catch {
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleManualComplete = async (id: string) => {
    setActionLoading(id);
    try {
      await api(`/api/admin/transfers/${id}/manual-complete`, { method: 'POST' });
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRetry = async (id: string) => {
    setActionLoading(id);
    try {
      await api(`/api/admin/transfers/${id}/retry`, { method: 'POST' });
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (d: string | undefined) => (d ? new Date(d).toLocaleString('es-AR') : '-');
  const formatAmount = (n: number, curr: string) => `${curr} ${n.toLocaleString('es-AR')}`;

  const pendingCount = transfers.filter((t) => ['PENDIENTE', 'PENDIENTE_MANUAL', 'FALLIDO'].includes(t.status)).length;

  return (
    <div className="page">
      <h1>Transferencias a vendedores</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Transferencias automáticas al marcar órdenes como completadas. Las pendientes manuales requieren que realices la transferencia fuera de la plataforma y marques como enviada.
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-select"
          style={{ width: 'auto' }}
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        {pendingCount > 0 && (
          <span style={{ padding: '0.25rem 0.75rem', background: '#f59e0b22', color: '#f59e0b', borderRadius: 8, fontSize: '0.875rem' }}>
            {pendingCount} pendiente(s)
          </span>
        )}
      </div>

      {loading ? (
        <p>Cargando…</p>
      ) : transfers.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>No hay transferencias.</p>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Orden</th>
                <th>Vendedor</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((t) => (
                <tr key={t.id}>
                  <td>
                    <a href={`/orders/${t.orderId}`} style={{ color: 'var(--primary)' }}>{t.orderId.slice(0, 8)}…</a>
                  </td>
                  <td>
                    <div>{t.seller?.email || t.sellerId}</div>
                    {t.seller?.cbuCvu && (
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        CBU: ****{t.seller.cbuCvu?.slice(-4)}
                      </small>
                    )}
                  </td>
                  <td>{formatAmount(t.amount, t.currency)}</td>
                  <td>
                    <span style={{ color: STATUS_COLOR[t.status] || 'inherit', fontWeight: 500 }}>
                      {STATUS_LABELS[t.status] || t.status}
                    </span>
                    {t.errorMessage && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 200 }} title={t.errorMessage}>
                        {t.errorMessage.slice(0, 50)}…
                      </div>
                    )}
                  </td>
                  <td>{formatDate(t.createdAt)}</td>
                  <td>
                    {t.status === 'PENDIENTE_MANUAL' && (
                      <button
                        className="btn btn-sm btn-primary"
                        disabled={!!actionLoading}
                        onClick={() => handleManualComplete(t.id)}
                      >
                        {actionLoading === t.id ? '…' : 'Marcar enviada'}
                      </button>
                    )}
                    {(t.status === 'FALLIDO' || t.status === 'PENDIENTE_MANUAL') && t.seller?.cbuCvu && (
                      <button
                        className="btn btn-sm"
                        style={{ marginLeft: 4 }}
                        disabled={!!actionLoading}
                        onClick={() => handleRetry(t.id)}
                      >
                        {actionLoading === t.id ? '…' : 'Reintentar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
