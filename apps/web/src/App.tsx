/**
 * Rutas de la app Tickets Transfer v2.
 * Ubicación: apps/web/src/App.tsx
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Welcome } from './pages/Welcome';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { Kyc } from './pages/Kyc';
import { KycCallback } from './pages/KycCallback';
import { Layout } from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="screen-center">
        <div className="loader" />
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
      <Route path="/kyc" element={<ProtectedRoute><Layout><Kyc /></Layout></ProtectedRoute>} />
      <Route path="/kyc/callback" element={<ProtectedRoute><Layout><KycCallback /></Layout></ProtectedRoute>} />
      <Route path="/publicar" element={<ProtectedRoute><Layout><div className="page-content"><h1 className="page-title">Publicar ticket</h1><p className="text-muted">Próximamente.</p></div></Layout></ProtectedRoute>} />
      <Route path="/mis-compras" element={<ProtectedRoute><Layout><div className="page-content"><h1 className="page-title">Mis compras</h1><p className="text-muted">Próximamente.</p></div></Layout></ProtectedRoute>} />
      <Route path="/mis-ventas" element={<ProtectedRoute><Layout><div className="page-content"><h1 className="page-title">Mis ventas</h1><p className="text-muted">Próximamente.</p></div></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
