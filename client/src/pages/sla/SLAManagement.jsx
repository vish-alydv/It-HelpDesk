import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { Clock, AlertTriangle, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';

export default function SLAManagement() {
  const [slaRecords, setSlaRecords] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordsRes, overdueRes] = await Promise.all([
        api.get('/sla'),
        api.get('/sla/overdue').catch(() => ({ data: { overdue_incidents: [] } }))
      ]);

      if (recordsRes.data?.sla_records) setSlaRecords(recordsRes.data.sla_records);
      if (overdueRes.data?.overdue_incidents) setOverdue(overdueRes.data.overdue_incidents);
    } catch (err) {
      console.error('Error fetching SLA:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SLA & Deadline Monitoring</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Service Level Agreement compliance, overdue incident tracking, and breach resolution
          </p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Overdue Warning Card */}
      {overdue.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3 text-rose-800 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Overdue Incident Watchlist ({overdue.length} Tickets)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {overdue.map((item) => (
              <div key={item.incident_id} className="bg-white p-3.5 rounded-lg border border-rose-200 flex justify-between items-center shadow-sm">
                <div>
                  <Link to={`/tickets/${item.incident_id}`} className="font-mono text-xs font-bold text-rose-700 hover:underline">
                    {item.ticket_number}
                  </Link>
                  <p className="text-xs font-semibold text-slate-900 truncate max-w-xs">{item.subject}</p>
                  <p className="text-[11px] text-rose-600 font-medium mt-0.5">
                    Missed Target: {new Date(item.resolution_due_at).toLocaleString()}
                  </p>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800">
                  OVERDUE
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All SLA Tracking Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="font-semibold text-slate-900 text-sm">Live SLA Tracking Records (MySQL)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">SLA Policy</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Resolution Due</th>
                <th className="py-3 px-4">Resolved At</th>
                <th className="py-3 px-4 text-center">Breach Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {slaRecords.map((r) => {
                const isBreached = r.resolution_breached || (r.status_name !== 'Resolved' && new Date(r.resolution_due_at) < new Date());

                return (
                  <tr key={r.tracking_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600 text-xs">
                      <Link to={`/tickets/${r.incident_id}`} className="hover:underline">
                        {r.ticket_number}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
                      {r.subject}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">{r.sla_name}</td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={r.priority_name} />
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-600">
                      {r.resolution_due_at ? new Date(r.resolution_due_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-600">
                      {r.resolved_at ? new Date(r.resolved_at).toLocaleString() : 'In Progress'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isBreached ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          Breached
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          On Track
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
