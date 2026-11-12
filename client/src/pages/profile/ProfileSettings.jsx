import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../../components/StatusBadge';
import { User, Mail, Shield, CheckCircle2, Lock } from 'lucide-react';

export default function ProfileSettings() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get('/auth/profile');
        if (res.data?.user) setProfile(res.data.user);
      } catch (err) {
        console.warn('Profile fetch warning:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Your authenticated session, assigned IT role, and organizational credentials
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
        {/* User Card */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-bold flex items-center justify-center text-2xl shadow-md shadow-indigo-500/20">
            {user?.name?.[0] || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name || user?.email}</h2>
            <p className="text-sm text-slate-500 font-mono">{user?.email}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <RoleBadge role={user?.role_name} />
              <span className="text-xs text-slate-400">User ID #{user?.user_id}</span>
            </div>
          </div>
        </div>

        {/* Profile Info Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">System Role & Permissions</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Assigned Role ID</span>
              <p className="text-base font-bold text-slate-900">Tier {user?.role_id} ({user?.role_name})</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-slate-400 font-medium">Session Status</span>
              <p className="text-base font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Active Verified Token
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
            <p className="font-semibold mb-1">Role Access Summary:</p>
            {user?.role_id === 5 && 'You have full Administrator privileges (role 5): managing users, technicians, SLA policies, assets, services, problem root causes, and incident queues.'}
            {user?.role_id === 4 && 'You have IT Manager privileges (role 4): assigning technicians, overseeing overdue SLAs, and managing catalog services and assets.'}
            {user?.role_id === 3 && 'You have Technician privileges (role 3): investigating assigned tickets, recording resolutions, resolving incidents, and communicating with users.'}
            {user?.role_id === 2 && 'You have Helpdesk Agent privileges (role 2): triaging incoming user requests and creating problem records.'}
            {user?.role_id === 1 && 'You have Employee privileges (role 1): submitting technical tickets, tracking resolutions, replying in discussion threads, and submitting service feedback.'}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
          <span className="text-xs text-slate-400">IT Helpdesk & Incident Management System</span>
          <button
            onClick={logout}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
