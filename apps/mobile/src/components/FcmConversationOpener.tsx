/**
 * Abre el chat correcto al tocar una push de "Nuevo mensaje" (app en background o cerrada).
 */

import * as React from 'react';
import { useEffect, useRef } from 'react';
import type { NavigationContainerRef } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getConversationById } from '../lib/api';
import { getInitialNotification, onNotificationOpenedApp } from '../lib/pushNotifications';
import type { RootStackParamList } from '../navigation/types';

export function FcmConversationOpener({
  navigationRef,
}: {
  navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList> | null>;
}) {
  const { user } = useAuth();
  const handledInitialRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    const openChat = (data: Record<string, string> | undefined) => {
      if (!data || data.type !== 'new_message' || !data.conversationId) return;
      const convId = data.conversationId;
      getConversationById(convId)
        .then((meta) => {
          const nav = navigationRef.current;
          if (!nav?.isReady()) return;
          nav.navigate('MensajesConversation', {
            conversationId: meta.id,
            otherUser: {
              id: meta.otherUser.id,
              email: meta.otherUser.email,
              firstName: meta.otherUser.firstName,
              lastName: meta.otherUser.lastName,
              username: meta.otherUser.username,
              numeroId: meta.otherUser.numeroId,
              profileImageUrl: meta.otherUser.profileImageUrl,
            },
          });
        })
        .catch(() => {});
    };

    if (!handledInitialRef.current) {
      handledInitialRef.current = true;
      void getInitialNotification().then((msg) => {
        if (msg?.data) openChat(msg.data as Record<string, string>);
      });
    }

    return onNotificationOpenedApp((remote) => openChat(remote.data as Record<string, string> | undefined));
  }, [user, navigationRef]);

  return null;
}
