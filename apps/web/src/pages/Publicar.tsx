/**
 * Publicar ticket (web) – Formulario completo. La API guarda la captura original y genera la versión pública redactada (QR + datos sensibles).
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createTicketListing, getMyListingDetail, updateMyListing, previewEventImage } from '../lib/api';
import { PublishProgressButton } from '../components/PublishProgressButton';
import { usePostPublishLoading } from '../context/PostPublishLoadingContext';
import {
  createTicketListingSchema,
  eventDateDateOnly,
  listingValueToDatetimeLocal,
  runWithPublishProgress,
} from '@tickets-transfer/shared';

const TIPOS_ENTRADA = ['GENERAL', 'CAMPO', 'PLATEA', 'VIP', 'OTRO'] as const;
const TICKETERAS = ['TICKETEK', 'ALLACCESS', 'TICKET_PLUS', 'OTRA'] as const;
const APPS_BOLETOS = ['QUENTRO', 'ENIGMA', 'OTRA'] as const;
const CATEGORIAS = ['MUSICA', 'DEPORTES', 'TEATRO', 'FESTIVALES', 'OTRO'] as const;

export function Publicar() {
  const navigate = useNavigate();
  const { startPostPublishLoading } = usePostPublishLoading();
  const submitLockedRef = useRef(false);
  const ticketFileInputRef = useRef<HTMLInputElement>(null);
  const ownershipFileInputRef = useRef<HTMLInputElement>(null);
  const [searchParams] = useSearchParams();
  const editListingId = searchParams.get('editar')?.trim() || '';
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventPlace, setEventPlace] = useState('');
  const [eventAddress, setEventAddress] = useState('');
  const [eventCity, setEventCity] = useState('');
  const [sector, setSector] = useState('');
  const [row, setRow] = useState('');
  const [seat, setSeat] = useState('');
  const [quantityEntries, setQuantityEntries] = useState('');
  const [tipoEntrada, setTipoEntrada] = useState<(typeof TIPOS_ENTRADA)[number]>('GENERAL');
  const [tipoEntradaOtro, setTipoEntradaOtro] = useState('');
  const [price, setPrice] = useState('');
  const [ticketera, setTicketera] = useState<(typeof TICKETERAS)[number]>('TICKETEK');
  const [ticketeraOtra, setTicketeraOtra] = useState('');
  const [appBoletos, setAppBoletos] = useState<(typeof APPS_BOLETOS)[number]>('QUENTRO');
  const [appBoletosOtra, setAppBoletosOtra] = useState('');
  const [orderRef, setOrderRef] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIAS)[number]>('OTRO');
  const [publicationPassword, setPublicationPassword] = useState('');
  const [showPubPassword, setShowPubPassword] = useState(false);
  const [listingVisibility, setListingVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PRIVATE');
  const [captureTicketFile, setCaptureTicketFile] = useState<File | null>(null);
  const [captureOwnershipFile, setCaptureOwnershipFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [publishStageLabel, setPublishStageLabel] = useState('');
  const [error, setError] = useState('');
  const [successListingId, setSuccessListingId] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [eventImagePreview, setEventImagePreview] = useState<string | null>(null);
  const [eventImagePreviewLoading, setEventImagePreviewLoading] = useState(false);
  const [eventImagePreviewSource, setEventImagePreviewSource] = useState<string | null>(null);

  useEffect(() => {
    const name = eventName.trim();
    const date = eventDateDateOnly(eventDate);
    const address = eventAddress.trim();
    const city = eventCity.trim();
    if (name.length < 2 || !date || address.length < 2 || city.length < 2) {
      setEventImagePreview(null);
      setEventImagePreviewSource(null);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setEventImagePreviewLoading(true);
      previewEventImage({
        eventName: name,
        eventDate: date,
        eventAddress: address,
        eventCity: city,
        eventPlace: eventPlace.trim() || undefined,
        category,
        ticketera,
      })
        .then((res) => {
          if (cancelled) return;
          setEventImagePreview(res.url);
          setEventImagePreviewSource(res.source);
        })
        .catch(() => {
          if (!cancelled) {
            setEventImagePreview(null);
            setEventImagePreviewSource(null);
          }
        })
        .finally(() => {
          if (!cancelled) setEventImagePreviewLoading(false);
        });
    }, 700);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [eventName, eventDate, eventPlace, eventAddress, eventCity, category, ticketera]);

  useEffect(() => {
    if (!editListingId) return;
    let cancelled = false;
    setEditLoading(true);
    getMyListingDetail(editListingId)
      .then((L) => {
        if (cancelled) return;
        setEventName(L.eventName || '');
        setEventDate(listingValueToDatetimeLocal(L.eventDate));
        setEventPlace(L.eventPlace || '');
        setEventAddress((L as { eventAddress?: string }).eventAddress || '');
        setEventCity((L as { eventCity?: string }).eventCity || '');
        setSector(L.sector || '');
        setRow((L.row as string) || '');
        setSeat((L.seat as string) || '');
        setQuantityEntries((L.quantityEntries as string) || '');
        setTipoEntrada((L.tipoEntrada as (typeof TIPOS_ENTRADA)[number]) || 'GENERAL');
        setTipoEntradaOtro((L.tipoEntradaOtro as string) || '');
        setPrice(String(L.price ?? ''));
        setTicketera((L.ticketera as (typeof TICKETERAS)[number]) || 'TICKETEK');
        setTicketeraOtra((L.ticketeraOtra as string) || '');
        setAppBoletos((L.appBoletos as (typeof APPS_BOLETOS)[number]) || 'QUENTRO');
        setAppBoletosOtra((L.appBoletosOtra as string) || '');
        setOrderRef(L.orderRef || '');
        setPublicationPassword((L.publicationPassword as string) || '');
        setListingVisibility((L as { visibility?: string }).visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE');
        const rawCat = (L as { category?: string }).category;
        setCategory(
          rawCat && CATEGORIAS.includes(rawCat as (typeof CATEGORIAS)[number])
            ? (rawCat as (typeof CATEGORIAS)[number])
            : 'OTRO'
        );
      })
      .catch(() => {
        window.alert('No se pudo cargar la publicación.');
        navigate('/mis-ventas');
      })
      .finally(() => {
        if (!cancelled) setEditLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editListingId, navigate]);

  const onCaptureTicketChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCaptureTicketFile(file || null);
  }, []);

  const clearPublishForm = useCallback(() => {
    setEventName('');
    setEventDate('');
    setEventPlace('');
    setEventAddress('');
    setEventCity('');
    setSector('');
    setRow('');
    setSeat('');
    setQuantityEntries('');
    setTipoEntrada('GENERAL');
    setTipoEntradaOtro('');
    setPrice('');
    setTicketera('TICKETEK');
    setTicketeraOtra('');
    setAppBoletos('QUENTRO');
    setAppBoletosOtra('');
    setOrderRef('');
    setCategory('OTRO');
    setPublicationPassword('');
    setShowPubPassword(false);
    setListingVisibility('PRIVATE');
    setCaptureTicketFile(null);
    setCaptureOwnershipFile(null);
    setEventImagePreview(null);
    setEventImagePreviewSource(null);
    if (ticketFileInputRef.current) ticketFileInputRef.current.value = '';
    if (ownershipFileInputRef.current) ownershipFileInputRef.current.value = '';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLockedRef.current || submitting) return;
    setError('');
    const priceNum = parseFloat(price.replace(',', '.').replace(/\s/g, ''));
    const body = {
      eventName: eventName.trim(),
      eventDate: eventDate.trim(),
      eventAddress: eventAddress.trim(),
      eventCity: eventCity.trim(),
      eventPlace: eventPlace.trim() || undefined,
      sector: sector.trim() || undefined,
      row: row.trim() || undefined,
      seat: seat.trim() || undefined,
      quantityEntries: quantityEntries.trim() || undefined,
      tipoEntrada,
      tipoEntradaOtro: tipoEntrada === 'OTRO' ? tipoEntradaOtro.trim() || undefined : undefined,
      price: priceNum,
      currency: 'ARS',
      ticketera,
      ticketeraOtra: ticketera === 'OTRA' ? ticketeraOtra.trim() || undefined : undefined,
      appBoletos,
      appBoletosOtra: appBoletos === 'OTRA' ? appBoletosOtra.trim() || undefined : undefined,
      orderRef: orderRef.trim() || undefined,
      category,
      visibility: listingVisibility,
    };
    const parsed = createTicketListingSchema.safeParse(body);
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      setError(first || 'Revisá los datos del formulario.');
      return;
    }
    if (!editListingId && !captureTicketFile) {
      setError('Subí la captura del ticket (imagen con QR).');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Precio debe ser un número positivo.');
      return;
    }
    if (listingVisibility === 'PRIVATE' && publicationPassword.trim().length < 4) {
      setError('Las publicaciones privadas requieren una contraseña de al menos 4 caracteres.');
      return;
    }

    submitLockedRef.current = true;
    setSubmitting(true);
    setPublishProgress(0);
    setPublishStageLabel('');
    try {
      if (editListingId) {
        await updateMyListing(editListingId, {
          eventName: parsed.data.eventName,
          eventDate: parsed.data.eventDate,
          eventPlace: parsed.data.eventPlace,
          eventAddress: parsed.data.eventAddress,
          eventCity: parsed.data.eventCity,
          sector: parsed.data.sector,
          row: parsed.data.row,
          seat: parsed.data.seat,
          quantityEntries: parsed.data.quantityEntries,
          tipoEntrada: parsed.data.tipoEntrada,
          tipoEntradaOtro: tipoEntrada === 'OTRO' ? tipoEntradaOtro.trim() || undefined : undefined,
          price: parsed.data.price,
          currency: parsed.data.currency,
          ticketera: parsed.data.ticketera,
          ticketeraOtra: ticketera === 'OTRA' ? ticketeraOtra.trim() || undefined : undefined,
          appBoletos: parsed.data.appBoletos,
          appBoletosOtra: appBoletos === 'OTRA' ? appBoletosOtra.trim() || undefined : undefined,
          orderRef: parsed.data.orderRef,
          category: parsed.data.category,
          visibility: listingVisibility,
          publicationPassword:
            listingVisibility === 'PUBLIC' ? null : publicationPassword.trim() || null,
        });
        window.alert('Tu publicación se actualizó.');
        navigate(`/mis-ventas/publicacion/${editListingId}`);
        return;
      }

      const ticketFile = captureTicketFile;
      if (!ticketFile) {
        setError('Subí la captura del ticket (imagen con QR).');
        return;
      }

      const ownershipFile = captureOwnershipFile;
      const visibility = listingVisibility;
      const pubPassword = publicationPassword.trim();
      const extraTipo = tipoEntradaOtro.trim();
      const extraTicketera = ticketeraOtra.trim();
      const extraApp = appBoletosOtra.trim();

      clearPublishForm();

      const formData = new FormData();
      formData.append('eventName', parsed.data.eventName);
      formData.append('eventDate', parsed.data.eventDate);
      if (parsed.data.eventPlace) formData.append('eventPlace', parsed.data.eventPlace);
      formData.append('eventAddress', parsed.data.eventAddress);
      formData.append('eventCity', parsed.data.eventCity);
      if (parsed.data.sector) formData.append('sector', parsed.data.sector);
      if (parsed.data.row) formData.append('row', parsed.data.row);
      if (parsed.data.seat) formData.append('seat', parsed.data.seat);
      if (parsed.data.quantityEntries) formData.append('quantityEntries', String(parsed.data.quantityEntries));
      formData.append('tipoEntrada', parsed.data.tipoEntrada);
      formData.append('price', String(parsed.data.price));
      formData.append('currency', parsed.data.currency);
      formData.append('ticketera', parsed.data.ticketera);
      formData.append('appBoletos', parsed.data.appBoletos);
      if (parsed.data.orderRef) formData.append('orderRef', parsed.data.orderRef);
      if (parsed.data.tipoEntrada === 'OTRO' && extraTipo) formData.append('tipoEntradaOtro', extraTipo);
      if (parsed.data.ticketera === 'OTRA' && extraTicketera) formData.append('ticketeraOtra', extraTicketera);
      if (parsed.data.appBoletos === 'OTRA' && extraApp) formData.append('appBoletosOtra', extraApp);
      formData.append('category', parsed.data.category ?? 'OTRO');
      formData.append('visibility', visibility);
      if (visibility === 'PRIVATE' && pubPassword) {
        formData.append('publicationPassword', pubPassword);
      }

      formData.append('captureTicket', ticketFile, ticketFile.name || 'ticket.jpg');
      if (ownershipFile) {
        formData.append('captureOwnership', ownershipFile, ownershipFile.name || 'ownership.jpg');
      }

      const result = await runWithPublishProgress(
        () => createTicketListing(formData),
        ({ progress, label }) => {
          setPublishProgress(progress);
          setPublishStageLabel(label);
        }
      );
      const listingId = result?.id;
      if (listingId) {
        setSuccessListingId(listingId);
      } else {
        startPostPublishLoading();
        navigate('/home');
        window.alert('Tu ticket fue publicado y ya está disponible.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo publicar.');
    } finally {
      submitLockedRef.current = false;
      setSubmitting(false);
      setPublishProgress(0);
      setPublishStageLabel('');
    }
  };

  const goHomeAfterPublish = () => {
    startPostPublishLoading();
    navigate('/home');
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      window.alert('Código copiado al portapapeles. Podés compartirlo por redes, email, etc.');
    }).catch(() => {
      window.prompt('Copiá el código del ticket:', id);
    });
  };

  if (editLoading) {
    return (
      <div className="page-content">
        <h1 className="page-title">Cargando…</h1>
        <div className="loader" />
      </div>
    );
  }

  if (successListingId) {
    return (
      <div className="page-content">
      <h1 className="page-title">Ticket publicado</h1>
        <div className="glass" style={{ padding: 24, borderRadius: 12, maxWidth: 560 }}>
          <p className="text-muted" style={{ marginBottom: 16 }}>Tu ticket fue publicado y ya está disponible.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Código:</span>
            <code style={{ fontSize: 14, padding: '6px 10px', background: 'rgba(0,0,0,0.2)', borderRadius: 8 }}>{successListingId}</code>
            <button
              type="button"
              className="btn-primary"
              onClick={() => handleCopyId(successListingId)}
            >
              Copiar al portapapeles
            </button>
          </div>
          <button type="button" className="btn-primary" onClick={goHomeAfterPublish}>
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <h1 className="page-title">{editListingId ? 'Editar publicación' : 'Publicar ticket'}</h1>
      <p className="text-muted">
        Completá los datos. Al publicar, el servidor guarda la imagen original para tu registro y genera automáticamente
        la versión pública: detecta códigos QR y datos sensibles (teléfono, CUIT/CUIL, domicilio, etc.) y los deja
        ilegibles. La primera publicación puede tardar unos segundos más por el procesamiento.
      </p>

      <form onSubmit={handleSubmit} className="glass" style={{ padding: 24, borderRadius: 12, maxWidth: 560 }}>
        {error && <p style={{ color: 'var(--error)', marginBottom: 12 }}>{error}</p>}

        <label className="block-label">Nombre del evento *</label>
        <input className="input-field" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Ej. Recital X" required />

        <label className="block-label">Fecha y hora del evento *</label>
        <input
          className="input-field datetime-field"
          type="datetime-local"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          required
        />

        <label className="block-label">Lugar (nombre del recinto) *</label>
        <input className="input-field" value={eventPlace} onChange={(e) => setEventPlace(e.target.value)} placeholder="Ej. Auditorio de Belgrano" required />
        <p className="text-muted" style={{ fontSize: 12, marginTop: -6, marginBottom: 12 }}>
          Tal como figura en Ticketek (con o sin &quot;de&quot;: ej. Auditorio Belgrano → auditorio-de-belgrano).
        </p>

        <div className="form-row-inline">
          <div>
            <label className="block-label">Dirección *</label>
            <input
              className="input-field"
              value={eventAddress}
              onChange={(e) => setEventAddress(e.target.value)}
              placeholder="Calle y número"
              required
            />
          </div>
          <div>
            <label className="block-label">Ciudad *</label>
            <input
              className="input-field"
              value={eventCity}
              onChange={(e) => setEventCity(e.target.value)}
              placeholder="Ej. CABA"
              required
            />
          </div>
        </div>

        {(eventImagePreview || eventImagePreviewLoading) && (
          <div style={{ marginBottom: 16 }}>
            <label className="block-label">Imagen del evento (vista previa)</label>
            <p className="text-muted" style={{ fontSize: 13, marginBottom: 8 }}>
              Buscamos la portada en la ticketera elegida (nombre, dirección, ciudad y fecha). Si no hay coincidencia exacta, usamos imagen por categoría.
            </p>
            <div
              style={{
                position: 'relative',
                borderRadius: 12,
                overflow: 'hidden',
                height: 160,
                background: 'rgba(15,23,42,0.5)',
                border: '1px solid rgba(96,165,250,0.25)',
              }}
            >
              {eventImagePreviewLoading ? (
                <div className="screen-center" style={{ height: '100%' }}>
                  <div className="loader" />
                </div>
              ) : eventImagePreview ? (
                <img
                  src={eventImagePreview}
                  alt="Vista previa del evento"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : null}
            </div>
            {eventImagePreviewSource ? (
              <p className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>
                Origen: {eventImagePreviewSource === 'official' ? 'fuente oficial' : eventImagePreviewSource === 'wikimedia' ? 'Wikimedia' : eventImagePreviewSource === 'generated' ? 'generada por IA' : 'imagen por defecto'}
              </p>
            ) : null}
          </div>
        )}

        <label className="block-label">Sector</label>
        <input className="input-field" value={sector} onChange={(e) => setSector(e.target.value)} placeholder="Platea, Campo..." />

        <label className="block-label">Fila / Butacas</label>
        <input className="input-field" value={row} onChange={(e) => setRow(e.target.value)} placeholder="Fila" />
        <input className="input-field" value={seat} onChange={(e) => setSeat(e.target.value)} placeholder="Asientos (ej: 1, 2, 3)" />

        <label className="block-label">Tipo de entrada</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {TIPOS_ENTRADA.map((t) => (
            <button key={t} type="button" className={tipoEntrada === t ? 'chip active' : 'chip'} onClick={() => setTipoEntrada(t)}>
              {t}
            </button>
          ))}
        </div>
        {tipoEntrada === 'OTRO' && (
          <input className="input-field" value={tipoEntradaOtro} onChange={(e) => setTipoEntradaOtro(e.target.value)} placeholder="Especificar tipo" />
        )}

        <label className="block-label">Cantidad de entradas</label>
        <input className="input-field" value={quantityEntries} onChange={(e) => setQuantityEntries(e.target.value)} placeholder="Ej: 2" />

        <label className="block-label">Precio (ARS) *</label>
        <input className="input-field" type="text" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="15000" required />

        <label className="block-label">Ticketera</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {TICKETERAS.map((t) => (
            <button key={t} type="button" className={ticketera === t ? 'chip active' : 'chip'} onClick={() => setTicketera(t)}>
              {t}
            </button>
          ))}
        </div>
        {ticketera === 'OTRA' && (
          <input className="input-field" value={ticketeraOtra} onChange={(e) => setTicketeraOtra(e.target.value)} placeholder="Nombre ticketera" />
        )}

        <label className="block-label">App de boletos</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {APPS_BOLETOS.map((a) => (
            <button key={a} type="button" className={appBoletos === a ? 'chip active' : 'chip'} onClick={() => setAppBoletos(a)}>
              {a}
            </button>
          ))}
        </div>
        {appBoletos === 'OTRA' && (
          <input className="input-field" value={appBoletosOtra} onChange={(e) => setAppBoletosOtra(e.target.value)} placeholder="Nombre app" />
        )}

        <label className="block-label">Código de orden / referencia</label>
        <input className="input-field" value={orderRef} onChange={(e) => setOrderRef(e.target.value)} placeholder="Opcional" />

        <label className="block-label">Categoría</label>
        <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value as (typeof CATEGORIAS)[number])}>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <label className="block-label">Captura del ticket *</label>
        <p className="text-muted" style={{ marginBottom: 8, fontSize: 13 }}>
          Podés subir la captura tal cual la tenés en el celular; no hace falta pixelarla a mano.
        </p>
        <input ref={ticketFileInputRef} type="file" accept="image/*" onChange={onCaptureTicketChange} style={{ marginBottom: 8 }} />

        <label className="block-label">Captura de titularidad o factura (opcional)</label>
        <p className="text-muted" style={{ marginBottom: 8, fontSize: 13 }}>
          Mismo tratamiento automático que la captura del ticket.
        </p>
        <input
          ref={ownershipFileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => setCaptureOwnershipFile(e.target.files?.[0] || null)}
          style={{ marginBottom: 12 }}
        />

        <label className="block-label">Visibilidad</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          <button
            type="button"
            className={listingVisibility === 'PUBLIC' ? 'chip active' : 'chip'}
            onClick={() => {
              setListingVisibility('PUBLIC');
              setPublicationPassword('');
            }}
          >
            Público (marketplace / inicio app)
          </button>
          <button type="button" className={listingVisibility === 'PRIVATE' ? 'chip active' : 'chip'} onClick={() => setListingVisibility('PRIVATE')}>
            Privado (ID + contraseña)
          </button>
        </div>
        <p className="text-muted" style={{ marginBottom: 12, fontSize: 13 }}>
          {listingVisibility === 'PUBLIC'
            ? 'Aparece en “Tickets a la Venta” del inicio. Sin contraseña.'
            : 'Solo quien tenga el ID y la contraseña que compartas podrá ver el ticket completo.'}
        </p>

        {listingVisibility === 'PRIVATE' && (
          <>
            <label className="block-label">Contraseña de la publicación</label>
            <div className="input-password-row">
              <input
                className="input-field"
                type={showPubPassword ? 'text' : 'password'}
                value={publicationPassword}
                onChange={(e) => setPublicationPassword(e.target.value)}
                placeholder="Mínimo 4 caracteres"
              />
              <button
                type="button"
                className="btn-secondary btn-eye"
                onClick={() => setShowPubPassword((v) => !v)}
                aria-label={showPubPassword ? 'Ocultar' : 'Mostrar'}
              >
                {showPubPassword ? '🙈' : '👁'}
              </button>
            </div>
          </>
        )}

        {editListingId ? (
          <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: 16 }}>
            {submitting ? 'Guardando…' : 'Guardar cambios'}
          </button>
        ) : (
          <div style={{ marginTop: 16 }}>
            <PublishProgressButton
              label="Publicar"
              loading={submitting}
              progress={publishProgress}
              progressLabel={publishStageLabel}
              disabled={submitting}
            />
          </div>
        )}
      </form>
    </div>
  );
}
