/**
 * Comprar Ticket – Paso 2: ticket completo (stub), datos de recepción y continuar compra.
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { api, ensureImageUrl, recordListingInteraction } from '../lib/api';
import { getEventImageCategoryFallback } from '@tickets-transfer/shared';

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
  eventImageUrl?: string | null;
  category?: string | null;
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
  availability?: {
    canPurchase: boolean;
    status: string;
    message?: string;
    reservedByCurrentUser?: boolean;
  };
};

type LocationState = { listingId: string; password: string } | null;

const BASE_INPUTS: Array<{
  key: 'deliveryUsername' | 'deliveryIdNumber' | 'deliveryEmail' | 'deliveryPhone';
  label: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
}> = [
  {
    key: 'deliveryUsername',
    label: 'Nombre de usuario',
    placeholder: 'Ej.: tu usuario en la app de boletos (Quentro, Enigma, etc.)',
    autoComplete: 'username',
  },
  {
    key: 'deliveryIdNumber',
    label: 'Número de ID',
    placeholder: 'Ej.: DNI, pasaporte o ID de cuenta en la ticketera',
  },
  {
    key: 'deliveryEmail',
    label: 'Email',
    placeholder: 'Correo donde recibirás la confirmación o la transferencia',
    type: 'email',
    autoComplete: 'email',
  },
  {
    key: 'deliveryPhone',
    label: 'Número de teléfono',
    placeholder: 'Incluí código de país, ej. +54 9 11 2345-6789',
    type: 'tel',
    autoComplete: 'tel',
  },
];

type DeliveryForm = {
  deliveryUsername: string;
  deliveryIdNumber: string;
  deliveryEmail: string;
  deliveryPhone: string;
  deliveryOther: string;
};

const emptyForm: DeliveryForm = {
  deliveryUsername: '',
  deliveryIdNumber: '',
  deliveryEmail: '',
  deliveryPhone: '',
  deliveryOther: '',
};

function hasAnyDeliveryData(form: DeliveryForm, showOtherField: boolean): boolean {
  const t = (s: string) => s.trim().length > 0;
  return (
    t(form.deliveryUsername) ||
    t(form.deliveryIdNumber) ||
    t(form.deliveryEmail) ||
    t(form.deliveryPhone) ||
    (showOtherField && t(form.deliveryOther))
  );
}

export function ComprarTicketDetalle() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const [preview, setPreview] = useState<TicketPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [imageModal, setImageModal] = useState<'qr' | 'factura' | null>(null);
  const [deliveryForm, setDeliveryForm] = useState<DeliveryForm>(emptyForm);
  const [showOtherField, setShowOtherField] = useState(false);

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
        void recordListingInteraction(state.listingId, 'VIEW', res.category).catch(() => {});
        if (!res.showFull) setError('Necesitás la contraseña correcta para ver el ticket completo.');
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo cargar la publicación.'))
      .finally(() => setLoading(false));
  }, [state?.listingId, state?.password]);

  const deliveryOk = useMemo(() => hasAnyDeliveryData(deliveryForm, showOtherField), [deliveryForm, showOtherField]);
  const canContinue = !payLoading && !!preview?.showFull && deliveryOk && !purchaseBlocked;

  const setField = (key: keyof DeliveryForm, value: string) => {
    setDeliveryForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleOtro = useCallback(() => {
    setShowOtherField((prev) => {
      if (prev) {
        setDeliveryForm((f) => ({ ...f, deliveryOther: '' }));
      }
      return !prev;
    });
  }, []);

  const purchaseBlocked = preview?.availability && !preview.availability.canPurchase;
  const pendingMessage = preview?.availability?.message;

  const handleContinue = async () => {
    if (!preview?.showFull) return;
    if (purchaseBlocked) {
      setError(pendingMessage || 'Este ticket está reservado por otro comprador. Volvé en unos minutos.');
      return;
    }
    void recordListingInteraction(preview.id, 'CLICK', preview.category).catch(() => {});
    if (!deliveryOk) {
      setError('Completá al menos uno de los datos o el campo «Otro» si lo activaste.');
      return;
    }
    setError('');
    setPayLoading(true);
    const trimOrUndef = (s: string) => {
      const t = s.trim();
      return t.length > 0 ? t : undefined;
    };
    try {
      const body: Record<string, unknown> = {
        ticketListingId: preview.id,
        paymentMethod: 'mercadopago',
        deliveryUsername: trimOrUndef(deliveryForm.deliveryUsername),
        deliveryIdNumber: trimOrUndef(deliveryForm.deliveryIdNumber),
        deliveryEmail: trimOrUndef(deliveryForm.deliveryEmail),
        deliveryPhone: trimOrUndef(deliveryForm.deliveryPhone),
      };
      if (showOtherField) {
        body.deliveryOther = trimOrUndef(deliveryForm.deliveryOther);
      }
      const res = await api<{ order: { id: string }; checkoutUrl?: string }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(body),
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
  const imgEvent =
    ensureImageUrl(preview.eventImageUrl) || getEventImageCategoryFallback(preview.category);

  return (
    <div className="page-content comprar-ticket-page">
      <h1 className="page-title">Comprar Ticket</h1>
      {error && !preview.showFull && <p className="form-error">{error}</p>}

      <div
        className="comprar-event-cover"
        style={{
          marginBottom: 16,
          borderRadius: 12,
          overflow: 'hidden',
          height: 200,
          border: '1px solid rgba(96, 165, 250, 0.25)',
        }}
      >
        <img
          src={imgEvent}
          alt={`Portada ${preview.eventName}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = getEventImageCategoryFallback(preview.category);
          }}
        />
      </div>

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
          <section className="comprar-delivery-section" aria-labelledby="comprar-delivery-heading">
            <h2 id="comprar-delivery-heading">Detalles de compra</h2>
            <p className="comprar-delivery-help">
              Corroborá tener instalada la app donde recibirás el ticket. Completá los datos que correspondan. Si necesitás indicar
              algo más (por ejemplo una dirección), tocá OTRO.
            </p>
            {BASE_INPUTS.map((field) => (
              <div className="input-wrap" key={field.key}>
                <label htmlFor={`delivery-${field.key}`}>{field.label}</label>
                <input
                  id={`delivery-${field.key}`}
                  className="input-field"
                  value={deliveryForm[field.key]}
                  onChange={(e) => setField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  type={field.type ?? 'text'}
                  autoComplete={field.autoComplete}
                />
              </div>
            ))}
            <button
              type="button"
              className={showOtherField ? 'comprar-otro-toggle comprar-otro-toggle--active' : 'comprar-otro-toggle'}
              onClick={toggleOtro}
            >
              OTRO
            </button>
            {showOtherField ? (
              <div className="input-wrap comprar-otro-field">
                <label htmlFor="delivery-other">Otro</label>
                <textarea
                  id="delivery-other"
                  className="input-field comprar-otro-textarea"
                  value={deliveryForm.deliveryOther}
                  onChange={(e) => setField('deliveryOther', e.target.value)}
                  placeholder="Ej.: dirección de entrega, indicaciones o cualquier dato adicional"
                  rows={3}
                />
              </div>
            ) : null}
          </section>

          {pendingMessage ? (
            <p className={purchaseBlocked ? 'form-error' : 'text-muted'} style={{ marginBottom: 12 }}>
              {pendingMessage}
            </p>
          ) : null}
          {error && <p className="form-error">{error}</p>}
          <button type="button" className="btn-primary" onClick={handleContinue} disabled={!canContinue}>
            {payLoading ? 'Procesando…' : purchaseBlocked ? 'Compra no disponible ahora' : 'Continuar con la compra'}
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
