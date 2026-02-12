/**
 * Contexto de autenticación – app móvil
 * Ubicación: apps/mobile/src/context/AuthContext.tsx
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setTokenGetter } from '../lib/api';
import {
  isBiometricAvailable,
  setSecureToken,
  setBiometricsEnabled,
  disableBiometrics as disableBiometricsStorage,
  type BiometricAvailability,
} from '../lib/secureStorage';

const TOKEN_KEY = '@tt_accessToken';

type User = { id: string; email: string; firstName?: string | null; lastName?: string | null; role: string };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  enableBiometrics: () => Promise<boolean>;
  disableBiometrics: () => Promise<boolean>;
  biometricAvailability: BiometricAvailability | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [biometricAvailability, setBiometricAvailability] = useState<BiometricAvailability | null>(null);

  useEffect(() => {
    isBiometricAvailable().then(setBiometricAvailability);
  }, []);

  const loadUser = useCallback(async () => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    setTokenGetter(() => token);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api<Record<string, unknown>>('/api/auth/me');
      setUser({
        id: data.id as string,
        email: data.email as string,
        firstName: data.firstName as string | null,
        lastName: data.lastName as string | null,
        role: data.role as string,
      });
    } catch {
      await AsyncStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    const data = await api<{ user: User; accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      token: null,
    });
    await AsyncStorage.setItem(TOKEN_KEY, data.accessToken);
    setTokenGetter(() => data.accessToken);
    setUser(data.user);
  };

  const register = async (payload: Record<string, unknown>) => {
    const { confirmPassword, agreeTerms, ...body } = payload as Record<string, unknown>;
    void confirmPassword;
    void agreeTerms;
    const data = await api<{ user: User; accessToken: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
      token: null,
    });
    await AsyncStorage.setItem(TOKEN_KEY, data.accessToken);
    setTokenGetter(() => data.accessToken);
    setUser(data.user);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setTokenGetter(() => null);
    setUser(null);
  };

  const fetchUser = loadUser;

  const enableBiometrics = async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (!token) return false;
      await setSecureToken(token, true);
      await setBiometricsEnabled(true);
      return true;
    } catch {
      return false;
    }
  };

  const disableBiometrics = async (): Promise<boolean> => {
    try {
      const ok = await disableBiometricsStorage();
      return ok;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser, enableBiometrics, disableBiometrics, biometricAvailability }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
