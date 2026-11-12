import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import CreateTicket from './pages/tickets/CreateTicket';
import AllTickets from './pages/tickets/AllTickets';
import TicketDetails from './pages/tickets/TicketDetails';
import TechnicianManagement from './pages/technicians/TechnicianManagement';
import SLAManagement from './pages/sla/SLAManagement';
import AssetManagement from './pages/assets/AssetManagement';
import ServiceCatalog from './pages/services/ServiceCatalog';
import ProblemManagement from './pages/problems/ProblemManagement';
import EscalationManagement from './pages/escalations/EscalationManagement';
import ProfileSettings from './pages/profile/ProfileSettings';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role_id === 5 || user.role_id === 4) return <Navigate to="/admin" replace />;
  if (user.role_id === 3) return <Navigate to="/technician" replace />;
  return <Navigate to="/employee" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Role Dashboards */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoleIds={[4, 5]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/technician"
            element={
              <ProtectedRoute allowedRoleIds={[3]}>
                <TechnicianDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee"
            element={
              <ProtectedRoute allowedRoleIds={[1, 2]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          {/* Ticket Routes */}
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <AllTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <ProtectedRoute>
                <TicketDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-ticket"
            element={
              <ProtectedRoute>
                <CreateTicket />
              </ProtectedRoute>
            }
          />

          {/* Core ITIL Management Pages */}
          <Route
            path="/technicians"
            element={
              <ProtectedRoute allowedRoleIds={[4, 5]}>
                <TechnicianManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sla"
            element={
              <ProtectedRoute allowedRoleIds={[3, 4, 5]}>
                <SLAManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assets"
            element={
              <ProtectedRoute>
                <AssetManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/services"
            element={
              <ProtectedRoute>
                <ServiceCatalog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/problems"
            element={
              <ProtectedRoute>
                <ProblemManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/escalations"
            element={
              <ProtectedRoute>
                <EscalationManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
