import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Layers, LogIn, Shield, Wrench, UserCheck, AlertCircle, Briefcase } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      if (user.role_id === 5 || user.role_id === 4) navigate('/admin');
      else if (user.role_id === 3) navigate('/technician');
      else navigate('/employee');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          ITSM Helpdesk Core
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          IT Helpdesk & Incident Management System (DBMS Capstone)
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-100">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Corporate Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@helpdesk.com"
                className="w-full text-sm border border-slate-300 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm border border-slate-300 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {submitting ? 'Authenticating...' : 'Sign In to Helpdesk'}
            </button>
          </form>

          {/* Quick Demo Logins for Instant Role Evaluation */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              One-Click Role Switcher (Evaluation)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@helpdesk.com', 'password123')}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 transition-colors"
              >
                <Shield className="w-4 h-4 mb-1 text-purple-600" />
                <span className="text-[11px] font-bold">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('tech@helpdesk.com', 'password123')}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 transition-colors"
              >
                <Wrench className="w-4 h-4 mb-1 text-blue-600" />
                <span className="text-[11px] font-bold">Technician</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('employee@company.com', 'password123')}
                className="flex flex-col items-center justify-center p-2 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors"
              >
                <UserCheck className="w-4 h-4 mb-1 text-emerald-600" />
                <span className="text-[11px] font-bold">Employee</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Need an employee account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Register as Employee
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
