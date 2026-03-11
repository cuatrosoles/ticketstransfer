/**
 * Publicar ticket (web) – Formulario completo + detección de QR (jsQR) para enviar regiones a pixelar (Fase 2).
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import { createTicketListing } from '../lib/api';
import type { PixelateRegion } from '@tickets-transfer/shared';
import { createTicketListingSchema } from '@tickets-transfer/shared';

const TIPOS_ENTRADA = ['GENERAL', 'CAMPO', 'PLATEA', 'VIP', 'OTRO'] as const;
const TICKETERAS = ['TICKETEK', 'ALLACCESS', 'TICKET_PLUS', 'OTRA'] as const;
const APPS_BOLETOS = ['QUENTRO', 'ENIGMA', 'OTRA'] as const;
const CATEGORIAS = ['MUSICA', 'DEPORTES', 'TEATRO', 'FESTIVALES', 'OTRO'] as const;

/** Detecta posición del QR en la imagen y devuelve región normalizada (0-1). Añade padding. */
function detectQRRegion(file: File): Promise<PixelateRegion | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const maxSize = 800;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > maxSize || h > maxSize) {
        const r = maxSize / Math.max(w, h);
        w = Math.round(w * r);
        h = Math.round(h * r);
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const code = jsQR(imageData.data, w, h, { inversionAttempts: 'dontInvert' });
      if (!code || !code.location) {
        resolve(null);
        return;
      }
      const { topLeftCorner, bottomRightCorner } = code.location;
      const padding = 0.12;
      const x = Math.max(0, (topLeftCorner.x / w) - padding * 0.5);
      const y = Math.max(0, (topLeftCorner.y / h) - padding * 0.5);
      const width = Math.min(1 - x, ((bottomRightCorner.x - topLeftCorner.x) / w) + padding);
      const height = Math.min(1 - y, ((bottomRightCorner.y - topLeftCorner.y) / h) + padding);
      resolve({ x, y, width, height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

export function Publicar() {
  const navigate = useNavigate();
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventPlace, setEventPlace] = useState('');
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
  const [captureTicketFile, setCaptureTicketFile] = useState<File | null>(null);
  const [captureOwnershipFile, setCaptureOwnershipFile] = useState<File | null>(null);
  const [pixelateRegions, setPixelateRegions] = useState<PixelateRegion[] | null>(null);
  const [detectingQR, setDetectingQR] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successListingId, setSuccessListingId] = useState<string | null>(null);

  const onCaptureTicketChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setCaptureTicketFile(file || null);
    setPixelateRegions(null);
    if (!file || !file.type.startsWith('image/')) return;
    setDetectingQR(true);
    try {
      const region = await detectQRRegion(file);
      if (region) setPixelateRegions([region]);
    } finally {
      setDetectingQR(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const priceNum = parseFloat(price.replace(',', '.').replace(/\s/g, ''));
    const body = {
      eventName: eventName.trim(),
      eventDate: eventDate.trim(),
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
    };
    const parsed = createTicketListingSchema.safeParse(body);
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      setError(first || 'Revisá los datos del formulario.');
      return;
    }
    if (!captureTicketFile) {
      setError('Subí la captura del ticket (imagen con QR).');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Precio debe ser un número positivo.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('eventName', parsed.data.eventName);
      formData.append('eventDate', parsed.data.eventDate);
      if (parsed.data.eventPlace) formData.append('eventPlace', parsed.data.eventPlace);
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
      if (tipoEntrada === 'OTRO' && tipoEntradaOtro.trim()) formData.append('tipoEntradaOtro', tipoEntradaOtro.trim());
      if (ticketera === 'OTRA' && ticketeraOtra.trim()) formData.append('ticketeraOtra', ticketeraOtra.trim());
      if (appBoletos === 'OTRA' && appBoletosOtra.trim()) formData.append('appBoletosOtra', appBoletosOtra.trim());
      formData.append('category', parsed.data.category ?? 'OTRO');
      if (publicationPassword.trim()) formData.append('publicationPassword', publicationPassword.trim());

      formData.append('captureTicket', captureTicketFile, captureTicketFile.name || 'ticket.jpg');
      if (captureOwnershipFile) {
        formData.append('captureOwnership', captureOwnershipFile, captureOwnershipFile.name || 'ownership.jpg');
      }
      if (pixelateRegions && pixelateRegions.length > 0) {
        formData.append('pixelateRegions', JSON.stringify(pixelateRegions));
      }

      const result = await createTicketListing(formData);
      const listingId = result?.id;
      if (listingId) {
        setSuccessListingId(listingId);
      } else {
        navigate('/home');
        window.alert('Tu ticket fue enviado a verificación.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo publicar.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      window.alert('Código copiado al portapapeles. Podés compartirlo por redes, email, etc.');
    }).catch(() => {
      window.prompt('Copiá el código del ticket:', id);
    });
  };

  if (successListingId) {
    return (
      <div className="page-content">
        <h1 className="page-title">Ticket enviado</h1>
        <div className="glass" style={{ padding: 24, borderRadius: 12, maxWidth: 560 }}>
          <p className="text-muted" style={{ marginBottom: 16 }}>Tu ticket fue enviado a verificación.</p>
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
          <button type="button" className="btn-secondary" onClick={() => navigate('/home')}>
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <h1 className="page-title">Publicar ticket</h1>
      <p className="text-muted">Completá los datos. La imagen del ticket se pixelará automáticamente en zonas sensibles (QR y datos personales).</p>

      <form onSubmit={handleSubmit} className="glass" style={{ padding: 24, borderRadius: 12, maxWidth: 560 }}>
        {error && <p style={{ color: 'var(--error)', marginBottom: 12 }}>{error}</p>}

        <label className="block-label">Nombre del evento *</label>
        <input className="input-field" value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="Ej. Recital X" required />

        <label className="block-label">Fecha * (AAAA-MM-DD)</label>
        <input className="input-field" type="text" value={eventDate} onChange={(e) => setEventDate(e.target.value)} placeholder="2025-03-15" required />

        <label className="block-label">Lugar</label>
        <input className="input-field" value={eventPlace} onChange={(e) => setEventPlace(e.target.value)} placeholder="Estadio / Teatro" />

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

        <label className="block-label">Captura del ticket (imagen con QR) *</label>
        <input type="file" accept="image/*" onChange={onCaptureTicketChange} style={{ marginBottom: 8 }} />
        {detectingQR && <p className="text-muted">Detectando QR…</p>}
        {captureTicketFile && pixelateRegions && pixelateRegions.length > 0 && (
          <p className="text-muted">Se detectó el QR: se pixelará solo esa zona.</p>
        )}
        {captureTicketFile && !pixelateRegions?.length && !detectingQR && (
          <p className="text-muted">No se detectó QR: se usarán zonas por defecto.</p>
        )}

        <label className="block-label">Captura de titularidad o factura (opcional)</label>
        <input type="file" accept="image/*" onChange={(e) => setCaptureOwnershipFile(e.target.files?.[0] || null)} style={{ marginBottom: 12 }} />

        <label className="block-label">Contraseña de la publicación</label>
        <input className="input-field" type="password" value={publicationPassword} onChange={(e) => setPublicationPassword(e.target.value)} placeholder="Para transferir el ticket" />

        <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: 16 }}>
          {submitting ? 'Enviando…' : 'Publicar'}
        </button>
      </form>
    </div>
  );
}
