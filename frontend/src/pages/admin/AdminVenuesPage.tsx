import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { VenueItem } from '../../types';
import { Plus, Edit, MapPin, Users, ExternalLink, X } from 'lucide-react';

export const AdminVenuesPage: React.FC = () => {
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<VenueItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    capacity: 200,
    image_url: '',
    map_url: '',
    is_active: true
  });

  const fetchVenues = () => {
    setLoading(true);
    api.getAdminVenues()
      .then(setVenues)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleOpenCreate = () => {
    setError(null);
    setFormData({
      name: '',
      description: '',
      location: '',
      capacity: 200,
      image_url: '',
      map_url: '',
      is_active: true
    });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.createVenue(formData);
      setSuccess(`Venue '${formData.name}' created.`);
      setIsCreateOpen(false);
      fetchVenues();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleOpenEdit = (v: VenueItem) => {
    setError(null);
    setEditingVenue(v);
    setFormData({
      name: v.name,
      description: v.description || '',
      location: v.location,
      capacity: v.capacity,
      image_url: v.image_url || '',
      map_url: v.map_url || '',
      is_active: v.is_active
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVenue) return;
    setError(null);
    try {
      await api.updateVenue(editingVenue.id, formData);
      setSuccess(`Venue '${formData.name}' updated.`);
      setEditingVenue(null);
      fetchVenues();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 dark:text-white">Campus Venues Management</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Configure campus auditoriums, computer labs, and arenas for conflict-free timetable scheduling.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-stone-800 text-white text-xs font-semibold flex items-center space-x-2 transition-colors shadow-sm"
        >
          <Plus size={16} />
          <span>Add Campus Venue</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex justify-between items-center">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}><X size={14} /></button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map((v) => (
          <div
            key={v.id}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">{v.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800">
                  Cap: {v.capacity}
                </span>
              </div>
              <p className="text-xs text-stone-500 flex items-center space-x-1">
                <MapPin size={13} className="text-stone-400 flex-shrink-0" />
                <span>{v.location}</span>
              </p>
              {v.description && (
                <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 pt-1">{v.description}</p>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
              <button
                onClick={() => handleOpenEdit(v)}
                className="p-1.5 rounded text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs flex items-center space-x-1"
              >
                <Edit size={14} />
                <span>Edit Venue</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {(isCreateOpen || editingVenue) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-800 pb-3">
              <h2 className="text-lg font-bold font-serif text-stone-900 dark:text-white">
                {isCreateOpen ? 'Create Campus Venue' : `Edit Venue: ${editingVenue?.name}`}
              </h2>
              <button onClick={() => { setIsCreateOpen(false); setEditingVenue(null); }}><X size={18} /></button>
            </div>

            <form onSubmit={isCreateOpen ? handleCreateSubmit : handleEditSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold uppercase text-stone-700 dark:text-stone-300">Venue Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Birla Central Auditorium"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold uppercase text-stone-700 dark:text-stone-300">Campus Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Block, Ground Floor"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold uppercase text-stone-700 dark:text-stone-300">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase text-stone-700 dark:text-stone-300">Google Maps URL (HTTPS)</label>
                <input
                  type="url"
                  placeholder="https://maps.google.com/..."
                  value={formData.map_url}
                  onChange={(e) => setFormData({ ...formData, map_url: e.target.value })}
                  className="w-full p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase text-stone-700 dark:text-stone-300">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setIsCreateOpen(false); setEditingVenue(null); }}
                  className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-primary text-white font-semibold rounded-lg"
                >
                  {isCreateOpen ? 'Save Venue' : 'Update Venue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
