import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout } from './Layout';

export function ProtectedRoute({ children, allowedRoleIds }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading ITSM System...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoleIds && !allowedRoleIds.includes(user.role_id)) {
    const home = (user.role_id === 5 || user.role_id === 4)
      ? '/admin'
      : user.role_id === 3
      ? '/technician'
      : '/employee';
    return <Navigate to={home} replace />;
  }

  return <Layout>{children}</Layout>;
}
