/**
 * KYC – Verificaciones pendientes con integración Didit.
 * Cada tarjeta es clicable y lleva a la pantalla de detalle KycDetail.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { downloadCsv } from '../utils/exportCsv';
import { ExternalLink, ChevronRight } from 'lucide-react';

type DiditIdVerification = {
  front_image?: string;
  back_image?: string;
  portrait_image?: string;
  document_type?: string;
  document_number?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
};

type DiditSession = {
  session_id: string;
  status?: string;
  session_url?: string;
  id_verifications?: DiditIdVerification[];
  liveness_verifications?: Array<{ selfie_image?: string }>;
};

type KycItem = {
  id: string;
  status: string;
  diditSessionId?: string | null;
  dniFrontUrl?: string | null;
  dniBackUrl?: string | null;
  selfieUrl?: string | null;
  user: { id: string; email: string; firstName: string | null; lastName: string | null };
  diditSession?: DiditSession | null;
};

export function Kyc() {
  const navigate = useNavigate();
  const [list, setList] = useState<KycItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ user: KycItem; reason: string; sendEmail: boolean } | null>(null);
  const [resubmitModal, setResubmitModal] = useState<KycItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    api<KycItem[]>('/api/admin/kyc/pending')
      .then((data) => {
        setList(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        setList([]);
        setError(e instanceof Error ? e.message : 'Error al cargar las verificaciones');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const resolve = async (
    userId: string,
    status: 'APROBADO' | 'RECHAZADO' | 'RESUBMIT',
    options?: { rejectionReason?: string; comment?: string; sendEmail?: boolean }
  ) => {
    setActionLoading(true);
    try {
      await api(`/api/admin/kyc/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          rejectionReason: options?.rejectionReason,
          comment: options?.comment,
          sendEmail: options?.sendEmail,
        }),
      });
      setRejectModal(null);
      setResubmitModal(null);
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = () => {
    const rows = list.map((k) => [
      k.user.email,
      k.user.firstName ?? '',
      k.user.lastName ?? '',
      k.status,
      k.diditSessionId ? 'Didit' : 'Legacy',
    ]);
    downloadCsv(`kyc-pendientes-${new Date().toISOString().slice(0, 10)}.csv`, ['Email', 'Nombre', 'Apellido', 'Estado', 'Origen'], rows);
  };

  const getImages = (k: KycItem) => {
    const hasDidit = k.diditSession?.id_verifications?.[0];
    if (hasDidit) {
      return {
        front: hasDidit.front_image,
        back: hasDidit.back_image,
        selfie: hasDidit.portrait_image || k.diditSession?.liveness_verifications?.[0]?.selfie_image,
      };
    }
    return { front: k.dniFrontUrl, back: k.dniBackUrl, selfie: k.selfieUrl };
  };

  if (loading) return <p>Cargando…</p>;

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-title">KYC pendientes de revisión</h1>
        {list.length > 0 && (
          <button type="button" className="btn btn-primary btn-sm" onClick={handleExport}>
            Exportar CSV
          </button>
        )}
      </div>
      {error ? (
        <div className="card" style={{ borderColor: 'var(--danger)', background: 'rgba(220, 53, 69, 0.08)' }}>
          <p style={{ margin: 0, color: 'var(--danger)' }}>{error}</p>
          <p style={{ margin: '8px 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Verificá que la API esté desplegada y que VITE_API_URL apunte a la URL correcta.
          </p>
          <button type="button" className="btn btn-primary btn-sm" onClick={load} style={{ marginTop: 12 }}>
            Reintentar
          </button>
        </div>
      ) : list.length === 0 ? (
        <div className="card">No hay verificaciones pendientes.</div>
      ) : (
        list.map((k) => {
          const images = getImages(k);
          const hasDidit = !!k.diditSessionId;

          return (
            <div
              key={k.id}
              className="card"
              style={{ cursor: 'pointer', transition: 'background 0.15s' }}
              onClick={() => navigate(`/kyc/${k.user.id}`)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/kyc/${k.user.id}`)}
              role="button"
              tabIndex={0}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <strong>{k.user?.email}</strong>
                  <span style={{ marginLeft: 8, color: 'var(--text-muted)' }}>
                    {[k.user?.firstName, k.user?.lastName].filter(Boolean).join(' ')}
                  </span>
                  {hasDidit && (
                    <span className="badge badge-open" style={{ marginLeft: 8 }}>
                      Didit
                    </span>
                  )}
                  <div style={{ marginTop: 8, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    {images.front && (
                      <a href={images.front} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        DNI frente
                      </a>
                    )}
                    {images.back && (
                      <a href={images.back} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        DNI dorso
                      </a>
                    )}
                    {images.selfie && (
                      <a href={images.selfie} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        Selfie
                      </a>
                    )}
                    {k.diditSession?.session_url && (
                      <a
                        href={k.diditSession.session_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={14} />
                        Sesión Didit
                      </a>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Link
                    to={`/kyc/${k.user.id}`}
                    className="btn btn-primary btn-sm"
                    onClick={(e) => e.stopPropagation()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
                  >
                    Ver detalle
                    <ChevronRight size={16} />
                  </Link>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={(e) => { e.stopPropagation(); resolve(k.user.id, 'APROBADO'); }}
                    disabled={actionLoading}
                  >
                    Aprobar
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={(e) => { e.stopPropagation(); setRejectModal({ user: k, reason: '', sendEmail: false }); }}
                    disabled={actionLoading}
                  >
                    Rechazar
                  </button>
                  {hasDidit && (
                    <button
                      type="button"
                      className="btn btn-sm"
                      style={{ background: 'var(--border)', color: 'var(--text)' }}
                      onClick={(e) => { e.stopPropagation(); setResubmitModal(k); }}
                      disabled={actionLoading}
                    >
                      Solicitar reenvío
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Modal Rechazar */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <h2>Rechazar verificación</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
              {rejectModal.user.user?.email} – El usuario recibirá el motivo indicado.
            </p>
            <div className="form-group">
              <label>Motivo del rechazo</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Ej: Documento vencido, imagen ilegible..."
                value={rejectModal.reason}
                onChange={(e) => setRejectModal((m) => m ? { ...m, reason: e.target.value } : null)}
              />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                id="reject-send-email"
                checked={rejectModal.sendEmail}
                onChange={(e) => setRejectModal((m) => m ? { ...m, sendEmail: e.target.checked } : null)}
              />
              <label htmlFor="reject-send-email">Enviar email al usuario con el motivo</label>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => resolve(rejectModal.user.user.id, 'RECHAZADO', { rejectionReason: rejectModal.reason || 'Rechazado por el administrador', sendEmail: rejectModal.sendEmail })}
                disabled={actionLoading}
              >
                {actionLoading ? 'Rechazando…' : 'Rechazar'}
              </button>
              <button type="button" className="btn btn-sm" style={{ background: 'transparent', color: 'var(--text-muted)' }} onClick={() => setRejectModal(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Solicitar reenvío */}
      {resubmitModal && (
        <div className="modal-overlay" onClick={() => setResubmitModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <h2>Solicitar reenvío</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
              Se enviará al usuario un enlace para que vuelva a completar la verificación Didit. ¿Enviar también email de notificación?
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => resolve(resubmitModal.user.id, 'RESUBMIT', { sendEmail: true })}
                disabled={actionLoading}
              >
                {actionLoading ? 'Enviando…' : 'Sí, con email'}
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: 'var(--border)' }}
                onClick={() => resolve(resubmitModal.user.id, 'RESUBMIT', { sendEmail: false })}
                disabled={actionLoading}
              >
                Sin email
              </button>
              <button type="button" className="btn btn-sm" style={{ background: 'transparent', color: 'var(--text-muted)' }} onClick={() => setResubmitModal(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
