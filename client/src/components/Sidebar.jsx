import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './StatusBadge';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Wrench,
  Clock,
  Laptop,
  Server,
  AlertTriangle,
  Flame,
  UserCircle,
  LogOut,
  Layers,
  CheckCircle2
} from 'lucide-react';

export function Sidebar({ isOpen, onClose }) {
  const { user, logout, isAdmin, isManager, isTechnician, isEmployee } = useAuth();

  const getDashboardPath = () => {
    if (isAdmin || isManager) return '/admin';
    if (isTechnician) return '/technician';
    return '/employee';
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-indigo-600 text-white shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-lg tracking-tight flex items-center gap-1.5">
              ITSM<span className="text-indigo-600">Core</span>
            </span>
            <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              DBMS Capstone
            </span>
          </div>
        </div>

        {/* User Card Mini */}
        <div className="px-4 py-3 mx-3 my-3 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-200">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {user?.name || user?.email}
              </p>
              <div className="mt-0.5">
                <RoleBadge role={user?.role_name} />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {/* Main Role Dashboard */}
          <NavLink to={getDashboardPath()} end className={navItemClass} onClick={onClose}>
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </NavLink>

          {/* Quick Ticket Create */}
          <NavLink to="/create-ticket" className={navItemClass} onClick={onClose}>
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            Create Ticket
          </NavLink>

          {/* Incidents Queue */}
          <NavLink to="/tickets" className={navItemClass} onClick={onClose}>
            <Ticket className="w-4 h-4" />
            {isEmployee ? 'My Tickets' : 'Incident Queue'}
          </NavLink>

          {/* ITIL Core Management (Admin / Manager) */}
          {(isAdmin || isManager) && (
            <>
              <div className="pt-4 pb-1 px-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Service Management
                </p>
              </div>

              <NavLink to="/sla" className={navItemClass} onClick={onClose}>
                <Clock className="w-4 h-4 text-amber-600" />
                SLA & Overdue Watch
              </NavLink>

              <NavLink to="/technicians" className={navItemClass} onClick={onClose}>
                <Wrench className="w-4 h-4" />
                Technicians
              </NavLink>

              <NavLink to="/assets" className={navItemClass} onClick={onClose}>
                <Laptop className="w-4 h-4" />
                IT Assets
              </NavLink>

              <NavLink to="/services" className={navItemClass} onClick={onClose}>
                <Server className="w-4 h-4" />
                Service Catalog
              </NavLink>

              <NavLink to="/problems" className={navItemClass} onClick={onClose}>
                <AlertTriangle className="w-4 h-4" />
                Problems & Root Cause
              </NavLink>

              <NavLink to="/escalations" className={navItemClass} onClick={onClose}>
                <Flame className="w-4 h-4 text-rose-500" />
                Escalations
              </NavLink>
            </>
          )}

          {/* Technician View */}
          {isTechnician && (
            <>
              <div className="pt-4 pb-1 px-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Operations
                </p>
              </div>

              <NavLink to="/sla" className={navItemClass} onClick={onClose}>
                <Clock className="w-4 h-4" />
                SLA Tracking
              </NavLink>

              <NavLink to="/assets" className={navItemClass} onClick={onClose}>
                <Laptop className="w-4 h-4" />
                Asset Registry
              </NavLink>

              <NavLink to="/problems" className={navItemClass} onClick={onClose}>
                <AlertTriangle className="w-4 h-4" />
                Known Problems
              </NavLink>
            </>
          )}

          {/* Employee General Links */}
          {isEmployee && (
            <>
              <div className="pt-4 pb-1 px-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Services
                </p>
              </div>

              <NavLink to="/services" className={navItemClass} onClick={onClose}>
                <Server className="w-4 h-4" />
                IT Service Catalog
              </NavLink>
            </>
          )}

          {/* General Section */}
          <div className="pt-4 pb-1 px-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Account
            </p>
          </div>

          <NavLink to="/profile" className={navItemClass} onClick={onClose}>
            <UserCircle className="w-4 h-4" />
            Profile Settings
          </NavLink>
        </nav>

        {/* Database Status & Logout */}
        <div className="p-3 border-t border-slate-200 space-y-2">
          <div className="px-3 py-2 bg-slate-50 rounded-lg text-[11px] text-slate-600 border border-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              MySQL & MongoDB Sync
            </span>
            <span className="font-mono text-[10px] text-slate-400">ITSM v1.0</span>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
