/**
 * Comprar Ticket – Paso 1: buscar ID, evento + vendedor, contraseña → detalle.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '../lib/api';

type Seller = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  reputationScore?: number | null;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  kyc?: { status: string } | null;
};

type TicketPreview = {
  id: string;
  eventName: string;
  eventDate: string;
  eventPlace?: string | null;
  sector?: string | null;
  quantityEntries?: string | null;
  seller?: Seller;
  showFull?: boolean;
};

export function ComprarTicket() {
  const [id, setId] = useState('');
  const [preview, setPreview] = useState<TicketPreview | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchTicket = async (pwd?: string) => {
    const trimmed = id.trim();
    if (!trimmed) return null;
    const q = pwd ? `?password=${encodeURIComponent(pwd)}` : '';
    return api<TicketPreview>(`/api/tickets/${encodeURIComponent(trimmed)}${q}`);
  };

  const handleSearch = async () => {
    const trimmed = id.trim();
    if (!trimmed) return;
    setError('');
    setLoading(true);
    setPreview(null);
    setPassword('');
    try {
      const res = await fetchTicket();
      setPreview(res);
    } catch {
      setError('No se encontró ninguna publicación con ese ID. Verificá el número con el vendedor.');
    } finally {
      setLoading(false);
    }
  };

  const goToDetail = (pwd: string) => {
    if (!preview) return;
    navigate('/comprar-ticket/detalle', { state: { listingId: preview.id, password: pwd } });
  };

  const handlePasswordSubmit = async () => {
    if (!preview || !password.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetchTicket(password.trim());
      if (!res || !res.showFull) {
        setError('Contraseña incorrecta.');
        return;
      }
      goToDetail(password.trim());
    } catch {
      setError('Contraseña incorrecta.');
    } finally {
      setLoading(false);
    }
  };

  const seller = preview?.seller;
  const sellerName = seller
    ? [seller.firstName, seller.lastName].filter(Boolean).join(' ') || seller.username || '—'
    : '—';
  const needsPassword = preview && !preview.showFull && preview.id;
  const salesCount = 0;

  return (
    <div className="page-content comprar-ticket-page">
      <h1 className="page-title">Comprar Ticket</h1>
      <p className="text-muted">Ingresá el ID que te pasó el vendedor para ver la publicación y continuar con la compra.</p>

      <div className="glass comprar-ticket-search">
        <div className="input-wrap">
          <label>ID de la publicación</label>
          <div className="input-with-icon">
            <Search size={20} className="input-icon" />
            <input
              type="text"
              className="input-field"
              placeholder="81y7eZv1bVC16kfBu7db"
              value={id}
              onChange={(e) => setId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
        <button type="button" className="btn-primary" onClick={handleSearch} disabled={loading}>
          {loading && !preview ? 'Buscando…' : 'Buscar'}
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      {preview && (
        <div className="glass comprar-ticket-preview">
          <h2 className="comprar-preview-title">Comprar Ticket</h2>
          <dl className="comprar-preview-list">
            <dt>Evento</dt>
            <dd>{preview.eventName}</dd>
            <dt>Fecha</dt>
            <dd>{new Date(preview.eventDate).toLocaleDateString('es-AR')}</dd>
            <dt>Lugar</dt>
            <dd>{preview.eventPlace || '—'}</dd>
            {preview.sector && (
              <>
                <dt>Sector</dt>
                <dd>{preview.sector}</dd>
              </>
            )}
            <dt>Cantidad de entradas</dt>
            <dd>{preview.quantityEntries || '—'}</dd>
          </dl>

          {seller && (
            <div className="comprar-seller-block">
              <p className="comprar-seller-title">VENDEDOR: {sellerName.toUpperCase()}</p>
              <ul className="comprar-seller-list text-muted">
                <li>Usuario: {seller.username || '—'}</li>
                <li>Reputación: {seller.reputationScore ?? 0} PTS</li>
                <li>Verificación KYC: {seller.kyc?.status === 'APROBADO' ? '✓ Verificado' : 'Sin verificar'}</li>
                <li>Verificación email: {seller.emailVerified ? '✓ Verificado' : 'Sin verificar'}</li>
                <li>Verificación teléfono: {seller.phoneVerified ? '✓ Verificado' : 'Sin verificar'}</li>
                <li>Ventas concretadas: {salesCount}</li>
              </ul>
            </div>
          )}

          {needsPassword ? (
            <>
              <div className="input-wrap">
                <label>Contraseña del ticket</label>
                <div className="input-password-row">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field"
                    placeholder="Ingresá la contraseña que te pasó el vendedor"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-secondary btn-eye"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <p className="form-hint">
                Ingresá aquí la contraseña que te adjuntó el vendedor para visualizar el ticket completo antes de
                efectuar la compra.
              </p>
              <button type="button" className="btn-primary" onClick={handlePasswordSubmit} disabled={loading}>
                {loading ? 'Procesando…' : 'Siguiente'}
              </button>
            </>
          ) : (
            <button type="button" className="btn-primary" onClick={() => goToDetail('')}>
              Siguiente
            </button>
          )}
        </div>
      )}
    </div>
  );
}
