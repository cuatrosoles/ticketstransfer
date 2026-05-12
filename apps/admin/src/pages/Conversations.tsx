import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';

type Conversation = {
  id: string;
  user1: { id: string; email: string; firstName: string | null; lastName: string | null; numeroId: string | null };
  user2: { id: string; email: string; firstName: string | null; lastName: string | null; numeroId: string | null };
  messages: { content: string; createdAt: string }[];
  updatedAt: string;
};

type MessageDetail = {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; email: string; firstName: string | null; lastName: string | null };
};

type ConversationDetail = Omit<Conversation, 'messages'> & {
  messages: MessageDetail[];
};

function formatMsgDate(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function Conversations() {
  const { id } = useParams();
  const [list, setList] = useState<Conversation[]>([]);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [convLoading, setConvLoading] = useState(false);
  const [convTried, setConvTried] = useState(false);
  const [modBusy, setModBusy] = useState<string | null>(null);

  const loadList = () => {
    setLoading(true);
    api<{ conversations: Conversation[]; total: number }>('/api/admin/conversations')
      .then((data) => setList(data.conversations))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    loadList();
  }, []);

  const fetchDetail = (resetTried: boolean) => {
    if (!id) {
      setDetail(null);
      if (resetTried) setConvTried(false);
      return Promise.resolve();
    }
    setConvLoading(true);
    if (resetTried) setConvTried(false);
    return api<ConversationDetail>(`/api/admin/conversations/${id}/messages`)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => {
        setConvLoading(false);
        setConvTried(true);
      });
  };

  useEffect(() => {
    fetchDetail(true);
  }, [id]);

  const loadDetail = () => fetchDetail(false);

  const redactMessage = async (messageId: string) => {
    if (!confirm('¿Reemplazar el contenido por texto de moderación?')) return;
    setModBusy(messageId);
    try {
      await api(`/api/admin/messages/${messageId}`, {
        method: 'PATCH',
        body: JSON.stringify({ redact: true }),
      });
      loadDetail();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    } finally {
      setModBusy(null);
    }
  };

  const editMessage = async (messageId: string) => {
    const next = window.prompt('Nuevo contenido del mensaje (máx. 2000 caracteres):');
    if (next === null) return;
    const t = next.trim();
    if (!t) return;
    setModBusy(messageId);
    try {
      await api(`/api/admin/messages/${messageId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content: t.slice(0, 2000) }),
      });
      loadDetail();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error');
    } finally {
      setModBusy(null);
    }
  };

  const userLabel = (u: { email: string; firstName: string | null; lastName: string | null }) =>
    [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;

  if (id && !detail && (!convTried || convLoading)) {
    return <p>Cargando conversación…</p>;
  }

  if (id && !detail && convTried && !convLoading) {
    return (
      <p>
        No se pudo cargar la conversación.{' '}
        <Link to="/conversations">Volver al listado</Link>
      </p>
    );
  }

  if (id && detail) {
    return (
      <>
        <div className="admin-header">
          <Link to="/conversations" className="btn btn-sm" style={{ marginRight: 12 }}>
            ← Volver
          </Link>
          <h1 className="admin-title">Conversación (monitoreo)</h1>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          <div className="card" style={{ padding: 12 }}>
            <strong>Usuario 1:</strong> {userLabel(detail.user1)} ({detail.user1.email})
            {detail.user1.numeroId && ` • ID: ${detail.user1.numeroId}`}
          </div>
          <div className="card" style={{ padding: 12 }}>
            <strong>Usuario 2:</strong> {userLabel(detail.user2)} ({detail.user2.email})
            {detail.user2.numeroId && ` • ID: ${detail.user2.numeroId}`}
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Mensajes</h3>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {detail.messages.map((m: MessageDetail) => (
              <div
                key={m.id}
                style={{
                  padding: '10px 12px',
                  marginBottom: 8,
                  borderRadius: 8,
                  backgroundColor: 'var(--bg-card)',
                  borderLeft: `4px solid var(--primary)`,
                }}
              >
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                  {userLabel(m.sender)} • {formatMsgDate(m.createdAt)}
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-sm"
                    disabled={modBusy === m.id}
                    onClick={() => editMessage(m.id)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    disabled={modBusy === m.id}
                    onClick={() => redactMessage(m.id)}
                  >
                    Redactar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (id && !convLoading && !detail) {
    return (
      <p>
        No se pudo cargar la conversación.{' '}
        <Link to="/conversations">Volver al listado</Link>
      </p>
    );
  }

  if (loading && list.length === 0) return <p>Cargando…</p>;

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-title">Mensajería (monitoreo)</h1>
      </div>
      {list.length === 0 ? (
        <p>No hay conversaciones.</p>
      ) : (
        <div className="card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Usuario 1</th>
                <th>Usuario 2</th>
                <th>Último mensaje</th>
                <th>Actualizado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td>{userLabel(c.user1)}</td>
                  <td>{userLabel(c.user2)}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.messages[0]?.content?.slice(0, 80) || '—'}
                  </td>
                  <td>{formatMsgDate(c.updatedAt)}</td>
                  <td>
                    <Link to={`/conversations/${c.id}`} className="btn btn-sm btn-primary">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
