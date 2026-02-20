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

export function Conversations() {
  const { id } = useParams();
  const [list, setList] = useState<Conversation[]>([]);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api<{ conversations: Conversation[]; total: number }>('/api/admin/conversations')
      .then((data) => setList(data.conversations))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!id) {
      setDetail(null);
      return;
    }
    api<ConversationDetail>(`/api/admin/conversations/${id}/messages`)
      .then(setDetail)
      .catch(() => setDetail(null));
  }, [id]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const userLabel = (u: { email: string; firstName: string | null; lastName: string | null }) =>
    [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;

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
                  {userLabel(m.sender)} • {formatDate(m.createdAt)}
                </div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
              </div>
            ))}
          </div>
        </div>
      </>
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
                  <td>{formatDate(c.updatedAt)}</td>
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
