/**
 * Registra y renueva el token FCM al iniciar sesión (no solo en Mensajes).
 */

import * as React from 'react';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../lib/api';
import { getFcmToken, onTokenRefresh, requestNotificationPermission } from '../lib/pushNotifications';

export function FcmTokenRegistrar() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const syncToken = async () => {
      try {
        const token = await getFcmToken();
        if (!token || cancelled) return;
        await updateProfile({ fcmToken: token });
      } catch {
        // FCM es opcional
      }
    };

    void requestNotificationPermission().then((granted) => {
      if (!granted || cancelled) return;
      void syncToken();
    });

    const unsubscribe = onTokenRefresh(() => {
      void syncToken();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [user?.id]);

  return null;
}
