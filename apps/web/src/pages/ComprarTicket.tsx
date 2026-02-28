/**
 * Comprar Ticket – Buscar por ID (compartido con el vendedor), previsualizar entradas, contraseña del vendedor (opcional), continuar compra.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Lock, MessageCircle } from 'lucide-react';
import { api } from '../lib/api';

type Preview = {
  id: string;
  eventName: string;
  eventDate: string;
  sector?: string | null;
  price: number;
  currency: string;
} | null;

export function ComprarTicket() {
  const [id, setId] = useState('');
  const [preview, setPreview] = useState<Preview>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async () => {
    const trimmed = id.trim();
    if (!trimmed) return;
    setError('');
    setLoading(true);
    setPreview(null);
    try {
      const res = await api<Preview>(`/api/tickets/${encodeURIComponent(trimmed)}`);
      setPreview(res);
    } catch {
      setError('No se encontró ninguna publicación con ese ID. Verificá el número con el vendedor.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinuePurchase = async () => {
    if (!preview) return;
    setError('');
    setLoading(true);
    try {
      const res = await api<{ order: { id: string }; checkoutUrl?: string }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          ticketListingId: preview.id,
          paymentMethod: 'mercadopago',
        }),
      });
      navigate(`/orden/${res.order.id}/pago`, { state: { checkoutUrl: res.checkoutUrl } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar la compra.');
    } finally {
      setLoading(false);
    }
  };

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
              placeholder="Ej: UUID o código"
              value={id}
              onChange={(e) => setId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
        <button type="button" className="btn-primary" onClick={handleSearch} disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      {preview && (
        <div className="glass comprar-ticket-preview">
          <h2 className="comprar-preview-title">Previsualización</h2>
          <dl className="comprar-preview-list">
            <dt>Evento</dt>
            <dd>{preview.eventName}</dd>
            <dt>Fecha</dt>
            <dd>{new Date(preview.eventDate).toLocaleDateString('es-AR')}</dd>
            {preview.sector && (
              <>
                <dt>Sector</dt>
                <dd>{preview.sector}</dd>
              </>
            )}
            <dt>Precio</dt>
            <dd>{preview.currency} {preview.price}</dd>
          </dl>

          <button
            type="button"
            className="btn-secondary btn-chat-toggle"
            onClick={() => setShowChat(!showChat)}
          >
            <MessageCircle size={18} />
            {showChat ? 'Ocultar chat' : 'Chat con el vendedor (opcional)'}
          </button>
          {showChat && (
            <div className="comprar-chat-placeholder">
              <p className="text-muted">Chat interno (próximamente)</p>
            </div>
          )}

          <div className="input-wrap comprar-password-wrap">
            <label>Contraseña del vendedor (opcional)</label>
            <div className="input-with-icon">
              <Lock size={20} className="input-icon" />
              <input
                type="password"
                className="input-field"
                placeholder="Si el vendedor te pasó una contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={handleContinuePurchase}
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Continuar con la compra'}
          </button>
        </div>
      )}
    </div>
  );
}
