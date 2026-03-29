/**
 * Agregar tarjeta (iframe formulario MP) – postMessage CARD_TOKEN al padre.
 */

import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { addUserCard } from '../lib/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function Tarjetas() {
  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      const d = e.data;
      if (!d || typeof d !== 'object') return;
      if (d.type === 'CARD_TOKEN' && typeof d.token === 'string') {
        addUserCard(d.token)
          .then(() => {
            window.alert('Tarjeta guardada.');
            if (returnTo) navigate(returnTo);
            else navigate('/home');
          })
          .catch((err) => window.alert(err instanceof Error ? err.message : 'Error al guardar'));
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [returnTo, navigate]);

  return (
    <div className="page-content">
      <h1 className="page-title">Tarjetas adheridas</h1>
      <p className="text-muted">
        Completá el formulario seguro de Mercado Pago. Los datos no se guardan en nuestros servidores.
      </p>
      <div className="tarjetas-iframe-wrap">
        <iframe title="Agregar tarjeta" src={`${API_BASE}/api/mercadopago/card-form`} />
      </div>
      <div className="mt-2" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {returnTo ? (
          <button type="button" className="btn-secondary" onClick={() => navigate(returnTo)}>
            Volver al pago
          </button>
        ) : null}
        <Link to="/home" className="btn-secondary">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
