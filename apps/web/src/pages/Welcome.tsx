/**
 * Pantalla de bienvenida – ACERCA DE LA APP, VENTA/INTERCAMBIO, ticketeras, apps (según imagen).
 * Ubicación: apps/web/src/pages/Welcome.tsx
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppHeader } from '../components/AppHeader';
import { TICKETERAS, APPS_BOLETOS, ACCION_FLUJO } from '@tickets-transfer/shared';

const ACERCA_DE =
  'TICKETS TRANSFER ES UNA APP PARA LA REVENTA O INTERCAMBIO DE ENTRADAS-BOLETOS DIGITALES CON LA NUEVA METODOLOGÍA DE QR MEDIANTE APPS TERCIARIZADAS AL SER DESCARGADAS DE SUS TICKETERAS DE ORIGEN PARA SHOWS Y EVENTOS EN ARGENTINA DE FORMA SEGURA Y CONFIABLE, PARA EVITAR POSIBLES ESTAFAS O FRAUDES. FUNCIONAMOS COMO MEDIADORES ENTRE EL VENDEDOR Y COMPRADOR. ESPERAMOS QUE TU VENTA O INTERCAMBIO SEA EXITOSA. ¡GRACIAS POR CONFIAR EN TICKETS TRANSFER!';

export function Welcome() {
  const [accion, setAccion] = useState<string[]>([]);
  const [ticketeras, setTicketeras] = useState<string[]>([]);
  const [appsBoletos, setAppsBoletos] = useState<string[]>([]);

  const toggle = (arr: string[], val: string, set: (a: string[]) => void) => {
    if (arr.includes(val)) set(arr.filter((x) => x !== val));
    else set([...arr, val]);
  };

  return (
    <div className="bg-pattern">
      <AppHeader />
      <div className="screen-center welcome-screen" style={{ maxWidth: 480 }}>
        <section className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem', width: '100%' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--white)' }}>
            ACERCA DE LA APP:
          </h2>
          <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
            {ACERCA_DE}
          </p>
        </section>

        <p className="label-section">A continuación indicanos qué acción querés realizar:</p>
        <div className="option-grid" style={{ width: '100%' }}>
          {ACCION_FLUJO.map((a) => (
            <button
              key={a}
              type="button"
              className={`option-chip ${accion.includes(a) ? 'selected' : ''}`}
              onClick={() => toggle(accion, a, setAccion)}
            >
              {a}
            </button>
          ))}
        </div>

        <p className="label-section">Indicanos en qué ticketera realizaste la compra de la entrada:</p>
        <div className="option-grid" style={{ width: '100%' }}>
          {TICKETERAS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`option-chip ${ticketeras.includes(t.id) ? 'selected' : ''}`}
              onClick={() => toggle(ticketeras, t.id, setTicketeras)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <p className="label-section">En qué app de boletos digitales se acreditaron tus entradas:</p>
        <div className="option-grid" style={{ width: '100%' }}>
          {APPS_BOLETOS.map((a) => (
            <button
              key={a.id}
              type="button"
              className={`option-chip ${appsBoletos.includes(a.id) ? 'selected' : ''}`}
              onClick={() => toggle(appsBoletos, a.id, setAppsBoletos)}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="welcome-buttons" style={{ marginTop: '1.5rem' }}>
          <Link to="/login" className="btn-primary btn-glow">
            Iniciar sesión
          </Link>
          <Link to="/register" className="btn-secondary">
            Registrarme
          </Link>
        </div>
      </div>
    </div>
  );
}
