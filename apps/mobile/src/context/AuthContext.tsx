/**
 * Contexto de autenticación – Firebase Auth + API.
 * Login: Firebase signInWithEmailAndPassword.
 * Register: API crea usuario + customToken -> signInWithCustomToken.
 * Token: Firebase ID token para las requests a la API.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { auth } from '../lib/firebase';
import { api, setTokenGetter, getEmailForLogin, getBiometricPreference, updateBiometricPreference } from '../lib/api';
import {
  setSecureToken,
  removeSecureToken,
  setBiometricsEnabledForUser,
  getBiometricsEnabledForUser,
  isBiometricAvailable,
  promptBiometric,
  disableBiometrics as disableBiometricsStorage,
} from '../lib/secureStorage';
import { biometricLockBypassPickerOpenRef } from '../lib/biometricLockBypass';

type User = { id: string; email: string; firstName?: string | null; lastName?: string | null; role: string };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  logout: () => void;
  getPostRegisterRedirectToKyc: () => boolean;
  clearPostRegisterRedirectToKyc: () => void;
  getPostRegisterRedirectToPreferences: () => boolean;
  clearPostRegisterRedirectToPreferences: () => void;
  enableBiometrics: () => Promise<boolean>;
  disableBiometrics: () => Promise<boolean>;
  biometricEnabled: boolean;
  biometricAvailability: { available: boolean; type: 'FaceID' | 'TouchID' | 'Biometrics' | null } | null;
  isAppUnlocked: boolean;
  unlockWithBiometrics: () => Promise<boolean>;
  lockApp: () => void;
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
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isAppUnlocked, setIsAppUnlocked] = useState(true);
  const postRegisterRedirectToKycRef = useRef(false);
  const postRegisterRedirectToPreferencesRef = useRef(false);
  const pendingBiometricPromptRef = useRef(false);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const mapBiometricMethod = useCallback(
    (type: 'FaceID' | 'TouchID' | 'Biometrics' | null): 'face' | 'fingerprint' | 'device' | null => {
      if (type === 'FaceID') return 'face';
      if (type === 'TouchID') return 'fingerprint';
      if (type === 'Biometrics') return 'device';
      return null;
    },
    []
  );

  const refreshBiometricEnabled = useCallback(async (userId: string): Promise<boolean> => {
    const localEnabled = await getBiometricsEnabledForUser(userId);
    try {
      const pref = await getBiometricPreference();
      const next = Boolean(pref.biometricEnabled) && localEnabled;
      setBiometricEnabled(next);
      return next;
    } catch {
      setBiometricEnabled(localEnabled);
      return localEnabled;
    }
  }, []);

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
      setBiometricEnabled(false);
      setIsAppUnlocked(true);
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
      const enabled = await refreshBiometricEnabled(data.id as string);
      setIsAppUnlocked(!enabled);
    } catch {
      await auth().signOut();
      await removeSecureToken();
      setTokenGetter(() => null);
      setUser(null);
      setBiometricEnabled(false);
      setIsAppUnlocked(true);
    } finally {
      setLoading(false);
    }
  }, [refreshBiometricEnabled, setFirebaseTokenGetter]);

  useEffect(() => {
    const unsub = auth().onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        loadUser();
      } else {
        setUser(null);
        setBiometricEnabled(false);
        setIsAppUnlocked(true);
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

  const login = async (emailOrUsername: string, password: string) => {
    const email = await getEmailForLogin(emailOrUsername.trim());
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
    await refreshBiometricEnabled(data.id as string);
    setIsAppUnlocked(true);
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
    postRegisterRedirectToPreferencesRef.current = true;
    postRegisterRedirectToKycRef.current = true;
    pendingBiometricPromptRef.current = true;
    const token = await userData.getIdToken();
    await setSecureToken(token, false);
    setUser(res.user);
    await refreshBiometricEnabled(res.user.id);
    setIsAppUnlocked(true);
  };

  const enableBiometrics = useCallback(async (): Promise<boolean> => {
    const currentUser = auth().currentUser;
    if (!currentUser) return false;
    const passed = await promptBiometric('Autenticarse para activar inicio de sesión biométrico');
    if (!passed) return false;
    try {
      const token = await currentUser.getIdToken(true);
      await setSecureToken(token, true);
      await setBiometricsEnabledForUser(currentUser.uid, true);
      await updateBiometricPreference({
        enabled: true,
        method: mapBiometricMethod(biometricAvailability?.type ?? null),
      });
      setBiometricEnabled(true);
      setIsAppUnlocked(true);
      return true;
    } catch {
      return false;
    }
  }, [biometricAvailability?.type, mapBiometricMethod]);

  const disableBiometrics = useCallback(async (): Promise<boolean> => {
    const currentUser = auth().currentUser;
    if (!currentUser) return false;
    const ok = await disableBiometricsStorage(currentUser.uid);
    if (!ok) return false;
    try {
      await setBiometricsEnabledForUser(currentUser.uid, false);
      await updateBiometricPreference({ enabled: false, method: null });
      setBiometricEnabled(false);
      setIsAppUnlocked(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  const unlockWithBiometrics = useCallback(async (): Promise<boolean> => {
    if (!user || !biometricEnabled) {
      setIsAppUnlocked(true);
      return true;
    }
    const passed = await promptBiometric('Validá tu identidad para acceder a la app');
    setIsAppUnlocked(passed);
    return passed;
  }, [biometricEnabled, user]);

  const lockApp = useCallback(() => {
    if (!user || !biometricEnabled) return;
    setIsAppUnlocked(false);
  }, [biometricEnabled, user]);

  const getPostRegisterRedirectToKyc = () => postRegisterRedirectToKycRef.current;
  const clearPostRegisterRedirectToKyc = () => {
    postRegisterRedirectToKycRef.current = false;
  };
  const getPostRegisterRedirectToPreferences = () => postRegisterRedirectToPreferencesRef.current;
  const clearPostRegisterRedirectToPreferences = () => {
    postRegisterRedirectToPreferencesRef.current = false;
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
      await refreshBiometricEnabled(data.id as string);
    } catch {
      await auth().signOut();
      await removeSecureToken();
      setUser(null);
      setBiometricEnabled(false);
      setIsAppUnlocked(true);
    }
  }, [refreshBiometricEnabled]);

  const logout = useCallback(async () => {
    await auth().signOut();
    await removeSecureToken();
    setTokenGetter(() => null);
    setUser(null);
    setBiometricEnabled(false);
    setIsAppUnlocked(true);
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;
      if (!user || !biometricEnabled) return;
      if (prev === 'active' && (nextState === 'background' || nextState === 'inactive')) {
        // Cámara/galería ponen la app en segundo plano sin que el usuario “salga” de la app.
        if (biometricLockBypassPickerOpenRef.current) return;
        setIsAppUnlocked(false);
        return;
      }
      if ((prev === 'background' || prev === 'inactive') && nextState === 'active') {
        void unlockWithBiometrics();
      }
    });
    return () => sub.remove();
  }, [biometricEnabled, unlockWithBiometrics, user]);

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
        getPostRegisterRedirectToPreferences,
        clearPostRegisterRedirectToPreferences,
        enableBiometrics,
        disableBiometrics,
        biometricEnabled,
        biometricAvailability,
        isAppUnlocked,
        unlockWithBiometrics,
        lockApp,
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
