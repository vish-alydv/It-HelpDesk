import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { AssignModal } from '../../components/AssignModal';
import { ResolveModal } from '../../components/ResolveModal';
import {
  Search,
  Filter,
  PlusCircle,
  RefreshCw,
  Ticket,
  ChevronRight
} from 'lucide-react';

export default function AllTickets() {
  const { user, isAdmin, isManager, isTechnician, isEmployee } = useAuth();
  const location = useLocation();

  const [incidents, setIncidents] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const [assignIncident, setAssignIncident] = useState(null);
  const [resolveIncident, setResolveIncident] = useState(null);

  // Read search param from URL if any
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    if (q) setSearch(q);
  }, [location.search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incRes, techRes] = await Promise.all([
        api.get('/incidents'),
        (isAdmin || isManager) ? api.get('/technicians') : Promise.resolve({ data: { technicians: [] } })
      ]);

      if (incRes.data?.incidents) setIncidents(incRes.data.incidents);
      if (techRes.data?.technicians) setTechnicians(techRes.data.technicians);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredIncidents = incidents.filter((item) => {
    const matchSearch =
      !search ||
      item.ticket_number?.toLowerCase().includes(search.toLowerCase()) ||
      item.subject?.toLowerCase().includes(search.toLowerCase()) ||
      item.reported_by?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === 'All' || item.status_name === statusFilter;
    const matchPriority = priorityFilter === 'All' || item.priority_name === priorityFilter;

    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <div className="space-y-6">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isEmployee ? 'My Support Tickets' : 'Incident Management Queue'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isEmployee
              ? 'Track real-time progress and resolutions for your tickets'
              : 'Complete IT helpdesk incident queue with status, priority, and assignment tracking'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600 transition-colors shadow-sm"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/create-ticket"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            New Ticket
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ticket #, subject, or reporter..."
            className="w-full text-sm border border-slate-200 rounded-lg pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending Customer">Pending Customer</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Reported By</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      Loading incidents...
                    </div>
                  </td>
                </tr>
              ) : filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No tickets found matching your query criteria.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((t) => (
                  <tr key={t.incident_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600 text-xs">
                      <Link to={`/tickets/${t.incident_id}`} className="hover:underline">
                        {t.ticket_number}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate">
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
                      {(isAdmin || isManager) && (
                        <button
                          onClick={() => setAssignIncident(t)}
                          className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 transition-colors"
                        >
                          Assign
                        </button>
                      )}

                      {isTechnician && t.status_name !== 'Resolved' && t.status_name !== 'Closed' && (
                        <button
                          onClick={() => setResolveIncident(t)}
                          className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
                        >
                          Resolve
                        </button>
                      )}

                      <Link
                        to={`/tickets/${t.incident_id}`}
                        className="p-1 text-slate-400 hover:text-slate-600 inline-flex items-center"
                        title="View details"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {assignIncident && (
        <AssignModal
          isOpen={Boolean(assignIncident)}
          onClose={() => setAssignIncident(null)}
          incidentId={assignIncident.incident_id}
          ticketNumber={assignIncident.ticket_number}
          technicians={technicians}
          onAssigned={fetchData}
        />
      )}

      {/* Resolve Modal */}
      {resolveIncident && (
        <ResolveModal
          isOpen={Boolean(resolveIncident)}
          onClose={() => setResolveIncident(null)}
          incidentId={resolveIncident.incident_id}
          ticketNumber={resolveIncident.ticket_number}
          onResolved={fetchData}
        />
      )}
    </div>
  );
}
