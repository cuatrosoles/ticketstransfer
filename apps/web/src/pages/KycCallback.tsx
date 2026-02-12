/**
 * Callback de Didit tras completar verificación KYC.
 * Didit redirige aquí; mostramos mensaje y link a /kyc.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getKyc } from '../lib/api';

export function KycCallback() {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    getKyc()
      .then((r) => setStatus(r.status))
      .catch(() => setStatus('PENDIENTE'));
  }, []);

  return (
    <div className="page-content page-kyc">
      <div className="glass kyc-card">
        <h2 className="kyc-card-title">Verificación completada</h2>
        <p className="kyc-help">
            {status === 'APROBADO'
              ? '¡Tu identidad fue verificada correctamente!'
              : status === 'RECHAZADO'
                ? 'La verificación no fue aprobada. Podés intentar nuevamente.'
                : status === 'EN_REVISION'
                  ? 'Estamos revisando tu documentación. Te avisaremos pronto.'
                  : 'Tu verificación fue recibida. Te avisaremos cuando finalice la revisión.'}
        </p>
        <Link to="/kyc" className="btn-primary btn-glow mt-2" style={{ display: 'inline-block' }}>
          Ver estado
        </Link>
      </div>
    </div>
  );
}
