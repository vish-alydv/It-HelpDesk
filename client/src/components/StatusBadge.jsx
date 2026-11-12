import React from 'react';

export function StatusBadge({ status }) {
  const getStyle = (name) => {
    switch (name?.toLowerCase()) {
      case 'new':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'assigned':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'in progress':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'pending':
      case 'pending customer':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'closed':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle(
        status
      )}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
      {status || 'Unknown'}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const getStyle = (name) => {
    switch (name?.toLowerCase()) {
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'high':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${getStyle(priority)}`}>
      {priority || 'Medium'}
    </span>
  );
}

export function RoleBadge({ role }) {
  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
  if (role === 'Administrator' || role === 'Admin') badgeColor = 'bg-purple-100 text-purple-800 border-purple-200';
  if (role === 'IT Manager') badgeColor = 'bg-indigo-100 text-indigo-800 border-indigo-200';
  if (role === 'Technician') badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
  if (role === 'Helpdesk Agent') badgeColor = 'bg-cyan-100 text-cyan-800 border-cyan-200';
  if (role === 'Employee') badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';

  return (
    <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${badgeColor}`}>
      {role || 'User'}
    </span>
  );
}
