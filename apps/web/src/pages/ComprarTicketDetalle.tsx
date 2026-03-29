/**
 * Comprar Ticket – Paso 2: ticket completo (stub) y continuar compra.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { api, ensureImageUrl } from '../lib/api';

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
  row?: string | null;
  seat?: string | null;
  quantityEntries?: string | null;
  price: number;
  currency: string;
  ticketera?: string;
  appBoletos?: string;
  orderRef?: string | null;
  captureTicketUrl?: string | null;
  captureOwnershipUrl?: string | null;
  showFull?: boolean;
  seller?: Seller;
};

type LocationState = { listingId: string; password: string } | null;

export function ComprarTicketDetalle() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const [preview, setPreview] = useState<TicketPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [imageModal, setImageModal] = useState<'qr' | 'factura' | null>(null);

  useEffect(() => {
    if (!state?.listingId) {
      setLoading(false);
      return;
    }
    const q = state.password ? `?password=${encodeURIComponent(state.password)}` : '';
    setError('');
    setLoading(true);
    api<TicketPreview>(`/api/tickets/${encodeURIComponent(state.listingId)}${q}`)
      .then((res) => {
        setPreview(res);
        if (!res.showFull) setError('Necesitás la contraseña correcta para ver el ticket completo.');
      })
      .catch(() => setError('No se pudo cargar la publicación.'))
      .finally(() => setLoading(false));
  }, [state?.listingId, state?.password]);

  const handleContinue = async () => {
    if (!preview?.showFull) return;
    setError('');
    setPayLoading(true);
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
      setPayLoading(false);
    }
  };

  if (!state?.listingId) {
    return <Navigate to="/comprar-ticket" replace />;
  }

  if (loading) {
    return (
      <div className="page-content">
        <div className="loader" />
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="page-content">
        <h1 className="page-title">Comprar Ticket</h1>
        <p className="form-error">{error || 'Sin datos.'}</p>
        <button type="button" className="btn-secondary mt-2" onClick={() => navigate('/comprar-ticket')}>
          Volver
        </button>
      </div>
    );
  }

  const imgQr = preview.captureTicketUrl ? ensureImageUrl(preview.captureTicketUrl) : null;
  const imgFactura = preview.captureOwnershipUrl ? ensureImageUrl(preview.captureOwnershipUrl) : null;

  return (
    <div className="page-content comprar-ticket-page">
      <h1 className="page-title">Comprar Ticket</h1>
      {error && !preview.showFull && <p className="form-error">{error}</p>}

      <div className="glass ticket-stub-web">
        <div className="ticket-stub-notch ticket-stub-notch-left" aria-hidden />
        <p className="ticket-stub-id">TICKET ID N°: {preview.id}</p>
        <hr className="ticket-stub-perf" />
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
          {preview.showFull && (
            <>
              {preview.seat && (
                <>
                  <dt>Butaca-asiento</dt>
                  <dd>{preview.seat}</dd>
                </>
              )}
              {preview.row && (
                <>
                  <dt>Fila</dt>
                  <dd>{preview.row}</dd>
                </>
              )}
              <dt>Precio</dt>
              <dd>
                {preview.currency} {preview.price?.toLocaleString('es-AR')}
              </dd>
              {preview.ticketera && (
                <>
                  <dt>Ticketera</dt>
                  <dd>{preview.ticketera}</dd>
                </>
              )}
              {preview.appBoletos && (
                <>
                  <dt>App de boletos</dt>
                  <dd>{preview.appBoletos}</dd>
                </>
              )}
              {preview.orderRef && (
                <>
                  <dt>Código de orden</dt>
                  <dd>{preview.orderRef}</dd>
                </>
              )}
            </>
          )}
        </dl>
        <div className="ticket-stub-notch ticket-stub-notch-right" aria-hidden />
      </div>

      {preview.showFull && (imgQr || imgFactura) && (
        <div className="comprar-preview-actions">
          {imgQr && (
            <button type="button" className="btn-secondary" onClick={() => setImageModal('qr')}>
              👁 Vista previa QR
            </button>
          )}
          {imgFactura && (
            <button type="button" className="btn-secondary" onClick={() => setImageModal('factura')}>
              👁 Vista previa titularidad o factura
            </button>
          )}
        </div>
      )}

      {preview.showFull && (
        <>
          {error && <p className="form-error">{error}</p>}
          <button type="button" className="btn-primary" onClick={handleContinue} disabled={payLoading}>
            {payLoading ? 'Procesando…' : 'Continuar con la compra'}
          </button>
        </>
      )}

      {imageModal && (
        <dialog className="image-preview-dialog" open onClick={() => setImageModal(null)}>
          <div className="image-preview-inner" onClick={(e) => e.stopPropagation()}>
            {imageModal === 'qr' && imgQr && <img src={imgQr} alt="Ticket" className="image-preview-img" />}
            {imageModal === 'factura' && imgFactura && (
              <img src={imgFactura} alt="Titularidad" className="image-preview-img" />
            )}
            <button type="button" className="btn-primary mt-2" onClick={() => setImageModal(null)}>
              Cerrar
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
}
