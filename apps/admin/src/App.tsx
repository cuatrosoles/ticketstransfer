import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Configuracion } from './pages/Configuracion';
import { Users } from './pages/Users';
import { UserDetail } from './pages/UserDetail';
import { Kyc } from './pages/Kyc';
import { KycDetail } from './pages/KycDetail';
import { Disputes } from './pages/Disputes';
import { DisputeDetail } from './pages/DisputeDetail';
import { Conversations } from './pages/Conversations';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';
import { Transfers } from './pages/Transfers';
import { Tickets } from './pages/Tickets';
import { TicketDetail } from './pages/TicketDetail';
import { InvoiceRequests } from './pages/InvoiceRequests';
import { Ratings } from './pages/Ratings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="users/:id" element={<UserDetail />} />
        <Route path="kyc" element={<Kyc />} />
        <Route path="kyc/:id" element={<KycDetail />} />
        <Route path="disputes" element={<Disputes />} />
        <Route path="disputes/:id" element={<DisputeDetail />} />
        <Route path="conversations" element={<Conversations />} />
        <Route path="conversations/:id" element={<Conversations />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="invoice-requests" element={<InvoiceRequests />} />
        <Route path="transfers" element={<Transfers />} />
        <Route path="tickets" element={<Tickets />} />
        <Route path="tickets/:id" element={<TicketDetail />} />
        <Route path="ratings" element={<Ratings />} />
        <Route path="configuracion" element={<Configuracion />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
