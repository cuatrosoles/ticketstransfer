/**
 * Solicitar baja de cuenta – Contenido mockup y formulario de solicitud.
 * Ubicación: apps/web/src/pages/SolicitarBaja.tsx
 */

export function SolicitarBaja() {
  return (
    <div className="page-content">
      <h1 className="page-title">Solicitar baja de cuenta</h1>
      <section className="glass welcome-acerca">
        <h2 className="welcome-acerca-title">BAJA DE CUENTA</h2>
        <p className="welcome-acerca-text">
          Si deseas dar de baja tu cuenta en Tickets Transfer, tené en cuenta que se eliminarán tus datos personales y el historial de operaciones asociado, según lo establecido en nuestra Política de privacidad. Las operaciones en curso deberán estar finalizadas o canceladas antes de solicitar la baja.
        </p>
        <p className="welcome-acerca-text">
          Para solicitar la baja podés enviar un correo a baja@ticketstransfer.com indicando tu email registrado y el motivo (opcional). También podés usar el botón siguiente para registrar la solicitud desde la app. Nos pondremos en contacto para confirmar el proceso.
        </p>
        <p className="welcome-acerca-text text-muted" style={{ marginTop: '1rem' }}>
          Esta es una pantalla de ejemplo. La funcionalidad de baja estará disponible próximamente.
        </p>
        <button type="button" className="btn-primary mt-2" disabled style={{ opacity: 0.7 }}>
          Solicitar baja (próximamente)
        </button>
      </section>
    </div>
  );
}
