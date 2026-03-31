/**
 * Cuando llega un push FCM en primer plano, las pantallas de mensajes se refrescan sin depender solo del polling.
 */

type MessageHintListener = (conversationId?: string) => void;

const listeners = new Set<MessageHintListener>();

export function subscribeNewMessageHint(listener: MessageHintListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitNewMessageHint(conversationId?: string): void {
  for (const fn of listeners) {
    try {
      fn(conversationId);
    } catch {
      /* noop */
    }
  }
}
