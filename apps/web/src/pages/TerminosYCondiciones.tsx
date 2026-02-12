/**
 * Términos y condiciones de uso – Contenido mockup.
 * Ubicación: apps/web/src/pages/TerminosYCondiciones.tsx
 */

export function TerminosYCondiciones() {
  return (
    <div className="page-content">
      <h1 className="page-title">Términos y condiciones de uso</h1>
      <section className="glass welcome-acerca">
        <h2 className="welcome-acerca-title">ACEPTACIÓN</h2>
        <p className="welcome-acerca-text">
          Al registrarte y usar Tickets Transfer aceptás estos términos. La plataforma permite la reventa e intercambio de entradas digitales para eventos en Argentina, actuando como mediador entre vendedor y comprador. El usuario debe ser mayor de edad y proporcionar información veraz.
        </p>
        <h2 className="welcome-acerca-title">OBLIGACIONES</h2>
        <p className="welcome-acerca-text">
          Está prohibido usar la app para fines fraudulentos, vender entradas que no poseas o falsear datos. Las transacciones se rigen por nuestras reglas de escrow y transferencia. Nos reservamos el derecho de suspender o dar de baja cuentas que incumplan estos términos. Para solicitar la baja de cuenta utilizá la opción correspondiente en el menú de usuario.
        </p>
        <h2 className="welcome-acerca-title">MODIFICACIONES</h2>
        <p className="welcome-acerca-text">
          Podemos actualizar estos términos; el uso continuado de la app implica la aceptación de los cambios. Ante dudas, contactanos por los canales indicados en la app.
        </p>
        <p className="welcome-acerca-text text-muted" style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
          Última actualización: enero 2025. Contenido de ejemplo.
        </p>
      </section>
    </div>
  );
}
