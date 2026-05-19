/**
 * Home / Dashboard – Buscador, Publicar ticket, Mis compras, Mis ventas.
 * Ubicación: apps/web/src/pages/Home.tsx
 */

import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="page-content">
      <h1 className="page-title">Tickets Transfer</h1>
      <p className="text-muted mb-2">Tu forma segura de revender e intercambiar entradas en Argentina.</p>
      <div className="home-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <Link to="/publicar" className="glass" style={{ padding: 20, borderRadius: 12, textDecoration: 'none', color: 'var(--text)', fontWeight: 600 }}>
          Publicar ticket
        </Link>
        <Link to="/mis-compras" className="glass" style={{ padding: 20, borderRadius: 12, textDecoration: 'none', color: 'var(--text)', fontWeight: 600 }}>
          Mis compras
        </Link>
        <Link to="/mis-ventas" className="glass" style={{ padding: 20, borderRadius: 12, textDecoration: 'none', color: 'var(--text)', fontWeight: 600 }}>
          Mis ventas
        </Link>
      </div>
    </div>
  );
}
