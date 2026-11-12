import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './StatusBadge';
import { Menu, Plus, Search } from 'lucide-react';

export function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search */}
        <div className="relative hidden md:block w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets (e.g. INC-1001)..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                navigate(`/tickets?search=${encodeURIComponent(e.target.value.trim())}`);
              }
            }}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick New Ticket Action */}
        <Link
          to="/create-ticket"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Ticket</span>
        </Link>

        {/* Role Pill */}
        <div className="hidden sm:block">
          <RoleBadge role={user?.role_name} />
        </div>

        {/* User Dropdown Preview */}
        <Link
          to="/profile"
          className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-medium flex items-center justify-center text-xs shadow-sm">
            {user?.name?.[0] || 'U'}
          </div>
          <span className="hidden md:inline text-sm font-medium text-slate-700">
            {user?.name || user?.email}
          </span>
        </Link>
      </div>
    </header>
  );
}
