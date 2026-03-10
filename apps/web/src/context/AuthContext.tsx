/**
 * Contexto de autenticación - Firebase Auth + API.
 * Login: Firebase signInWithEmailAndPassword.
 * Register: API crea usuario + customToken -> signInWithCustomToken.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signInWithEmailAndPassword, signInWithCustomToken, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getMe, register as apiRegister } from '../lib/api';

type User = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Record<string, unknown>) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!auth.currentUser) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await getMe() as { id: string; email: string; firstName?: string; lastName?: string; role: string };
      setUser({
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        fetchUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsub();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    const data = await getMe() as User;
    setUser(data);
  };

  const register = async (payload: Record<string, unknown>) => {
    const { confirmPassword, agreeTerms, ...body } = payload as Record<string, unknown>;
    void confirmPassword;
    void agreeTerms;
    const res = await apiRegister(body);
    await signInWithCustomToken(auth, res.customToken);
    setUser(res.user as User);
  };

  const logout = () => {
    signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
