import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { TeamItem } from '../../types';
import { Edit, Shield, X, CheckCircle, Info } from 'lucide-react';

export const AdminTeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editingTeam, setEditingTeam] = useState<TeamItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    color: '#800000',
    logo_url: '',
    is_active: true
  });

  const fetchTeams = () => {
    setLoading(true);
    api.getAdminTeams()
      .then(setTeams)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleOpenEdit = (t: TeamItem) => {
    setError(null);
    setEditingTeam(t);
    setFormData({
      name: t.name,
      code: t.code,
      color: t.color,
      logo_url: t.logo_url || '',
      is_active: t.is_active
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
    setError(null);
    try {
      await api.updateTeam(editingTeam.id, formData);
      setSuccess(`House '${formData.name}' insignia updated.`);
      setEditingTeam(null);
      fetchTeams();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 dark:text-white">Inter-House Championship Directory</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Sarala Birla University strictly maintains 4 official houses: <span className="font-semibold text-stone-700 dark:text-stone-200">Vishvesvaraya</span>, <span className="font-semibold text-stone-700 dark:text-stone-200">Chanakya</span>, <span className="font-semibold text-stone-700 dark:text-stone-200">Patanjali</span>, and <span className="font-semibold text-stone-700 dark:text-stone-200">Ramanujan</span>.
          </p>
        </div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-medium border border-stone-200 dark:border-stone-700">
          <Shield size={14} className="text-brand-primary dark:text-amber-400" />
          <span>Strict 4-House Roster</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CheckCircle size={14} />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)}><X size={14} /></button>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-stone-400">
          <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs">Loading official houses...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teams.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-stone-300 dark:hover:border-stone-700 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white font-mono shadow-sm text-sm"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.code}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Official House
                  </span>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">{t.name}</h3>
                  <p className="text-xs font-mono text-stone-500 mt-0.5">Code: {t.code}</p>
                </div>

                <div className="flex items-center space-x-2 text-xs text-stone-500">
                  <div className="w-4 h-4 rounded-full border border-stone-300" style={{ backgroundColor: t.color }}></div>
                  <span className="font-mono text-xs">{t.color}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
                <button
                  onClick={() => handleOpenEdit(t)}
                  className="px-3 py-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium flex items-center space-x-1.5 transition-colors"
                >
                  <Edit size={13} />
                  <span>Customize Insignia</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <h2 className="text-base font-bold font-serif text-stone-900 dark:text-white">
                  Customize House Insignia
                </h2>
                <p className="text-[11px] text-stone-500 mt-0.5">{editingTeam.name} ({editingTeam.code})</p>
              </div>
              <button onClick={() => setEditingTeam(null)} className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="font-semibold uppercase text-[10px] text-stone-500">Official House Name</label>
                <input
                  type="text"
                  disabled
                  value={formData.name}
                  className="w-full p-2.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-600 dark:text-stone-300 cursor-not-allowed font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold uppercase text-[10px] text-stone-500">House Code</label>
                  <input
                    type="text"
                    disabled
                    value={formData.code}
                    className="w-full p-2.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-600 dark:text-stone-300 font-mono cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold uppercase text-[10px] text-stone-500">House Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-10 h-9 p-0.5 rounded border border-stone-300 dark:border-stone-700 cursor-pointer bg-white dark:bg-stone-950"
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase text-[10px] text-stone-500">Logo / Insignia Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white text-xs"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 rounded-lg text-stone-700 dark:text-stone-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-primary text-white font-semibold rounded-lg hover:opacity-95 transition-opacity"
                >
                  Save Insignia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
