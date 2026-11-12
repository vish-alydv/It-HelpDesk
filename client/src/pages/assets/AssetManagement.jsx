import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Laptop, Plus, Trash2, Edit, RefreshCw } from 'lucide-react';

export default function AssetManagement() {
  const { isAdmin, isManager } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [formData, setFormData] = useState({
    asset_tag: '',
    asset_name: '',
    asset_type: 'Laptop',
    serial_number: '',
    asset_status: 'Active'
  });

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/assets');
      if (res.data?.assets) setAssets(res.data.assets);
    } catch (err) {
      console.error('Error fetching assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAsset) {
        await api.put(`/assets/${editingAsset.asset_id}`, formData);
      } else {
        await api.post('/assets', formData);
      }
      setModalOpen(false);
      setEditingAsset(null);
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save asset.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await api.delete(`/assets/${id}`);
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete asset.');
    }
  };

  const openCreate = () => {
    setEditingAsset(null);
    setFormData({
      asset_tag: `AST-2026-${Math.floor(100 + Math.random() * 900)}`,
      asset_name: '',
      asset_type: 'Laptop',
      serial_number: '',
      asset_status: 'Active'
    });
    setModalOpen(true);
  };

  const openEdit = (a) => {
    setEditingAsset(a);
    setFormData({
      asset_tag: a.asset_tag,
      asset_name: a.asset_name,
      asset_type: a.asset_type,
      serial_number: a.serial_number || '',
      asset_status: a.asset_status
    });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">IT Asset Inventory</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage corporate workstations, laptops, network devices, and peripherals
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchAssets}
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
              Add Asset
            </button>
          )}
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <th className="py-3 px-4">Asset Tag</th>
              <th className="py-3 px-4">Device Name</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Serial Number</th>
              <th className="py-3 px-4">Assigned To</th>
              <th className="py-3 px-4">Status</th>
              {(isAdmin || isManager) && <th className="py-3 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {assets.map((a) => (
              <tr key={a.asset_id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-4 font-mono font-semibold text-indigo-600 text-xs">{a.asset_tag}</td>
                <td className="py-3 px-4 font-medium text-slate-900">{a.asset_name}</td>
                <td className="py-3 px-4 text-slate-600 text-xs">{a.asset_type}</td>
                <td className="py-3 px-4 font-mono text-slate-500 text-xs">{a.serial_number || 'N/A'}</td>
                <td className="py-3 px-4 text-slate-700 text-xs">{a.assigned_user_name || 'Unassigned'}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {a.asset_status}
                  </span>
                </td>
                {(isAdmin || isManager) && (
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => openEdit(a)}
                      className="p-1 text-slate-500 hover:text-indigo-600"
                    >
                      <Edit className="w-4 h-4 inline" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(a.asset_id)}
                        className="p-1 text-slate-500 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-900">{editingAsset ? 'Edit Asset' : 'Add New Asset'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Asset Tag</label>
                <input
                  type="text"
                  required
                  value={formData.asset_tag}
                  onChange={(e) => setFormData({ ...formData, asset_tag: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Asset Name</label>
                <input
                  type="text"
                  required
                  value={formData.asset_name}
                  onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
                  placeholder="e.g. MacBook Pro 16 M3"
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Type</label>
                  <select
                    value={formData.asset_type}
                    onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="Laptop">Laptop</option>
                    <option value="Desktop">Desktop</option>
                    <option value="Server">Server</option>
                    <option value="Network Switch">Network Switch</option>
                    <option value="Printer">Printer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Status</label>
                  <select
                    value={formData.asset_status}
                    onChange={(e) => setFormData({ ...formData, asset_status: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Serial Number</label>
                <input
                  type="text"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 font-mono"
                />
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
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
