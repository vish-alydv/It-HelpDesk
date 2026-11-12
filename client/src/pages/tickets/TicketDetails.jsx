import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { AssignModal } from '../../components/AssignModal';
import { ResolveModal } from '../../components/ResolveModal';
import { FeedbackModal } from '../../components/FeedbackModal';
import { ConversationBox } from '../../components/ConversationBox';
import {
  ArrowLeft,
  Calendar,
  User,
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  History,
  Edit,
  Tag
} from 'lucide-react';

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isManager, isTechnician, isEmployee } = useAuth();

  const [incident, setIncident] = useState(null);
  const [history, setHistory] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [assignOpen, setAssignOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [editStatusOpen, setEditStatusOpen] = useState(false);
  const [newStatusId, setNewStatusId] = useState('1');

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const [incRes, histRes, techRes] = await Promise.all([
        api.get(`/incidents/${id}`),
        api.get(`/incidents/${id}/history`),
        (isAdmin || isManager) ? api.get('/technicians') : Promise.resolve({ data: { technicians: [] } })
      ]);

      if (incRes.data?.incident) {
        setIncident(incRes.data.incident);
        setNewStatusId(String(incRes.data.incident.status_id || '1'));
      }
      if (histRes.data?.history) setHistory(histRes.data.history);
      if (techRes.data?.technicians) setTechnicians(techRes.data.technicians);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve ticket details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/incidents/${id}`, {
        subject: incident.subject,
        description: incident.description,
        priority_id: incident.priority_id,
        status_id: Number(newStatusId)
      });
      setEditStatusOpen(false);
      fetchTicket();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm mt-8">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Incident Not Accessible</h2>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          {error || 'This incident does not exist or you do not have permission to view it.'}
        </p>
        <button
          onClick={() => navigate('/tickets')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          Return to Incident Queue
        </button>
      </div>
    );
  }

  const isClosed = incident.status_name === 'Closed';
  const isResolved = incident.status_name === 'Resolved';

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                {incident.ticket_number}
              </span>
              <StatusBadge status={incident.status_name} />
              <PriorityBadge priority={incident.priority_name} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">{incident.subject}</h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {(isAdmin || isManager) && (
            <button
              onClick={() => setAssignOpen(true)}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              Assign Technician
            </button>
          )}

          {!isEmployee && !isClosed && (
            <button
              onClick={() => setEditStatusOpen(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              Update Status
            </button>
          )}

          {!isEmployee && !isResolved && !isClosed && (
            <button
              onClick={() => setResolveOpen(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Resolve Incident
            </button>
          )}

          {isResolved && (
            <button
              onClick={() => setFeedbackOpen(true)}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              Give Feedback
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Details + Discussion Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Incident Metadata + Audit History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Description Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Description & Report Details
            </h3>
            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
              {incident.description}
            </p>

            {/* Quick Metadata Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Reported By</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  {incident.reported_by}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Category</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  {incident.category_name || 'General IT'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Assigned Technician</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                  {incident.assigned_technician_id ? `Tech #${incident.assigned_technician_id}` : 'Unassigned'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Created Date</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {new Date(incident.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Incident History Timeline (MySQL INCIDENT_HISTORY) */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              <h3 className="font-semibold text-slate-900 text-sm">Incident Audit History (MySQL)</h3>
            </div>
            <div className="p-6">
              {history.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No status transition history recorded yet.</p>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {history.map((h) => (
                    <div key={h.history_id} className="relative">
                      <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white shadow-sm" />
                      <div className="text-xs">
                        <span className="font-semibold text-slate-800">
                          {h.old_status ? `${h.old_status} → ` : ''}{h.new_status}
                        </span>
                        <span className="text-slate-400 ml-2">
                          by {h.changed_by} • {new Date(h.changed_at).toLocaleString()}
                        </span>
                      </div>
                      {h.remarks && (
                        <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                          {h.remarks}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Live MongoDB Activity & Conversation Box */}
        <div>
          <ConversationBox
            incidentId={incident.incident_id}
            ticketNumber={incident.ticket_number}
            isClosed={isClosed}
          />
        </div>
      </div>

      {/* Assign Modal */}
      {assignOpen && (
        <AssignModal
          isOpen={assignOpen}
          onClose={() => setAssignOpen(false)}
          incidentId={incident.incident_id}
          ticketNumber={incident.ticket_number}
          technicians={technicians}
          onAssigned={fetchTicket}
        />
      )}

      {/* Resolve Modal */}
      {resolveOpen && (
        <ResolveModal
          isOpen={resolveOpen}
          onClose={() => setResolveOpen(false)}
          incidentId={incident.incident_id}
          ticketNumber={incident.ticket_number}
          onResolved={fetchTicket}
        />
      )}

      {/* Feedback Modal */}
      {feedbackOpen && (
        <FeedbackModal
          isOpen={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          incidentId={incident.incident_id}
          ticketNumber={incident.ticket_number}
          onSubmitted={fetchTicket}
        />
      )}

      {/* Update Status Modal */}
      {editStatusOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <h3 className="font-semibold text-slate-900">Update Incident Status</h3>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Select Status</label>
              <select
                value={newStatusId}
                onChange={(e) => setNewStatusId(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
              >
                <option value="1">New</option>
                <option value="2">Assigned</option>
                <option value="3">In Progress</option>
                <option value="4">Pending Customer</option>
                <option value="5">Resolved</option>
                <option value="6">Closed</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditStatusOpen(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusUpdate}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
              >
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
