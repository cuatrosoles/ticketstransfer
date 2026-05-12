import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';

type Message = { id: string; content: string; isModerator: boolean; createdAt: string; user: { email: string } };
type DisputeDetailType = {
  id: string;
  status: string;
  reason: string | null;
  adminNotes?: string | null;
  order: {
    id: string;
    ticketListing: { eventName: string };
    buyer: { email: string };
    seller: { email: string };
  };
  messages: Message[];
};

export function DisputeDetail() {
  const { id } = useParams<{ id: string }>();
  const [dispute, setDispute] = useState<DisputeDetailType | null>(null);
  const [message, setMessage] = useState('');
  const [adminNotesDraft, setAdminNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [modBusy, setModBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!id) return;
    api<DisputeDetailType>(`/api/disputes/${id}`)
      .then((d) => {
        setDispute(d);
        setAdminNotesDraft(typeof d.adminNotes === 'string' ? d.adminNotes : '');
      })
      .catch(() => setDispute(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const sendMessage = async () => {
    if (!id || !message.trim()) return;
    try {
      await api(`/api/disputes/${id}/messages`, { method: 'POST', body: JSON.stringify({ content: message.trim() }) });
      setMessage('');
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    }
  };

  const resolve = async (resolution: 'RESUELTA_FAVOR_COMPRADOR' | 'RESUELTA_FAVOR_VENDEDOR') => {
    if (!id) return;
    if (!confirm(resolution === 'RESUELTA_FAVOR_COMPRADOR' ? '¿Resolver a favor del comprador?' : '¿Resolver a favor del vendedor?')) return;
    try {
      await api(`/api/admin/disputes/${id}/resolve`, { method: 'PATCH', body: JSON.stringify({ resolution }) });
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    }
  };

  const saveAdminNotes = async () => {
    if (!id) return;
    setSavingNotes(true);
    try {
      await api(`/api/admin/disputes/${id}/notes`, {
        method: 'PATCH',
        body: JSON.stringify({ adminNotes: adminNotesDraft }),
      });
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    } finally {
      setSavingNotes(false);
    }
  };

  const redactDisputeMessage = async (messageId: string) => {
    if (!confirm('¿Redactar este mensaje?')) return;
    setModBusy(messageId);
    try {
      await api(`/api/admin/dispute-messages/${messageId}`, { method: 'PATCH', body: JSON.stringify({ redact: true }) });
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    } finally {
      setModBusy(null);
    }
  };

  const editDisputeMessage = async (messageId: string) => {
    const next = window.prompt('Nuevo contenido:');
    if (next === null) return;
    const t = next.trim();
    if (!t) return;
    setModBusy(messageId);
    try {
      await api(`/api/admin/dispute-messages/${messageId}`, { method: 'PATCH', body: JSON.stringify({ content: t }) });
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    } finally {
      setModBusy(null);
    }
  };

  if (loading) return <p>Cargando…</p>;
  if (!dispute) return <p>Disputa no encontrada.</p>;

  const canResolve = !dispute.status.includes('RESUELTA');

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-title">Disputa {dispute.id.slice(0, 8)}…</h1>
      </div>
      <div className="card">
        <p><strong>Evento:</strong> {dispute.order.ticketListing.eventName}</p>
        <p><strong>Comprador:</strong> {dispute.order.buyer.email}</p>
        <p><strong>Vendedor:</strong> {dispute.order.seller.email}</p>
        <p><strong>Estado:</strong> <span className={`badge badge-${dispute.status.includes('RESUELTA') ? 'approved' : 'open'}`}>{dispute.status}</span></p>
        {dispute.reason && <p><strong>Motivo:</strong> {dispute.reason}</p>}
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Notas internas (admin)</h3>
        <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: 0 }}>
          Solo para el equipo; no se muestran en la app salvo que lo implementes en el cliente.
        </p>
        <textarea
          className="input"
          rows={4}
          value={adminNotesDraft}
          onChange={(e) => setAdminNotesDraft(e.target.value)}
          placeholder="Observaciones, enlaces a evidencia externa, etc."
        />
        <button type="button" className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={saveAdminNotes} disabled={savingNotes}>
          {savingNotes ? 'Guardando…' : 'Guardar notas'}
        </button>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Mensajes</h3>
        {dispute.messages.length === 0 ? <p className="text-muted">Sin mensajes.</p> : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {dispute.messages.map((m) => (
              <li key={m.id} style={{ marginBottom: 12, padding: 8, background: m.isModerator ? 'rgba(59,130,246,0.1)' : 'transparent', borderRadius: 8 }}>
                <strong>{m.user.email}</strong> {m.isModerator && <span className="badge badge-pending">Mod</span>}
                <div>{m.content}</div>
                <small style={{ color: 'var(--text-muted)' }}>{new Date(m.createdAt).toLocaleString()}</small>
                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn-sm" disabled={modBusy === m.id} onClick={() => editDisputeMessage(m.id)}>
                    Editar
                  </button>
                  <button type="button" className="btn btn-sm btn-danger" disabled={modBusy === m.id} onClick={() => redactDisputeMessage(m.id)}>
                    Redactar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input className="input" style={{ flex: 1 }} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Escribir mensaje..." />
          <button type="button" className="btn btn-primary" onClick={sendMessage}>Enviar</button>
        </div>
      </div>
      {canResolve && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Resolución</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-primary" onClick={() => resolve('RESUELTA_FAVOR_COMPRADOR')}>A favor del comprador</button>
            <button type="button" className="btn btn-danger" onClick={() => resolve('RESUELTA_FAVOR_VENDEDOR')}>A favor del vendedor</button>
          </div>
        </div>
      )}
    </>
  );
}
