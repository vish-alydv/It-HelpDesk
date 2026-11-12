import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/StatCard';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { FeedbackModal } from '../../components/FeedbackModal';
import {
  Ticket,
  PlusCircle,
  CheckCircle2,
  Clock,
  Star,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackTarget, setFeedbackTarget] = useState(null);

  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/incidents');
      if (res.data?.incidents) {
        setIncidents(res.data.incidents);
      }
    } catch (err) {
      console.error('Error fetching employee tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const totalSubmitted = incidents.length;
  const inProgress = incidents.filter((i) => ['New', 'Assigned', 'In Progress', 'Pending Customer'].includes(i.status_name)).length;
  const resolved = incidents.filter((i) => ['Resolved', 'Closed'].includes(i.status_name)).length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-100 text-xs font-semibold backdrop-blur-sm mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Internal Employee Support Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-indigo-100 text-sm mt-1 max-w-xl">
            Need technical assistance, hardware replacement, or access permissions? Submit a ticket and our IT team will assist you.
          </p>
        </div>
        <Link
          to="/create-ticket"
          className="inline-flex items-center gap-2 px-5 py-3 bg-white text-indigo-700 hover:bg-indigo-50 font-semibold text-sm rounded-xl shadow-md transition-all whitespace-nowrap self-start sm:self-auto"
        >
          <PlusCircle className="w-5 h-5 text-indigo-600" />
          Submit Support Ticket
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Submitted"
          value={totalSubmitted}
          icon={Ticket}
          color="indigo"
          subtitle="All tickets filed by you"
        />
        <StatCard
          title="Under Resolution"
          value={inProgress}
          icon={Clock}
          color="amber"
          subtitle="Technicians working"
        />
        <StatCard
          title="Resolved Tickets"
          value={resolved}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Completed requests"
        />
      </div>

      {/* My Submitted Tickets Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-semibold text-slate-900 text-sm">My Support Tickets</h3>
          <span className="text-xs font-semibold text-slate-500">{incidents.length} Tickets</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Ticket Number</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date Submitted</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    You haven't submitted any tickets yet. Click "Submit Support Ticket" above to get help.
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
                      {t.status_name === 'Resolved' && (
                        <button
                          onClick={() => setFeedbackTarget(t)}
                          className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md border border-amber-200 inline-flex items-center gap-1 transition-colors"
                        >
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          Rate Support
                        </button>
                      )}
                      <Link
                        to={`/tickets/${t.incident_id}`}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                      >
                        Track
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feedback Modal */}
      {feedbackTarget && (
        <FeedbackModal
          isOpen={Boolean(feedbackTarget)}
          onClose={() => setFeedbackTarget(null)}
          incidentId={feedbackTarget.incident_id}
          ticketNumber={feedbackTarget.ticket_number}
          onSubmitted={fetchMyTickets}
        />
      )}
    </div>
  );
}
