/**
 * Detalle de verificación KYC – pantalla completa con datos Didit o legacy,
 * imágenes, datos extraídos y acciones (aprobar, rechazar, solicitar reenvío).
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { ExternalLink, RotateCcw } from 'lucide-react';

type DiditIdVerification = {
  front_image?: string;
  back_image?: string;
  portrait_image?: string;
  document_type?: string;
  document_number?: string;
  personal_number?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  date_of_birth?: string;
  address?: string;
  formatted_address?: string;
  expiration_date?: string;
  issuing_state?: string;
  status?: string;
  front_image_camera_front_face_match_score?: number;
  back_image_camera_front_face_match_score?: number;
};

type DiditSession = {
  session_id: string;
  session_number?: number;
  session_url?: string;
  status?: string;
  features?: string[];
  id_verifications?: DiditIdVerification[];
  liveness_verifications?: Array<{
    status?: string;
    liveness_score?: number;
    selfie_image?: string;
  }>;
};

type KycDetailData = {
  id: string;
  status: string;
  rejectionReason: string | null;
  dniFrontUrl: string | null;
  dniBackUrl: string | null;
  selfieUrl: string | null;
  diditSessionId: string | null;
  hasDiditSession: boolean;
  didit: DiditSession | null;
  reviewedAt: string | Date | null;
  updatedAt: string | Date | null;
  user: { id: string; email: string; firstName?: string | null; lastName?: string | null } | null;
};

export function KycDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<KycDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(false);
  const [resubmitModal, setResubmitModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectSendEmail, setRejectSendEmail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    if (!id) return;
    setLoading(true);
    api<KycDetailData>(`/api/admin/kyc/${id}/detail`)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const resolve = async (
    status: 'APROBADO' | 'RECHAZADO' | 'RESUBMIT',
    options?: { rejectionReason?: string; sendEmail?: boolean }
  ) => {
    if (!id) return;
    setActionLoading(true);
    try {
      await api(`/api/admin/kyc/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          rejectionReason: options?.rejectionReason,
          sendEmail: options?.sendEmail,
        }),
      });
      setRejectModal(false);
      setResubmitModal(false);
      load();
      if (status === 'APROBADO' || status === 'RECHAZADO') {
        navigate('/kyc');
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d: string | Date | null | undefined) => {
    if (!d) return '—';
    const date = typeof d === 'string' ? new Date(d) : d;
    return date.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const statusBadge = (s: string) => {
    const c =
      s === 'APROBADO' ? 'approved' :
      s === 'RECHAZADO' ? 'rejected' :
      s === 'EN_REVISION' ? 'open' : 'pending';
    return <span className={`badge badge-${c}`}>{s}</span>;
  };

  if (loading) return <p>Cargando…</p>;
  if (!data) return <p>Verificación KYC no encontrada.</p>;

  const diditId = data.didit?.id_verifications?.[0];
  const images = data.hasDiditSession && diditId
    ? {
        front: diditId.front_image,
        back: diditId.back_image,
        selfie: diditId.portrait_image || data.didit?.liveness_verifications?.[0]?.selfie_image,
      }
    : {
        front: data.dniFrontUrl,
        back: data.dniBackUrl,
        selfie: data.selfieUrl,
      };

  const canApproveReject = data.status === 'EN_REVISION' || data.status === 'PENDIENTE';

  return (
    <>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Link to="/kyc" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 4, display: 'block' }}>← Volver a KYC</Link>
          <h1 className="admin-title">Detalle de verificación KYC</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0' }}>
            {data.user?.email} – {[data.user?.firstName, data.user?.lastName].filter(Boolean).join(' ') || 'Sin nombre'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {statusBadge(data.status)}
          {data.hasDiditSession && (
            <span className="badge badge-open">Didit</span>
          )}
          {canApproveReject && (
            <>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => resolve('APROBADO')}
                disabled={actionLoading}
              >
                Aprobar
              </button>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => setRejectModal(true)}
                disabled={actionLoading}
              >
                Rechazar
              </button>
              {data.hasDiditSession && (
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{ background: 'var(--border)', color: 'var(--text)' }}
                  onClick={() => setResubmitModal(true)}
                  disabled={actionLoading}
                >
                  <RotateCcw size={14} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                  Solicitar reenvío
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Usuario</h3>
          <dl className="detail-dl">
            <dt>ID</dt><dd><code>{data.id}</code></dd>
            <dt>Email</dt><dd>{data.user?.email || '—'}</dd>
            <dt>Nombre</dt><dd>{[data.user?.firstName, data.user?.lastName].filter(Boolean).join(' ') || '—'}</dd>
            <dt>Estado</dt><dd>{statusBadge(data.status)}</dd>
            {data.rejectionReason && <><dt>Motivo rechazo</dt><dd>{data.rejectionReason}</dd></>}
            <dt>Última actualización</dt><dd>{formatDate(data.updatedAt)}</dd>
          </dl>
        </div>

        {data.hasDiditSession && diditId && (
          <div className="card">
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Datos extraídos (Didit)</h3>
            <dl className="detail-dl">
              <dt>Tipo documento</dt><dd>{diditId.document_type || '—'}</dd>
              <dt>Nº documento</dt><dd>{diditId.document_number || '—'}</dd>
              <dt>Nº personal</dt><dd>{diditId.personal_number || '—'}</dd>
              <dt>Nombre completo</dt><dd>{diditId.full_name || [diditId.first_name, diditId.last_name].filter(Boolean).join(' ') || '—'}</dd>
              <dt>Fecha nacimiento</dt><dd>{diditId.date_of_birth || '—'}</dd>
              <dt>Dirección</dt><dd>{diditId.formatted_address || diditId.address || '—'}</dd>
              <dt>Vencimiento doc</dt><dd>{diditId.expiration_date || '—'}</dd>
              <dt>Estado Didit</dt><dd>{data.didit?.status || '—'}</dd>
              {diditId.front_image_camera_front_face_match_score != null && (
                <><dt>Face match (frente)</dt><dd>{diditId.front_image_camera_front_face_match_score}%</dd></>
              )}
              {diditId.back_image_camera_front_face_match_score != null && (
                <><dt>Face match (dorso)</dt><dd>{diditId.back_image_camera_front_face_match_score}%</dd></>
              )}
            </dl>
            {data.didit?.session_url && (
              <a href={data.didit.session_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, color: 'var(--primary)' }}>
                <ExternalLink size={16} />
                Abrir sesión en Didit
              </a>
            )}
          </div>
        )}

        {!data.hasDiditSession && (
          <div className="card">
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Verificación legacy</h3>
            <p className="text-muted">Esta verificación usó el flujo de subida manual (no Didit).</p>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ marginTop: 0, marginBottom: 12 }}>Imágenes</h3>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {images.front ? (
            <div>
              <p style={{ fontSize: '0.8rem', marginBottom: 8, color: 'var(--text-muted)' }}>Documento frente</p>
              <a href={images.front} target="_blank" rel="noopener noreferrer">
                <img src={images.front} alt="DNI frente" style={{ maxWidth: 280, borderRadius: 8, border: '1px solid var(--border)' }} />
              </a>
            </div>
          ) : (
            <div><p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Documento frente: —</p></div>
          )}
          {images.back ? (
            <div>
              <p style={{ fontSize: '0.8rem', marginBottom: 8, color: 'var(--text-muted)' }}>Documento dorso</p>
              <a href={images.back} target="_blank" rel="noopener noreferrer">
                <img src={images.back} alt="DNI dorso" style={{ maxWidth: 280, borderRadius: 8, border: '1px solid var(--border)' }} />
              </a>
            </div>
          ) : (
            <div><p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Documento dorso: —</p></div>
          )}
          {images.selfie ? (
            <div>
              <p style={{ fontSize: '0.8rem', marginBottom: 8, color: 'var(--text-muted)' }}>Selfie</p>
              <a href={images.selfie} target="_blank" rel="noopener noreferrer">
                <img src={images.selfie} alt="Selfie" style={{ maxWidth: 200, borderRadius: 8, border: '1px solid var(--border)' }} />
              </a>
            </div>
          ) : (
            <div><p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Selfie: —</p></div>
          )}
        </div>
        {!images.front && !images.back && !images.selfie && (
          <p className="text-muted">No hay imágenes disponibles.</p>
        )}
      </div>

      {/* Modal Rechazar */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <h2>Rechazar verificación</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
              {data.user?.email} – El usuario recibirá el motivo indicado.
            </p>
            <div className="form-group">
              <label>Motivo del rechazo</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Ej: Documento vencido, imagen ilegible..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                id="reject-send-email"
                checked={rejectSendEmail}
                onChange={(e) => setRejectSendEmail(e.target.checked)}
              />
              <label htmlFor="reject-send-email">Enviar email al usuario con el motivo</label>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => resolve('RECHAZADO', { rejectionReason: rejectReason || 'Rechazado por el administrador', sendEmail: rejectSendEmail })}
                disabled={actionLoading}
              >
                {actionLoading ? 'Rechazando…' : 'Rechazar'}
              </button>
              <button type="button" className="btn btn-sm" style={{ background: 'transparent', color: 'var(--text-muted)' }} onClick={() => setRejectModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Solicitar reenvío */}
      {resubmitModal && (
        <div className="modal-overlay" onClick={() => setResubmitModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <h2>Solicitar reenvío</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
              Se enviará al usuario un enlace para que vuelva a completar la verificación Didit. ¿Enviar también email de notificación?
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => resolve('RESUBMIT', { sendEmail: true })}
                disabled={actionLoading}
              >
                {actionLoading ? 'Enviando…' : 'Sí, con email'}
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: 'var(--border)' }}
                onClick={() => resolve('RESUBMIT', { sendEmail: false })}
                disabled={actionLoading}
              >
                Sin email
              </button>
              <button type="button" className="btn btn-sm" style={{ background: 'transparent', color: 'var(--text-muted)' }} onClick={() => setResubmitModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
