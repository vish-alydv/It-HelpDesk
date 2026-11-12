import React, { useState } from 'react';
import api from '../api/axios';
import { UserCheck, X } from 'lucide-react';

export function AssignModal({ isOpen, onClose, incidentId, ticketNumber, technicians, onAssigned }) {
  const [selectedTech, setSelectedTech] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTech) {
      setError('Please select a technician.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await api.patch(`/incidents/${incidentId}/assign`, {
        technician_id: Number(selectedTech)
      });
      if (res.status === 200) {
        onAssigned();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign technician.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-slate-900">Assign Incident ({ticketNumber})</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">{error}</div>}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Select Available Technician
            </label>
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              required
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">-- Choose Support Engineer --</option>
              {technicians.map((t) => (
                <option key={t.technician_id} value={t.technician_id}>
                  {t.technician_name} — {t.team_name || 'General'} ({t.specialization || 'Support'} | {t.availability_status})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
