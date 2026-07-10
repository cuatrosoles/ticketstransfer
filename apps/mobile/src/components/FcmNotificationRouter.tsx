/**
 * Deep links al tocar notificaciones push (ventas, reembolsos, chat, recomendaciones, etc.).
 */

import * as React from 'react';
import { useEffect, useRef } from 'react';
import type { NavigationContainerRef } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getConversationById } from '../lib/api';
import { getInitialNotification, onNotificationOpenedApp } from '../lib/pushNotifications';
import type { RootStackParamList } from '../navigation/types';

function orderSourceFromRole(role?: string): 'buyer' | 'seller' {
  return role === 'seller' ? 'seller' : 'buyer';
}

export function FcmNotificationRouter({
  navigationRef,
}: {
  navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList> | null>;
}) {
  const { user } = useAuth();
  const handledInitialRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    const navigate = (data: Record<string, string> | undefined) => {
      if (!data?.type) return;
      const nav = navigationRef.current;
      if (!nav?.isReady()) return;

      const type = data.type;

      if (type === 'new_message' && data.conversationId) {
        const convId = data.conversationId;
        getConversationById(convId)
          .then((meta) => {
            if (!navigationRef.current?.isReady()) return;
            navigationRef.current.navigate('MensajesConversation', {
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
        return;
      }

      if (
        (type === 'order_payment' || type === 'order_refund' || type === 'order_delivery') &&
        data.orderId
      ) {
        const source = orderSourceFromRole(data.role);
        if (source === 'seller') {
          nav.navigate('MySales');
        } else {
          nav.navigate('OrderDetail', { orderId: data.orderId, source });
        }
        return;
      }

      if ((type === 'nearby_events' || type === 'recommendation') && data.listingId) {
        nav.navigate('ComprarTicket');
        return;
      }

      if (type === 'admin_broadcast' || type === 'admin_test') {
        nav.navigate('Main', { screen: 'Home' });
      }
    };

    if (!handledInitialRef.current) {
      handledInitialRef.current = true;
      void getInitialNotification().then((msg) => {
        if (msg?.data) navigate(msg.data as Record<string, string>);
      });
    }

    return onNotificationOpenedApp((remote) => navigate(remote.data));
  }, [user, navigationRef]);

  return null;
}
