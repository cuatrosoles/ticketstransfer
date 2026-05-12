/**
 * Panel de estadísticas – datos reales desde /api/admin/analytics + animaciones.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import {
  Activity,
  ArrowRight,
  BarChart3,
  MessageSquare,
  RefreshCw,
  ShoppingBag,
  ShieldCheck,
  Star,
  Ticket,
  TrendingUp,
  Users,
} from 'lucide-react';

type Overview = {
  usersCount: number;
  ordersCount: number;
  ordersCompleted: number;
  listingsPublished: number;
  listingsAvailable: number;
  ticketsPendingReview: number;
  disputesOpen: number;
  kycPendingReview: number;
  conversationsCount: number;
  messagesCount: number;
  invoiceRequestsPending: number;
};

type Analytics = {
  generatedAt: string;
  overview: Overview;
  revenue: { completedOrdersCount: number; totalAmountCompletedSum: number; currency: string };
  ratings: { positive: number; negative: number };
  ordersByStatus: Record<string, number>;
  listingsByStatus: Record<string, number>;
  disputesByStatus: Record<string, number>;
  transfersByStatus: Record<string, number>;
  transfers: { totalRecords: number; pendingVolumeApprox: number };
  recentOrders: Array<{
    id: string;
    status: string;
    totalAmount: number;
    currency: string;
    createdAt: string | null;
  }>;
};

function useAnimatedInt(target: number, durationMs = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - p) ** 3;
      setV(Math.round(from + (target - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return v;
}

function formatMoney(n: number, currency = 'ARS') {
  try {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${currency} ${Math.round(n).toLocaleString('es-AR')}`;
  }
}

function formatShortDate(iso: string | null) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es-AR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function Dashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api<Analytics>('/api/admin/analytics')
      .then(setData)
      .catch((e) => {
        setData(null);
        setError(e instanceof Error ? e.message : 'Error');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const o = data?.overview;
  const usersN = useAnimatedInt(o?.usersCount ?? 0);
  const ordersN = useAnimatedInt(o?.ordersCount ?? 0);
  const completedN = useAnimatedInt(o?.ordersCompleted ?? 0);
  const revenueN = useAnimatedInt(Math.round(data?.revenue.totalAmountCompletedSum ?? 0), 1800);

  const ordersBars = useMemo(() => {
    if (!data?.ordersByStatus) return [];
    return Object.entries(data.ordersByStatus)
      .filter(([, c]) => c > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [data]);

  const maxOrderBar = useMemo(() => Math.max(1, ...ordersBars.map(([, c]) => c)), [ordersBars]);

  const ratingTotal = (data?.ratings.positive ?? 0) + (data?.ratings.negative ?? 0);
  const ratingPct = ratingTotal > 0 ? Math.round(((data?.ratings.positive ?? 0) / ratingTotal) * 100) : 0;

  if (loading && !data) {
    return (
      <div className="dash-page">
        <div className="dash-loading">
          <div className="dash-orbit" />
          <p>Cargando analíticas…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="dash-page">
        <div className="admin-header">
          <h1 className="admin-title">Estadísticas</h1>
          <button type="button" className="btn btn-primary btn-sm" onClick={load}>
            <RefreshCw size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Reintentar
          </button>
        </div>
        <p className="text-muted">{error || 'Sin datos.'}</p>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <div className="dash-hero">
        <div className="dash-hero-bg" aria-hidden />
        <div className="dash-hero-content">
          <div className="dash-hero-badge">
            <BarChart3 size={16} />
            Panel en vivo
          </div>
          <h1 className="dash-hero-title">Estadísticas</h1>
          <p className="dash-hero-sub">
            Visión operativa de Tickets Transfer · actualizado{' '}
            {new Date(data.generatedAt).toLocaleString('es-AR')}
          </p>
          <button type="button" className="dash-hero-refresh" onClick={load} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'dash-spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      <section className="dash-kpi-grid">
        <article className="dash-kpi dash-kpi-users">
          <Users className="dash-kpi-icon" size={22} />
          <span className="dash-kpi-label">Usuarios</span>
          <span className="dash-kpi-value">{usersN.toLocaleString('es-AR')}</span>
          <Link to="/users" className="dash-kpi-link">
            Ver listado <ArrowRight size={14} />
          </Link>
        </article>
        <article className="dash-kpi dash-kpi-orders">
          <ShoppingBag className="dash-kpi-icon" size={22} />
          <span className="dash-kpi-label">Órdenes</span>
          <span className="dash-kpi-value">{ordersN.toLocaleString('es-AR')}</span>
          <span className="dash-kpi-meta">{completedN} completadas</span>
          <Link to="/orders" className="dash-kpi-link">
            Órdenes <ArrowRight size={14} />
          </Link>
        </article>
        <article className="dash-kpi dash-kpi-money">
          <TrendingUp className="dash-kpi-icon" size={22} />
          <span className="dash-kpi-label">Volumen órdenes completadas</span>
          <span className="dash-kpi-value accent">{formatMoney(revenueN, data.revenue.currency)}</span>
          <span className="dash-kpi-meta">{data.revenue.completedOrdersCount} órdenes sumadas</span>
        </article>
        <article className="dash-kpi dash-kpi-tickets">
          <Ticket className="dash-kpi-icon" size={22} />
          <span className="dash-kpi-label">Tickets disponibles</span>
          <span className="dash-kpi-value">{data.overview.listingsAvailable}</span>
          <span className="dash-kpi-meta">{data.overview.ticketsPendingReview} pendientes revisión</span>
          <Link to="/tickets" className="dash-kpi-link">
            Moderar <ArrowRight size={14} />
          </Link>
        </article>
        <article className="dash-kpi dash-kpi-risk">
          <Activity className="dash-kpi-icon" size={22} />
          <span className="dash-kpi-label">Disputas abiertas</span>
          <span className="dash-kpi-value warn">{data.overview.disputesOpen}</span>
          <Link to="/disputes" className="dash-kpi-link">
            Resolver <ArrowRight size={14} />
          </Link>
        </article>
        <article className="dash-kpi dash-kpi-kyc">
          <ShieldCheck className="dash-kpi-icon" size={22} />
          <span className="dash-kpi-label">KYC en revisión</span>
          <span className="dash-kpi-value">{data.overview.kycPendingReview}</span>
          <Link to="/kyc" className="dash-kpi-link">
            Revisar <ArrowRight size={14} />
          </Link>
        </article>
        <article className="dash-kpi dash-kpi-chat">
          <MessageSquare className="dash-kpi-icon" size={22} />
          <span className="dash-kpi-label">Mensajes / chats</span>
          <span className="dash-kpi-value">{data.overview.messagesCount.toLocaleString('es-AR')}</span>
          <span className="dash-kpi-meta">{data.overview.conversationsCount} conversaciones</span>
          <Link to="/conversations" className="dash-kpi-link">
            Abrir <ArrowRight size={14} />
          </Link>
        </article>
        <article className="dash-kpi dash-kpi-star">
          <Star className="dash-kpi-icon" size={22} />
          <span className="dash-kpi-label">Valoraciones +</span>
          <span className="dash-kpi-value">{data.ratings.positive}</span>
          <span className="dash-kpi-meta">{data.ratings.negative} negativas</span>
          <Link to="/ratings" className="dash-kpi-link">
            Gestionar <ArrowRight size={14} />
          </Link>
        </article>
      </section>

      <div className="dash-row">
        <section className="dash-card dash-chart-card">
          <h2 className="dash-card-title">
            <BarChart3 size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Órdenes por estado
          </h2>
          <div className="dash-bars">
            {ordersBars.map(([label, count]) => (
              <div key={label} className="dash-bar-row">
                <span className="dash-bar-label" title={label}>
                  {label}
                </span>
                <div className="dash-bar-track">
                  <div
                    className="dash-bar-fill"
                    style={{ width: `${(count / maxOrderBar) * 100}%` }}
                    data-count={count}
                  />
                </div>
                <span className="dash-bar-count">{count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="dash-card dash-side">
          <h2 className="dash-card-title">Valoraciones</h2>
          <div
            className="dash-donut"
            style={{
              background: `conic-gradient(var(--primary) 0% ${ratingPct}%, rgba(148, 163, 184, 0.35) ${ratingPct}% 100%)`,
            }}
          >
            <div className="dash-donut-hole">
              <span className="dash-donut-pct">{ratingPct}%</span>
              <span className="dash-donut-sub">positivas</span>
            </div>
          </div>
          <ul className="dash-mini-list">
            <li>
              <span className="dot pos" /> Positivas: <strong>{data.ratings.positive}</strong>
            </li>
            <li>
              <span className="dot neg" /> Negativas: <strong>{data.ratings.negative}</strong>
            </li>
          </ul>

          <h3 className="dash-subtitle">Transferencias</h3>
          <p className="dash-muted">
            {data.transfers.totalRecords} registros · pendiente aprox.{' '}
            <strong>{formatMoney(data.transfers.pendingVolumeApprox)}</strong>
          </p>
          <div className="dash-pills">
            {Object.entries(data.transfersByStatus).map(([st, n]) =>
              n > 0 ? (
                <span key={st} className="dash-pill">
                  {st}: {n}
                </span>
              ) : null
            )}
          </div>

          <h3 className="dash-subtitle">Publicaciones</h3>
          <div className="dash-pills">
            {Object.entries(data.listingsByStatus).map(([st, n]) =>
              n > 0 ? (
                <span key={st} className="dash-pill soft">
                  {st}: {n}
                </span>
              ) : null
            )}
          </div>
        </section>
      </div>

      <section className="dash-card dash-table-card">
        <h2 className="dash-card-title">Actividad reciente (órdenes)</h2>
        <div className="table-wrap">
          <table className="admin-table dash-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Estado</th>
                <th>Monto</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((row) => (
                <tr key={row.id}>
                  <td>
                    <code>{row.id.slice(0, 10)}…</code>
                  </td>
                  <td>
                    <span className="badge badge-open">{row.status}</span>
                  </td>
                  <td>{formatMoney(row.totalAmount, row.currency)}</td>
                  <td>{formatShortDate(row.createdAt)}</td>
                  <td>
                    <Link to={`/orders/${row.id}`} className="btn btn-sm btn-primary">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.overview.invoiceRequestsPending > 0 && (
          <p className="dash-footer-hint">
            <Link to="/invoice-requests">{data.overview.invoiceRequestsPending} solicitudes de factura pendientes →</Link>
          </p>
        )}
      </section>
    </div>
  );
}
