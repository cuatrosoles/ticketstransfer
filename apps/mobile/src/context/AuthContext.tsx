/**
 * Contexto de autenticación – Firebase Auth + API.
 * Login: Firebase signInWithEmailAndPassword.
 * Register: API crea usuario + customToken -> signInWithCustomToken.
 * Token: Firebase ID token para las requests a la API.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { auth } from '../lib/firebase';
import { api, setTokenGetter } from '../lib/api';
import {
  setSecureToken,
  removeSecureToken,
  setBiometricsEnabled,
  isBiometricAvailable,
  promptBiometric,
  disableBiometrics as disableBiometricsStorage,
} from '../lib/secureStorage';

type User = { id: string; email: string; firstName?: string | null; lastName?: string | null; role: string };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  logout: () => void;
  getPostRegisterRedirectToKyc: () => boolean;
  clearPostRegisterRedirectToKyc: () => void;
  enableBiometrics: () => Promise<boolean>;
  disableBiometrics: () => Promise<boolean>;
  biometricAvailability: { available: boolean; type: 'FaceID' | 'TouchID' | 'Biometrics' | null } | null;
  getPendingBiometricPrompt: () => boolean;
  clearPendingBiometricPrompt: () => void;
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

  const setFirebaseTokenGetter = useCallback(() => {
    setTokenGetter(async () => {
      const currentUser = auth().currentUser;
      if (!currentUser) return null;
      try {
        return await currentUser.getIdToken(true);
      } catch {
        return null;
      }
    });
  }, []);

  const loadUser = useCallback(async () => {
    setLoading(true);

    const currentUser = auth().currentUser;
    if (!currentUser) {
      await removeSecureToken();
      setTokenGetter(() => null);
      setUser(null);
      setLoading(false);
      return;
    }

    setFirebaseTokenGetter();
    try {
      const token = await currentUser.getIdToken();
      await setSecureToken(token, false);
      const data = await api<Record<string, unknown>>('/api/auth/me');
      setUser({
        id: data.id as string,
        email: data.email as string,
        firstName: data.firstName as string | null,
        lastName: data.lastName as string | null,
        role: data.role as string,
      });
    } catch {
      await auth().signOut();
      await removeSecureToken();
      setTokenGetter(() => null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setFirebaseTokenGetter]);

  useEffect(() => {
    const unsub = auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        loadUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsub();
  }, [loadUser]);

  useEffect(() => {
    isBiometricAvailable().then(({ available, type }) => {
      setBiometricAvailability({ available, type: type ?? null });
    });
  }, []);

  const login = async (email: string, password: string) => {
    const credential = await auth().signInWithEmailAndPassword(email, password);
    const userData = credential.user;
    setFirebaseTokenGetter();
    postRegisterRedirectToKycRef.current = false;
    pendingBiometricPromptRef.current = true;
    const token = await userData.getIdToken();
    await setSecureToken(token, false);
    const data = await api<Record<string, unknown>>('/api/auth/me');
    setUser({
      id: data.id as string,
      email: data.email as string,
      firstName: data.firstName as string | null,
      lastName: data.lastName as string | null,
      role: data.role as string,
    });
  };

  const register = async (payload: Record<string, unknown>) => {
    const { confirmPassword, agreeTerms, repeatEmail, ...body } = payload as Record<string, unknown>;
    void confirmPassword;
    void agreeTerms;
    void repeatEmail;

    const res = await api<{ user: User; customToken: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
      token: null,
    });

    await auth().signInWithCustomToken(res.customToken);
    const userData = auth().currentUser!;
    setFirebaseTokenGetter();
    postRegisterRedirectToKycRef.current = true;
    pendingBiometricPromptRef.current = true;
    const token = await userData.getIdToken();
    await setSecureToken(token, false);
    setUser(res.user);
  };

  const enableBiometrics = useCallback(async (): Promise<boolean> => {
    const currentUser = auth().currentUser;
    if (!currentUser) return false;
    const passed = await promptBiometric('Autenticarse para activar inicio de sesión biométrico');
    if (!passed) return false;
    try {
      const token = await currentUser.getIdToken(true);
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
      await auth().signOut();
      await removeSecureToken();
      setUser(null);
    }
  }, []);

  const logout = useCallback(async () => {
    await auth().signOut();
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
