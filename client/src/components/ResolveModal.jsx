import React, { useState } from 'react';
import api from '../api/axios';
import { CheckCircle2, X } from 'lucide-react';

export function ResolveModal({ isOpen, onClose, incidentId, ticketNumber, onResolved }) {
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!details.trim()) {
      setError('Please provide resolution details.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await api.post(`/incidents/${incidentId}/resolve`, {
        resolution_details: details.trim()
      });
      if (res.status === 200) {
        onResolved();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit resolution.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-900">Resolve Incident ({ticketNumber})</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">{error}</div>}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Resolution Details & Corrective Action <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows="4"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
              placeholder="Detail the technical steps taken to diagnose, repair, and resolve this incident..."
              className="w-full text-sm border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
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
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting ? 'Resolving...' : 'Confirm Resolution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
