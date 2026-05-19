/**
 * Detalle de una publicación propia (vendedor).
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getMyListingDetail, ensureImageUrl, type MyListingDetail } from '../lib/api';

export function MiPublicacion() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<MyListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<'qr' | 'factura' | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    getMyListingDetail(id)
      .then(setListing)
      .catch(() => setError('No se pudo cargar la publicación.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="page-content">
        <div className="loader" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="page-content">
        <h1 className="page-title">Mi publicación</h1>
        <p className="form-error">{error || 'No encontrado.'}</p>
        <Link to="/mis-ventas" className="btn-secondary mt-2">
          Volver a mis ventas
        </Link>
      </div>
    );
  }

  const imgQr = listing.captureTicketUrl ? ensureImageUrl(listing.captureTicketUrl) : null;
  const imgEvent = listing.eventImageUrl ? ensureImageUrl(listing.eventImageUrl) : null;
  const imgFactura = listing.captureOwnershipUrl ? ensureImageUrl(listing.captureOwnershipUrl) : null;
  const imgQrOriginal = listing.captureTicketOriginalUrl ? ensureImageUrl(listing.captureTicketOriginalUrl) : null;
  const imgFacturaOriginal = listing.captureOwnershipOriginalUrl
    ? ensureImageUrl(listing.captureOwnershipOriginalUrl)
    : null;

  return (
    <div className="page-content">
      <h1 className="page-title">Mi publicación</h1>

      <div className="glass ticket-stub-web mb-2">
        {imgEvent ? (
          <div style={{ marginBottom: 16, borderRadius: 12, overflow: 'hidden', maxHeight: 200 }}>
            <img src={imgEvent} alt={`Portada ${listing.eventName}`} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
          </div>
        ) : null}
        <p className="ticket-stub-id">TICKET ID N°: {listing.id}</p>
        <hr className="ticket-stub-perf" />
        <dl className="comprar-preview-list">
          <dt>Evento</dt>
          <dd>{listing.eventName}</dd>
          <dt>Fecha</dt>
          <dd>{new Date(listing.eventDate).toLocaleDateString('es-AR')}</dd>
          <dt>Lugar</dt>
          <dd>{listing.eventPlace || '—'}</dd>
          {listing.sector && (
            <>
              <dt>Sector</dt>
              <dd>{listing.sector}</dd>
            </>
          )}
          <dt>Cantidad</dt>
          <dd>{listing.quantityEntries || '—'}</dd>
          {listing.seat && (
            <>
              <dt>Butaca-asiento</dt>
              <dd>{listing.seat}</dd>
            </>
          )}
          {listing.row && (
            <>
              <dt>Fila</dt>
              <dd>{listing.row}</dd>
            </>
          )}
          <dt>Precio</dt>
          <dd>
            {listing.currency} {Number(listing.price).toLocaleString('es-AR')}
          </dd>
          {listing.ticketera && (
            <>
              <dt>Ticketera</dt>
              <dd>{listing.ticketera}</dd>
            </>
          )}
          {listing.appBoletos && (
            <>
              <dt>App de boletos</dt>
              <dd>{listing.appBoletos}</dd>
            </>
          )}
          {listing.orderRef && (
            <>
              <dt>Código de orden</dt>
              <dd>{listing.orderRef}</dd>
            </>
          )}
        </dl>
      </div>

      <div className="comprar-preview-actions mb-2">
        {imgQr && (
          <button type="button" className="btn-secondary" onClick={() => setModal('qr')}>
            👁 Vista previa QR
          </button>
        )}
        {imgFactura && (
          <button type="button" className="btn-secondary" onClick={() => setModal('factura')}>
            👁 Vista previa titularidad o factura
          </button>
        )}
      </div>

      {(imgQrOriginal || imgFacturaOriginal) && (
        <div className="glass mb-2" style={{ padding: 16, borderRadius: 12 }}>
          <p className="text-muted" style={{ marginBottom: 10, fontSize: 14 }}>
            Archivo original (solo vos; no se comparte con compradores del marketplace).
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {imgQrOriginal && (
              <a className="btn-secondary" style={{ textDecoration: 'none' }} href={imgQrOriginal} target="_blank" rel="noopener noreferrer">
                Abrir original — ticket
              </a>
            )}
            {imgFacturaOriginal && (
              <a className="btn-secondary" style={{ textDecoration: 'none' }} href={imgFacturaOriginal} target="_blank" rel="noopener noreferrer">
                Abrir original — titularidad
              </a>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to={`/publicar?editar=${encodeURIComponent(listing.id)}`} className="btn-primary">
          Editar publicación
        </Link>
        <button type="button" className="btn-secondary" onClick={() => navigate('/mis-ventas')}>
          Volver
        </button>
      </div>

      {modal && (
        <dialog className="image-preview-dialog" open onClick={() => setModal(null)}>
          <div className="image-preview-inner" onClick={(e) => e.stopPropagation()}>
            {modal === 'qr' && imgQr && <img src={imgQr} alt="Ticket" className="image-preview-img" />}
            {modal === 'factura' && imgFactura && (
              <img src={imgFactura} alt="Titularidad" className="image-preview-img" />
            )}
            <button type="button" className="btn-primary mt-2" onClick={() => setModal(null)}>
              Cerrar
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
}
