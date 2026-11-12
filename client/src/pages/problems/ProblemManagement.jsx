import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';

export default function ProblemManagement() {
  const { isAdmin, isManager, isTechnician, isHelpdeskAgent } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [formData, setFormData] = useState({
    problem_title: '',
    description: '',
    root_cause: '',
    problem_status: 'Open'
  });

  const canEdit = isAdmin || isManager || isHelpdeskAgent;

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/problems');
      if (res.data?.problems) setProblems(res.data.problems);
    } catch (err) {
      console.error('Error fetching problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProblem) {
        await api.put(`/problems/${editingProblem.problem_id}`, formData);
      } else {
        await api.post('/problems', formData);
      }
      setModalOpen(false);
      setEditingProblem(null);
      fetchProblems();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save problem.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this problem record?')) return;
    try {
      await api.delete(`/problems/${id}`);
      fetchProblems();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete problem.');
    }
  };

  const openCreate = () => {
    setEditingProblem(null);
    setFormData({
      problem_title: '',
      description: '',
      root_cause: '',
      problem_status: 'Open'
    });
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingProblem(p);
    setFormData({
      problem_title: p.problem_title,
      description: p.description || '',
      root_cause: p.root_cause || '',
      problem_status: p.problem_status || 'Open'
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">ITIL Problem Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Identify recurring incident causes, document workarounds, and manage root fixes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchProblems}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {canEdit && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Problem
            </button>
          )}
        </div>
      </div>

      {/* Problems List */}
      <div className="space-y-4">
        {problems.map((p) => (
          <div key={p.problem_id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-base">{p.problem_title}</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                {p.problem_status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-500 block mb-1">SYMPTOMS & DESCRIPTION</span>
                <p className="text-slate-700 leading-relaxed">{p.description || 'No description provided.'}</p>
              </div>

              <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                <span className="font-bold text-indigo-700 block mb-1">IDENTIFIED ROOT CAUSE</span>
                <p className="text-indigo-950 leading-relaxed font-mono">{p.root_cause || 'Root cause under active investigation.'}</p>
              </div>
            </div>

            {canEdit && (
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => openEdit(p)}
                  className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200"
                >
                  Edit Problem
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(p.problem_id)}
                    className="px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded border border-rose-200"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-900">{editingProblem ? 'Edit Problem' : 'Log New Known Problem'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Problem Title</label>
                <input
                  type="text"
                  required
                  value={formData.problem_title}
                  onChange={(e) => setFormData({ ...formData, problem_title: e.target.value })}
                  placeholder="e.g. Cisco AnyConnect MTU packet drops on Fiber"
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Observed incident symptoms across multiple users..."
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Root Cause & Workaround</label>
                <textarea
                  rows="3"
                  value={formData.root_cause}
                  onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                  placeholder="Technical root diagnosis and temporary workaround..."
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Status</label>
                <select
                  value={formData.problem_status}
                  onChange={(e) => setFormData({ ...formData, problem_status: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="Open">Open</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Workaround Available">Workaround Available</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
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
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Save Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
