/**
 * Layout estilo KYC: AppHeader (logo + título + back), menú usuario, contenido en screen-center auth-screen.
 * Mismo estilo que la página KYC en todas las pantallas autenticadas.
 */

import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import { AppHeader } from './AppHeader';

const ROUTE_TITLES: Record<string, string> = {
  '/home': 'Inicio',
  '/kyc': 'Verificación KYC',
  '/kyc/callback': 'Verificación KYC',
  '/publicar': 'Publicar ticket',
  '/comprar-ticket': 'Comprar ticket',
  '/mis-compras': 'Mis compras',
  '/mis-ventas': 'Mis ventas',
  '/perfil': 'Mi perfil',
  '/tickets': 'Tickets',
  '/soporte': 'Chat Soporte',
  '/mensajes': 'Mensajes',
  '/acerca': 'Acerca de',
  '/politica-privacidad': 'Política de privacidad',
  '/terminos-y-condiciones': 'Términos y condiciones',
  '/solicitar-baja': 'Solicitar baja',
};

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/orden/')) return 'Pago';
  return ROUTE_TITLES[pathname] ?? 'Inicio';
}

type Props = { children: React.ReactNode };

export function Layout({ children }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const pageTitle = getPageTitle(pathname);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const userMenu = (
    <div className="header-user-wrap" ref={dropdownRef}>
      <button
        type="button"
        className={`header-btn header-btn-user${menuOpen ? ' header-btn-user-active' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menú usuario"
        aria-expanded={menuOpen}
      >
        <User size={22} strokeWidth={2} />
      </button>
      {menuOpen && (
        <>
          <button
            type="button"
            className="user-dropdown-overlay"
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
          />
          <nav className="user-dropdown glass">
            <Link to="/home" onClick={() => setMenuOpen(false)}>Inicio</Link>
            <Link to="/perfil" onClick={() => setMenuOpen(false)}>Información de tu perfil</Link>
            <Link to="/tickets" onClick={() => setMenuOpen(false)}>Tickets</Link>
            <Link to="/soporte" onClick={() => setMenuOpen(false)}>Chat Soporte</Link>
            <Link to="/mensajes" onClick={() => setMenuOpen(false)}>Mensajes</Link>
            <Link to="/politica-privacidad" onClick={() => setMenuOpen(false)} className="user-menu-link">Política de privacidad y uso de datos</Link>
            <Link to="/terminos-y-condiciones" onClick={() => setMenuOpen(false)} className="user-menu-link">Términos y condiciones de uso</Link>
            <Link to="/acerca" onClick={() => setMenuOpen(false)} className="user-menu-link">Acerca de</Link>
            <Link to="/solicitar-baja" onClick={() => setMenuOpen(false)} className="user-menu-link">Solicitar baja de cuenta</Link>
          </nav>
        </>
      )}
    </div>
  );

  return (
    <div className="bg-pattern bg-pattern-auth">
      <AppHeader
        title={pageTitle.toUpperCase()}
        homePath="/home"
        rightSlot={userMenu}
      />
      <div className="screen-center auth-screen">
        {children}
      </div>
    </div>
  );
}
