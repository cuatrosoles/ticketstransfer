/**
 * Escucha mensajes FCM con la app en primer plano y dispara actualización de listas/chats.
 */

import * as React from 'react';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { onMessage } from '../lib/pushNotifications';
import { emitNewMessageHint } from '../lib/messageSync';

export function FcmForegroundMessageSync() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onMessage((remote) => {
      const d = remote.data;
      if (d?.type === 'new_message') {
        emitNewMessageHint(d.conversationId);
      }
    });
    return unsubscribe;
  }, [user]);

  return null;
}
