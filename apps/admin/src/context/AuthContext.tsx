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
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        throw new Error('Usuario no encontrado en Firebase Auth. Creá el usuario en Firebase Console → Authentication → Add user.');
      }
      if (err.code === 'auth/wrong-password') {
        throw new Error('Contraseña incorrecta');
      }
      throw new Error(err.message || 'Error al iniciar sesión');
    }
    const data = await getMe();
    if (data.role !== 'admin') {
      await signOut(auth);
      throw new Error('Acceso solo para administradores. Tu usuario debe tener role "admin" en Firestore.');
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
