import { useState, useEffect } from 'react';
import { api } from '../lib/api';

type Stats = {
  usersCount: number;
  ordersCount: number;
  ordersCompleted: number;
  disputesOpen: number;
  kycPending: number;
  listingsCount: number;
  ticketsPending?: number;
};

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Stats>('/api/admin/stats')
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando estadísticas…</p>;
  if (!stats) return <p>No se pudieron cargar las estadísticas.</p>;

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-title">Dashboard</h1>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="value">{stats.usersCount}</div>
          <div className="label">Usuarios</div>
        </div>
        <div className="stat-card">
          <div className="value">{stats.ordersCount}</div>
          <div className="label">Órdenes totales</div>
        </div>
        <div className="stat-card">
          <div className="value">{stats.ordersCompleted}</div>
          <div className="label">Órdenes completadas</div>
        </div>
        <div className="stat-card">
          <div className="value">{stats.disputesOpen}</div>
          <div className="label">Disputas abiertas</div>
        </div>
        <div className="stat-card">
          <div className="value">{stats.kycPending}</div>
          <div className="label">KYC pendientes</div>
        </div>
        <div className="stat-card">
          <div className="value">{stats.listingsCount}</div>
          <div className="label">Tickets disponibles</div>
        </div>
        <div className="stat-card">
          <div className="value">{stats.ticketsPending ?? 0}</div>
          <div className="label">Tickets pendientes de revisión</div>
        </div>
      </div>
    </>
  );
}
