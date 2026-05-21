/**
 * Rutas de la app Tickets Transfer v2.
 * Ubicación: apps/web/src/App.tsx
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Welcome } from './pages/Welcome';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Kyc } from './pages/Kyc';
import { KycCallback } from './pages/KycCallback';
import { Home } from './pages/Home';
import { PreferencesOnboarding } from './pages/PreferencesOnboarding';
import { ComprarTicket } from './pages/ComprarTicket';
import { ComprarTicketDetalle } from './pages/ComprarTicketDetalle';
import { MiPublicacion } from './pages/MiPublicacion';
import { Tarjetas } from './pages/Tarjetas';
import { Pago } from './pages/Pago';
import { PagoResultado } from './pages/PagoResultado';
import { Acerca } from './pages/Acerca';
import { PoliticaPrivacidad } from './pages/PoliticaPrivacidad';
import { TerminosYCondiciones } from './pages/TerminosYCondiciones';
import { Soporte } from './pages/Soporte';
import { SolicitarBaja } from './pages/SolicitarBaja';
import { Perfil } from './pages/Perfil';
import { Publicar } from './pages/Publicar';
import { MisVentas } from './pages/MisVentas';
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
      <Route path="/kyc" element={<ProtectedRoute><Layout><Kyc /></Layout></ProtectedRoute>} />
      <Route path="/kyc/callback" element={<ProtectedRoute><Layout><KycCallback /></Layout></ProtectedRoute>} />
      <Route path="/home" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
      <Route path="/onboarding/preferencias" element={<ProtectedRoute><Layout><PreferencesOnboarding /></Layout></ProtectedRoute>} />
      <Route path="/publicar" element={<ProtectedRoute><Layout><Publicar /></Layout></ProtectedRoute>} />
      <Route path="/comprar-ticket" element={<ProtectedRoute><Layout><ComprarTicket /></Layout></ProtectedRoute>} />
      <Route path="/comprar-ticket/detalle" element={<ProtectedRoute><Layout><ComprarTicketDetalle /></Layout></ProtectedRoute>} />
      <Route path="/orden/:id/pago" element={<ProtectedRoute><Layout><Pago /></Layout></ProtectedRoute>} />
      <Route path="/orden/:id/pago/resultado" element={<ProtectedRoute><Layout><PagoResultado /></Layout></ProtectedRoute>} />
      <Route path="/mis-compras" element={<ProtectedRoute><Layout><div className="page-content"><h1 className="page-title">Mis compras</h1><p className="text-muted">Próximamente.</p></div></Layout></ProtectedRoute>} />
      <Route path="/mis-ventas" element={<ProtectedRoute><Layout><MisVentas /></Layout></ProtectedRoute>} />
      <Route path="/mis-ventas/publicacion/:id" element={<ProtectedRoute><Layout><MiPublicacion /></Layout></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><Layout><Perfil /></Layout></ProtectedRoute>} />
      <Route path="/tickets" element={<ProtectedRoute><Layout><div className="page-content"><h1 className="page-title">Tickets</h1><p className="text-muted">Próximamente.</p></div></Layout></ProtectedRoute>} />
      <Route path="/tarjetas" element={<ProtectedRoute><Layout><Tarjetas /></Layout></ProtectedRoute>} />
      <Route path="/soporte" element={<ProtectedRoute><Layout><Soporte /></Layout></ProtectedRoute>} />
      <Route path="/mensajes" element={<ProtectedRoute><Layout><div className="page-content"><h1 className="page-title">Mensajes</h1><p className="text-muted">Próximamente.</p></div></Layout></ProtectedRoute>} />
      <Route path="/acerca" element={<ProtectedRoute><Layout><Acerca /></Layout></ProtectedRoute>} />
      <Route path="/politica-privacidad" element={<ProtectedRoute><Layout><PoliticaPrivacidad /></Layout></ProtectedRoute>} />
      <Route path="/terminos-y-condiciones" element={<ProtectedRoute><Layout><TerminosYCondiciones /></Layout></ProtectedRoute>} />
      <Route path="/solicitar-baja" element={<ProtectedRoute><Layout><SolicitarBaja /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
