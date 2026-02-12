/**
 * Verificación KYC – Didit SDK. Estado y botón para iniciar flujo con documento + liveness.
 * Usa Layout compartido (header con logo, título, back, menú usuario).
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { createKycSession, getKyc } from '../lib/api';

type KycStatus = 'PENDIENTE' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO';

export function Kyc() {
  const [status, setStatus] = useState<KycStatus>('PENDIENTE');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    getKyc()
      .then((r) => {
        setStatus((r.status as KycStatus) || 'PENDIENTE');
        setRejectionReason(r.rejectionReason || null);
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const statusLabel =
    status === 'EN_REVISION'
      ? 'En revisión'
      : status === 'APROBADO'
        ? 'Aprobado'
        : status === 'RECHAZADO'
          ? 'Rechazado'
          : 'Pendiente';
  const statusClass =
    status === 'APROBADO'
      ? 'kyc-status-ok'
      : status === 'RECHAZADO'
        ? 'kyc-status-fail'
        : 'kyc-status-pending';

  const handleStartVerification = async () => {
    setLoading(true);
    try {
      const { url } = await createKycSession('web');
      window.location.href = url;
    } catch {
      setLoading(false);
    }
  };

  const canStart = (status === 'PENDIENTE' || status === 'RECHAZADO') && !loading;

  return (
    <div className="page-content page-kyc">
      <div className="glass kyc-card">
        <h2 className="kyc-card-title">Estado de tu verificación</h2>
        <p className={`kyc-status ${statusClass}`}>
          <span className="kyc-status-dot" />
          {statusLabel}
        </p>
        <div className="kyc-legend">
          <span>Referencias de estado:</span>
          <span>
            <span className="kyc-status-dot kyc-dot-yellow" /> Pendiente
          </span>
          <span>
            <span className="kyc-status-dot kyc-dot-green" /> Aprobado
          </span>
          <span>
            <span className="kyc-status-dot kyc-dot-red" /> Rechazado
          </span>
        </div>
        {rejectionReason && <p className="perfil-kyc-reason">{rejectionReason}</p>}
      </div>

      {canStart && (
        <>
          <p className="kyc-help mb-2">
            Verificá tu identidad con fotos de tu documento y selfie. Usaremos la cámara para una
            prueba de vida (liveness).
          </p>
          <button
            type="button"
            className="btn-primary btn-glow"
            disabled={loading}
            onClick={handleStartVerification}
          >
            {loading ? (
              'Iniciando...'
            ) : (
              <>
                <ShieldCheck size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Iniciar verificación
              </>
            )}
          </button>
        </>
      )}

      <p className="kyc-help">
        Podés usar la app mientras verificamos. No podrás publicar ni comprar tickets hasta que el
        estado sea Aprobado.
      </p>
      <Link to="/home" className="back-link mt-2">
        Ir al inicio
      </Link>
    </div>
  );
}
