import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Server, Plus, Edit, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function ServiceCatalog() {
  const { isAdmin, isManager } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    service_name: '',
    description: '',
    service_status: 'Operational'
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/services');
      if (res.data?.services) setServices(res.data.services);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await api.put(`/services/${editingService.service_id}`, formData);
      } else {
        await api.post('/services', formData);
      }
      setModalOpen(false);
      setEditingService(null);
      fetchServices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save service.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service from the catalog?')) return;
    try {
      await api.delete(`/services/${id}`);
      fetchServices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete service.');
    }
  };

  const openCreate = () => {
    setEditingService(null);
    setFormData({
      service_name: '',
      description: '',
      service_status: 'Operational'
    });
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditingService(s);
    setFormData({
      service_name: s.service_name,
      description: s.description || '',
      service_status: s.service_status || 'Operational'
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">IT Service Catalog</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Operational business services, support coverage, and health status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchServices}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-600 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {(isAdmin || isManager) && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Service
            </button>
          )}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((s) => (
          <div key={s.service_id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">{s.service_name}</h3>
                  <p className="text-[11px] text-slate-400">{s.team_name || 'Infrastructure Support Team'}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {s.service_status || 'Operational'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {s.description || 'No service description provided.'}
            </p>

            {(isAdmin || isManager) && (
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => openEdit(s)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200"
                >
                  Edit
                </button>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(s.service_id)}
                    className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded border border-rose-200"
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
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-900">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  value={formData.service_name}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                  placeholder="e.g. Single Sign-On (SSO)"
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed scope and purpose of this service..."
                  className="w-full text-sm border border-slate-300 rounded-lg p-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Service Health</label>
                <select
                  value={formData.service_status}
                  onChange={(e) => setFormData({ ...formData, service_status: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
                >
                  <option value="Operational">Operational</option>
                  <option value="Degraded">Degraded Performance</option>
                  <option value="Maintenance">Scheduled Maintenance</option>
                  <option value="Down">Outage / Down</option>
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
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
