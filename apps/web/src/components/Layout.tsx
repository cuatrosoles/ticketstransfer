/**
 * Layout con cabecera y navegación para rutas protegidas.
 * Ubicación: apps/web/src/components/Layout.tsx
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, LogOut } from 'lucide-react';

type Props = { children: React.ReactNode };

export function Layout({ children }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="bg-pattern">
      <header className="layout-header glass">
        <button type="button" className="header-btn" aria-label="Menú">
          <Menu size={24} />
        </button>
        <Link to="/home" className="logo-tt" style={{ textDecoration: 'none' }}>
          <span className="logo-tt-icon">TT</span>
          <span>Tickets Transfer</span>
        </Link>
        <button type="button" className="header-btn" onClick={handleLogout} aria-label="Cerrar sesión">
          <LogOut size={22} />
        </button>
      </header>
      <main>{children}</main>
    </div>
  );
}
