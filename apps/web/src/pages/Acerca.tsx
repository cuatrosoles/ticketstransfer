/**
 * Acerca de – Texto completo ACERCA DE LA APP (como en Welcome).
 * Ubicación: apps/web/src/pages/Acerca.tsx
 */

const ACERCA_DE_LA_APP =
  'TICKETS TRANSFER ES UNA APP PARA LA REVENTA O INTERCAMBIO DE ENTRADAS-BOLETOS DIGITALES CON LA NUEVA METODOLOGÍA DE QR MEDIANTE APPS TERCIARIZADAS AL SER DESCARGADAS DE SUS TICKETERAS DE ORIGEN PARA SHOWS Y EVENTOS EN ARGENTINA DE FORMA SEGURA Y CONFIABLE, PARA EVITAR POSIBLES ESTAFAS O FRAUDES. FUNCIONAMOS COMO MEDIADORES ENTRE EL VENDEDOR Y COMPRADOR. ESPERAMOS QUE TU VENTA O INTERCAMBIO SEA EXITOSA. ¡GRACIAS POR CONFIAR EN TICKETS TRANSFER!';

export function Acerca() {
  return (
    <div className="page-content">
      <h1 className="page-title">Acerca de</h1>
      <section className="glass welcome-acerca">
        <h2 className="welcome-acerca-title">ACERCA DE LA APP:</h2>
        <p className="welcome-acerca-text">{ACERCA_DE_LA_APP}</p>
      </section>
    </div>
  );
}
