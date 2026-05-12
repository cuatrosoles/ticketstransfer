/**
 * Soporte – canales configurados en admin (email, centro de ayuda, texto legal opcional).
 */

import { useBranding } from '../context/BrandingContext';

function normalizeExternalUrl(url: string): string {
  const t = url.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

export function Soporte() {
  const { supportEmail, helpCenterUrl, registrationDisclaimer, appName } = useBranding();

  return (
    <div className="page-content">
      <h1 className="page-title">Chat Soporte</h1>
      <p className="text-muted" style={{ marginBottom: '1.25rem', maxWidth: 560 }}>
        En la app móvil tenés el asistente con respuestas automáticas. Acá podés contactar al equipo de{' '}
        <strong>{appName}</strong> por los canales que configure el administrador.
      </p>

      <section className="glass" style={{ padding: '1.5rem', marginBottom: '1.25rem', maxWidth: 560 }}>
        <h2 className="welcome-acerca-title" style={{ marginTop: 0 }}>
          Contacto directo
        </h2>
        {!supportEmail && !helpCenterUrl ? (
          <p className="text-muted">
            Todavía no hay email ni enlace de ayuda configurados. Pedile al administrador que los cargue en{' '}
            <strong>Admin → Configuración → Ajustes de usuarios</strong>.
          </p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {supportEmail ? (
              <a className="btn btn-primary" href={`mailto:${supportEmail}`}>
                Escribir a {supportEmail}
              </a>
            ) : null}
            {helpCenterUrl ? (
              <a
                className="btn btn-primary"
                href={normalizeExternalUrl(helpCenterUrl)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Centro de ayuda / FAQ
              </a>
            ) : null}
          </div>
        )}
      </section>

      {registrationDisclaimer ? (
        <section className="glass" style={{ padding: '1.5rem', maxWidth: 720 }}>
          <h2 className="welcome-acerca-title" style={{ marginTop: 0 }}>
            Información para usuarios
          </h2>
          <pre
            className="text-muted"
            style={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            {registrationDisclaimer}
          </pre>
        </section>
      ) : null}
    </div>
  );
}
