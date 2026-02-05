import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { downloadCsv } from '../utils/exportCsv';

type KycItem = {
  id: string;
  status: string;
  dniFrontUrl: string | null;
  dniBackUrl: string | null;
  selfieUrl: string | null;
  user: { id: string; email: string; firstName: string | null; lastName: string | null };
};

export function Kyc() {
  const [list, setList] = useState<KycItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api<KycItem[]>('/api/admin/kyc/pending')
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const resolve = async (userId: string, status: 'APROBADO' | 'RECHAZADO', rejectionReason?: string) => {
    try {
      await api(`/api/admin/kyc/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, rejectionReason }),
      });
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    }
  };

  const handleExport = () => {
    const rows = list.map((k) => [
      k.user.email,
      k.user.firstName ?? '',
      k.user.lastName ?? '',
      k.status,
    ]);
    downloadCsv(`kyc-pendientes-${new Date().toISOString().slice(0, 10)}.csv`, ['Email', 'Nombre', 'Apellido', 'Estado'], rows);
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
      {list.length === 0 ? (
        <div className="card">No hay verificaciones pendientes.</div>
      ) : (
        list.map((k) => (
          <div key={k.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <strong>{k.user.email}</strong>
                <span style={{ marginLeft: 8, color: 'var(--text-muted)' }}>
                  {[k.user.firstName, k.user.lastName].filter(Boolean).join(' ')}
                </span>
                <div style={{ marginTop: 8, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {k.dniFrontUrl && <a href={k.dniFrontUrl} target="_blank" rel="noopener noreferrer">DNI frente</a>}
                  {k.dniBackUrl && <a href={k.dniBackUrl} target="_blank" rel="noopener noreferrer">DNI dorso</a>}
                  {k.selfieUrl && <a href={k.selfieUrl} target="_blank" rel="noopener noreferrer">Selfie</a>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => resolve(k.user.id, 'APROBADO')}>
                  Aprobar
                </button>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => resolve(k.user.id, 'RECHAZADO', 'Documentación insuficiente')}>
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </>
  );
}
