import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, ShieldCheck, MessageSquare, ShoppingBag, MessagesSquare, Settings, LogOut } from 'lucide-react';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const nav = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/users', label: 'Usuarios', icon: Users },
    { to: '/kyc', label: 'KYC', icon: ShieldCheck },
    { to: '/disputes', label: 'Disputas', icon: MessageSquare },
    { to: '/conversations', label: 'Mensajería', icon: MessagesSquare },
    { to: '/orders', label: 'Órdenes', icon: ShoppingBag },
    { to: '/configuracion', label: 'Configuración', icon: Settings },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ padding: '0 1.25rem 1rem', fontWeight: 700, fontSize: '1.1rem' }}>TT Admin</div>
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
            <Icon size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            {label}
          </NavLink>
        ))}
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <span style={{ padding: '0.75rem 1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {user?.email}
          </span>
          <button
            type="button"
            className="btn btn-sm"
            style={{ margin: '0 1.25rem', background: 'transparent', color: 'var(--text-muted)' }}
            onClick={() => { logout(); navigate('/login'); }}
          >
            <LogOut size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Salir
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
