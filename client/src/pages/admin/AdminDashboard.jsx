import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { StatCard } from '../../components/StatCard';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { AssignModal } from '../../components/AssignModal';
import {
  Ticket,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Laptop,
  Server,
  ArrowRight
} from 'lucide-react';

export default function AdminDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incRes, techRes, overdueRes] = await Promise.all([
        api.get('/incidents'),
        api.get('/technicians'),
        api.get('/sla/overdue')
      ]);

      if (incRes.data?.incidents) setIncidents(incRes.data.incidents);
      if (techRes.data?.technicians) setTechnicians(techRes.data.technicians);
      if (overdueRes.data?.overdue_incidents) setOverdue(overdueRes.data.overdue_incidents);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalCount = incidents.length;
  const openCount = incidents.filter((i) => ['New', 'Assigned', 'In Progress'].includes(i.status_name)).length;
  const resolvedCount = incidents.filter((i) => ['Resolved', 'Closed'].includes(i.status_name)).length;
  const overdueCount = overdue.length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Central Command</h1>
          <p className="text-sm text-slate-500 mt-1">
            Global IT Helpdesk overview, incident workload, and SLA compliance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/create-ticket"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            + Create Incident
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Incidents"
          value={totalCount}
          icon={Ticket}
          color="indigo"
          subtitle="All recorded tickets"
        />
        <StatCard
          title="Active / Open"
          value={openCount}
          icon={Clock}
          color="amber"
          subtitle="Under investigation"
        />
        <StatCard
          title="Resolved Tickets"
          value={resolvedCount}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Successfully closed"
        />
        <StatCard
          title="SLA Overdue"
          value={overdueCount}
          icon={AlertTriangle}
          color="rose"
          subtitle="Breached deadline"
        />
      </div>

      {/* Overdue SLA Alert Banner */}
      {overdue.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-2 font-bold text-rose-800 text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              {overdue.length} Incident(s) Past Target Resolution SLA
            </span>
            <Link to="/sla" className="text-xs font-semibold text-rose-700 hover:underline flex items-center gap-1">
              View SLA Watch <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-1.5">
            {overdue.slice(0, 3).map((item) => (
              <div key={item.incident_id} className="text-xs text-rose-900 flex justify-between bg-white/60 px-3 py-1.5 rounded-lg border border-rose-100">
                <span className="font-semibold">{item.ticket_number} - {item.subject}</span>
                <span className="text-rose-600 font-medium">Due: {new Date(item.resolution_due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Grid: Recent Incidents & Technicians Load */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Incidents Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-semibold text-slate-900 text-sm">Active Incident Queue</h3>
            <Link to="/tickets" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {incidents.slice(0, 6).map((ticket) => (
                  <tr key={ticket.incident_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600 text-xs">
                      <Link to={`/tickets/${ticket.incident_id}`} className="hover:underline">
                        {ticket.ticket_number}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium truncate max-w-[200px]">
                      {ticket.subject}
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={ticket.priority_name} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={ticket.status_name} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedIncident(ticket)}
                        className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 transition-colors"
                      >
                        Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Support Technicians Availability */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-semibold text-slate-900 text-sm">Technician Workload</h3>
            <Link to="/technicians" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto">
            {technicians.map((tech) => (
              <div key={tech.technician_id} className="p-3 border border-slate-200 rounded-xl bg-slate-50/40">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 text-sm">{tech.technician_name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${tech.availability_status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                    {tech.availability_status}
                  </span>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {tech.team_name || 'General Support'} • {tech.specialization}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {selectedIncident && (
        <AssignModal
          isOpen={Boolean(selectedIncident)}
          onClose={() => setSelectedIncident(null)}
          incidentId={selectedIncident.incident_id}
          ticketNumber={selectedIncident.ticket_number}
          technicians={technicians}
          onAssigned={fetchData}
        />
      )}
    </div>
  );
}
