import React from 'react';

export function StatCard({ title, value, icon: Icon, color = 'indigo', subtitle, trend }) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    sky: 'bg-sky-50 text-sky-600 border-sky-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100'
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{value !== undefined ? value : '-'}</p>
        </div>
        <div className={`p-3 rounded-xl border ${colorMap[color] || colorMap.indigo}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>{subtitle}</span>
          {trend && <span className="font-medium text-emerald-600">{trend}</span>}
        </div>
      )}
    </div>
  );
}
