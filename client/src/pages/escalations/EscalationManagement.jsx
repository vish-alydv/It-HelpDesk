import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Flame, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';

export default function EscalationManagement() {
  const { user, isAdmin, isManager, isTechnician, isHelpdeskAgent } = useAuth();
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEsc, setEditingEsc] = useState(null);
  const [formData, setFormData] = useState({
    incident_id: '',
    escalation_level: '2',
    reason: '',
    status: 'Pending'
  });

  const fetchEscalations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/escalations');
      if (res.data?.escalations) setEscalations(res.data.escalations);
    } catch (err) {
      console.error('Error fetching escalations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEsc) {
        await api.put(`/escalations/${editingEsc.escalation_id}`, {
          escalation_level: Number(formData.escalation_level),
          reason: formData.reason,
          status: formData.status
        });
      } else {
        await api.post('/escalations', {
          incident_id: Number(formData.incident_id),
          escalation_level: Number(formData.escalation_level),
          reason: formData.reason,
          status: formData.status
        });
      }
      setModalOpen(false);
      setEditingEsc(null);
      fetchEscalations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save escalation.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this escalation?')) return;
    try {
      await api.delete(`/escalations/${id}`);
      fetchEscalations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete escalation.');
    }
  };

  const openCreate = () => {
    setEditingEsc(null);
    setFormData({
      incident_id: '',
      escalation_level: '2',
      reason: '',
      status: 'Pending'
    });
    setModalOpen(true);
  };

  const openEdit = (e) => {
    setEditingEsc(e);
    setFormData({
      incident_id: e.incident_id,
      escalation_level: String(e.escalation_level || '2'),
      reason: e.reason || '',
      status: e.status || 'Pending'
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Incident Escalations</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track urgent incidents escalated to Tier 2, Tier 3, or specialized engineering teams
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchEscalations}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {!user.isEmployee && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Escalation
            </button>
          )}
        </div>
      </div>

      {/* Escalations Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <th className="py-3 px-4">Ticket</th>
              <th className="py-3 px-4">Escalation Tier</th>
              <th className="py-3 px-4">Escalated By</th>
              <th className="py-3 px-4">Reason / Justification</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {escalations.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400">
                  No active incident escalations logged.
                </td>
              </tr>
            ) : (
              escalations.map((e) => (
                <tr key={e.escalation_id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-rose-600 text-xs">
                    <Link to={`/tickets/${e.incident_id}`} className="hover:underline">
                      {e.ticket_number || `Incident #${e.incident_id}`}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900 text-xs">
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                      Tier {e.escalation_level}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 text-xs">{e.escalated_by_name || 'Staff'}</td>
                  <td className="py-3 px-4 text-slate-800 text-xs max-w-xs truncate">{e.reason}</td>
                  <td className="py-3 px-4 text-slate-500 text-xs">
                    {new Date(e.escalated_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        e.status === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => openEdit(e)}
                      className="p-1 text-slate-500 hover:text-indigo-600"
                    >
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(e.escalation_id)}
                        className="p-1 text-slate-500 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-900">{editingEsc ? 'Update Escalation' : 'Log New Escalation'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingEsc && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Incident ID (Numeric)</label>
                  <input
                    type="number"
                    required
                    value={formData.incident_id}
                    onChange={(e) => setFormData({ ...formData, incident_id: e.target.value })}
                    placeholder="e.g. 1"
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Escalation Tier Level (1-3)</label>
                <select
                  value={formData.escalation_level}
                  onChange={(e) => setFormData({ ...formData, escalation_level: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="1">Tier 1 — Senior Helpdesk Support</option>
                  <option value="2">Tier 2 — Systems & Network Specialists</option>
                  <option value="3">Tier 3 — Principal Engineering / Architecture</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Reason for Escalation</label>
                <textarea
                  rows="3"
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Detail why standard troubleshooting is insufficient and what higher tier skills are needed..."
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="Pending">Pending Review</option>
                  <option value="In Progress">In Progress (Senior Review)</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
                >
                  Save Escalation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
