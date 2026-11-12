import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Wrench, CheckCircle, XCircle, Edit, RefreshCw } from 'lucide-react';

export default function TechnicianManagement() {
  const { isAdmin, isManager } = useAuth();
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTech, setEditTech] = useState(null);
  const [formData, setFormData] = useState({ specialization: '', availability_status: 'Available', team_id: 1 });

  const fetchTechs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/technicians');
      if (res.data?.technicians) {
        setTechnicians(res.data.technicians);
      }
    } catch (err) {
      console.error('Error fetching technicians:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechs();
  }, []);

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this technician?')) return;
    try {
      await api.patch(`/technicians/${id}/deactivate`);
      fetchTechs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to deactivate technician.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/technicians/${editTech.technician_id}`, {
        specialization: formData.specialization,
        availability_status: formData.availability_status,
        team_id: Number(formData.team_id)
      });
      setEditTech(null);
      fetchTechs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update technician.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Technician Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View technical support personnel, specialization, availability status, and support teams
          </p>
        </div>
        <button
          onClick={fetchTechs}
          className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Technicians List Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <th className="py-3 px-4">Technician</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Support Team</th>
              <th className="py-3 px-4">Specialization</th>
              <th className="py-3 px-4">Status</th>
              {(isAdmin || isManager) && <th className="py-3 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {technicians.map((t) => (
              <tr key={t.technician_id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    {t.technician_name?.[0] || 'T'}
                  </div>
                  {t.technician_name}
                </td>
                <td className="py-3 px-4 text-slate-600 text-xs font-mono">{t.email}</td>
                <td className="py-3 px-4 text-slate-800 text-xs">{t.team_name || 'General Support'}</td>
                <td className="py-3 px-4 text-slate-600 text-xs">{t.specialization || 'IT Support'}</td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      t.availability_status === 'Available'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${t.availability_status === 'Available' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {t.availability_status}
                  </span>
                </td>
                {(isAdmin || isManager) && (
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditTech(t);
                        setFormData({
                          specialization: t.specialization || '',
                          availability_status: t.availability_status || 'Available',
                          team_id: 1
                        });
                      }}
                      className="p-1 text-slate-500 hover:text-indigo-600"
                      title="Edit Technician"
                    >
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    {t.availability_status === 'Available' && (
                      <button
                        onClick={() => handleDeactivate(t.technician_id)}
                        className="px-2 py-0.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editTech && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-900">Edit Technician ({editTech.technician_name})</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Specialization</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Availability</label>
                <select
                  value={formData.availability_status}
                  onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="Available">Available</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Busy">Busy</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTech(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
