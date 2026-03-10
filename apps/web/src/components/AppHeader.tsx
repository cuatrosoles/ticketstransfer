/**
 * Cabecera – Logo Tickets Transfer (imagen PNG a ancho completo).
 */

import { Link } from 'react-router-dom';
import logoImg from '../assets/images/LogoTT-v01.png';

type Props = {
  title?: string;
  homePath?: string;
  rightSlot?: React.ReactNode;
};

export function AppHeader({ title, homePath = '/', rightSlot }: Props) {
  return (
    <header className="app-header">
      <div className="app-header-content">
        <Link to={homePath} className="app-header-logo">
          <img src={logoImg} alt="Tickets Transfer" className="app-header-logo-img" />
        </Link>
        {rightSlot != null && <div className="app-header-right">{rightSlot}</div>}
      </div>
      {title && <h1 className="app-header-title">{title}</h1>}
    </header>
  );
}
