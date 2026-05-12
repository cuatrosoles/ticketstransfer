/**
 * Cabecera – Logo local o remoto (marca desde admin).
 */

import { Link } from 'react-router-dom';
import logoImg from '../assets/images/LogoTT-v01.png';
import { useBranding } from '../context/BrandingContext';

type Props = {
  title?: string;
  homePath?: string;
  rightSlot?: React.ReactNode;
};

export function AppHeader({ title, homePath = '/', rightSlot }: Props) {
  const { appName, logoUrl } = useBranding();
  const logoSrc = logoUrl || logoImg;
  return (
    <header className="app-header">
      <div className="app-header-content">
        <Link to={homePath} className="app-header-logo">
          <img src={logoSrc} alt={appName} className="app-header-logo-img" />
        </Link>
        {rightSlot != null && <div className="app-header-right">{rightSlot}</div>}
      </div>
      {title && <h1 className="app-header-title">{title}</h1>}
    </header>
  );
}
