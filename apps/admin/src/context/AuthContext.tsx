import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getMe } from '../lib/api';

type User = { id: string; email: string; role: string };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!auth.currentUser) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await getMe();
      if (data.role !== 'admin') {
        await signOut(auth);
        setUser(null);
      } else {
        setUser({ id: data.id, email: data.email, role: data.role });
      }
    } catch {
      await signOut(auth);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        loadUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsub();
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const data = await getMe();
    if (data.role !== 'admin') {
      await signOut(auth);
      throw new Error('Acceso solo para administradores');
    }
    setUser({ id: data.id, email: data.email, role: data.role });
  };

  const logout = () => {
    signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
