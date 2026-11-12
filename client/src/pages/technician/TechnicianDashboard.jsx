import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { StatCard } from '../../components/StatCard';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { ResolveModal } from '../../components/ResolveModal';
import {
  Ticket,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function TechnicianDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolveTarget, setResolveTarget] = useState(null);

  const fetchAssigned = async () => {
    try {
      setLoading(true);
      const res = await api.get('/incidents');
      if (res.data?.incidents) {
        setIncidents(res.data.incidents);
      }
    } catch (err) {
      console.error('Error fetching technician incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
  }, []);

  const totalAssigned = incidents.length;
  const inProgress = incidents.filter((i) => i.status_name === 'In Progress' || i.status_name === 'Assigned').length;
  const resolved = incidents.filter((i) => i.status_name === 'Resolved' || i.status_name === 'Closed').length;
  const highPriority = incidents.filter((i) => ['High', 'Critical'].includes(i.priority_name)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Technician Workbench</h1>
        <p className="text-sm text-slate-500 mt-1">
          Assigned incident queue, troubleshooting workbench, and resolution status
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned to Me"
          value={totalAssigned}
          icon={Ticket}
          color="indigo"
          subtitle="Total assigned tickets"
        />
        <StatCard
          title="Active / In Progress"
          value={inProgress}
          icon={Clock}
          color="sky"
          subtitle="Currently working"
        />
        <StatCard
          title="High / Critical"
          value={highPriority}
          icon={AlertCircle}
          color="rose"
          subtitle="Priority incidents"
        />
        <StatCard
          title="Resolved by Me"
          value={resolved}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Fixed & verified"
        />
      </div>

      {/* Assigned Incidents Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-semibold text-slate-900 text-sm">My Assigned Incidents</h3>
          <span className="text-xs font-semibold text-slate-500">{incidents.length} Tickets</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Reporter</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No incidents currently assigned to your queue.
                  </td>
                </tr>
              ) : (
                incidents.map((t) => (
                  <tr key={t.incident_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600 text-xs">
                      <Link to={`/tickets/${t.incident_id}`} className="hover:underline">
                        {t.ticket_number}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-medium">
                      <Link to={`/tickets/${t.incident_id}`} className="hover:text-indigo-600">
                        {t.subject}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">{t.reported_by}</td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={t.priority_name} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={t.status_name} />
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {t.status_name !== 'Resolved' && t.status_name !== 'Closed' && (
                        <button
                          onClick={() => setResolveTarget(t)}
                          className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                      <Link
                        to={`/tickets/${t.incident_id}`}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolve Modal */}
      {resolveTarget && (
        <ResolveModal
          isOpen={Boolean(resolveTarget)}
          onClose={() => setResolveTarget(null)}
          incidentId={resolveTarget.incident_id}
          ticketNumber={resolveTarget.ticket_number}
          onResolved={fetchAssigned}
        />
      )}
    </div>
  );
}
