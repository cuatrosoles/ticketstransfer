/**
 * Contexto de autenticación – app móvil
 * Usa Keychain/Keystore para almacenamiento seguro (nunca AsyncStorage para tokens).
 * Soporta autenticación biométrica (FaceID, TouchID, huella).
 * Ubicación: apps/mobile/src/context/AuthContext.tsx
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setTokenGetter } from '../lib/api';
import {
  getSecureToken,
  setSecureToken,
  removeSecureToken,
  getBiometricsEnabled,
  setBiometricsEnabled,
  isBiometricAvailable,
  promptBiometric,
  disableBiometrics as disableBiometricsStorage,
} from '../lib/secureStorage';

/** Clave legacy para migrar de AsyncStorage a Keychain (una sola vez) */
const TOKEN_KEY_LEGACY = '@tt_accessToken';

type User = { id: string; email: string; firstName?: string | null; lastName?: string | null; role: string };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  logout: () => void;
  /** Si es true, la pantalla principal debe redirigir a Kyc (igual que web tras registro). */
  getPostRegisterRedirectToKyc: () => boolean;
  clearPostRegisterRedirectToKyc: () => void;
  /** Activar biométricos tras login exitoso. Obtiene el token de Keychain y lo re-guarda con protección biométrica. */
  enableBiometrics: () => Promise<boolean>;
  /** Desactivar biométricos: re-guarda el token sin protección biométrica. */
  disableBiometrics: () => Promise<boolean>;
  /** Estado de disponibilidad biométrica (para UI) */
  biometricAvailability: { available: boolean; type: 'FaceID' | 'TouchID' | 'Biometrics' | null } | null;
  /** Si es true, HomeScreen debe mostrar el modal de activación biométrica (tras login/register) */
  getPendingBiometricPrompt: () => boolean;
  clearPendingBiometricPrompt: () => void;
  /** Recarga el usuario desde la API (ej. tras actualizar perfil) */
  fetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [biometricAvailability, setBiometricAvailability] = useState<{
    available: boolean;
    type: 'FaceID' | 'TouchID' | 'Biometrics' | null;
  } | null>(null);
  const postRegisterRedirectToKycRef = useRef(false);
  const pendingBiometricPromptRef = useRef(false);

  const loadUser = useCallback(async () => {
    setLoading(true);

    // Migración: si hay token en AsyncStorage (legacy), migrar a Keychain
    const legacyToken = await AsyncStorage.getItem(TOKEN_KEY_LEGACY);
    if (legacyToken) {
      await setSecureToken(legacyToken, false);
      await AsyncStorage.removeItem(TOKEN_KEY_LEGACY);
    }

    const biometricsEnabled = await getBiometricsEnabled();

    // Si biométricos activados: getSecureToken disparará el prompt del sistema
    let token: string | null = null;
    try {
      token = await getSecureToken();
    } catch {
      token = null;
    }

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setTokenGetter(() => token);
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
      await removeSecureToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    isBiometricAvailable().then(({ available, type }) => {
      setBiometricAvailability({ available, type: type ?? null });
    });
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api<{ user: User; accessToken: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      token: null,
    });
    await setSecureToken(data.accessToken, false);
    setTokenGetter(() => data.accessToken);
    pendingBiometricPromptRef.current = true;
    setUser(data.user);
  };

  const register = async (payload: Record<string, unknown>) => {
    const { confirmPassword, agreeTerms, repeatEmail, ...body } = payload as Record<string, unknown>;
    void confirmPassword;
    void agreeTerms;
    void repeatEmail;
    const data = await api<{ user: User; accessToken: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
      token: null,
    });
    await setSecureToken(data.accessToken, false);
    setTokenGetter(() => data.accessToken);
    postRegisterRedirectToKycRef.current = true;
    pendingBiometricPromptRef.current = true;
    setUser(data.user);
  };

  const enableBiometrics = useCallback(async (): Promise<boolean> => {
    const token = await getSecureToken();
    if (!token) return false;
    const passed = await promptBiometric('Autenticarse para activar inicio de sesión biométrico');
    if (!passed) return false;
    try {
      await setSecureToken(token, true);
      await setBiometricsEnabled(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const disableBiometrics = useCallback(async (): Promise<boolean> => {
    return disableBiometricsStorage();
  }, []);

  const getPostRegisterRedirectToKyc = () => postRegisterRedirectToKycRef.current;
  const clearPostRegisterRedirectToKyc = () => {
    postRegisterRedirectToKycRef.current = false;
  };
  const getPendingBiometricPrompt = () => pendingBiometricPromptRef.current;
  const clearPendingBiometricPrompt = () => {
    pendingBiometricPromptRef.current = false;
  };

  const fetchUser = useCallback(async () => {
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
      await removeSecureToken();
      setUser(null);
    }
  }, []);

  const logout = useCallback(async () => {
    await removeSecureToken();
    setTokenGetter(() => null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        getPostRegisterRedirectToKyc,
        clearPostRegisterRedirectToKyc,
        enableBiometrics,
        disableBiometrics,
        biometricAvailability,
        getPendingBiometricPrompt,
        clearPendingBiometricPrompt,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
