import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { PlusCircle, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';

export default function CreateTicket() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subject: '',
    category_id: '1',
    priority_id: '2',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.description.trim()) {
      setError('Please provide both ticket subject and detailed description.');
      return;
    }

    setSubmitting(true);
    setError('');

    // Generate ticket number e.g. INC-2026-4819
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `INC-2026-${randomNum}`;

    try {
      const res = await api.post('/incidents', {
        ticket_number: ticketNumber,
        category_id: Number(formData.category_id),
        priority_id: Number(formData.priority_id),
        status_id: 1, // 'New' status
        subject: formData.subject.trim(),
        description: formData.description.trim()
      });

      const incidentId = res.data?.incident_id;

      // Post initial activity note in MongoDB
      if (incidentId) {
        try {
          await api.post('/activities', {
            incident_id: Number(incidentId),
            ticket_number: ticketNumber,
            activity_type: 'Ticket Created',
            performed_by: user.name || user.email,
            description: formData.description.trim(),
            metadata: { priority_id: formData.priority_id }
          });
        } catch (actErr) {
          console.warn('Initial MongoDB activity post note:', actErr);
        }
      }

      navigate(incidentId ? `/tickets/${incidentId}` : '/tickets');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit incident ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Support Ticket</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Submit a new IT service incident or technical assistance request
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
              Incident Subject / Summary <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="subject"
              required
              value={formData.subject}
              onChange={handleChange}
              placeholder="e.g. Cannot connect to corporate VPN from home network"
              className="w-full text-sm border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                Category
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="1">Hardware & Devices</option>
                <option value="2">Software & Applications</option>
                <option value="3">Network & Connectivity</option>
                <option value="4">Access & Authentication</option>
                <option value="5">Email & Collaboration</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
                Urgency / Priority
              </label>
              <select
                name="priority_id"
                value={formData.priority_id}
                onChange={handleChange}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="1">Low — Non-blocking minor inquiry</option>
                <option value="2">Medium — Normal business impact</option>
                <option value="3">High — Severe impairment of core task</option>
                <option value="4">Critical — Complete workflow stoppage / outage</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">
              Detailed Description & Steps to Reproduce <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              rows="6"
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Please provide full details, error codes, affected device, or steps you have already attempted..."
              className="w-full text-sm border border-slate-300 rounded-lg p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Incident Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
