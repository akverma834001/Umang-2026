import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { SportItem, VenueItem } from '../../types';
import {
  Flame,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  X,
  MapPin,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const AdminSportsPage: React.FC = () => {
  const [sports, setSports] = useState<SportItem[]>([]);
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<SportItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Outdoor Team',
    gender: 'Boys',
    sport_type: 'Match-based',
    venue_id: '' as number | '',
    status: 'Upcoming',
    description: '',
    banner_url: '',
    rules: '',
    scoring_format: 'Points',
    registration_form_url: '',
  });

  const categories = [
    'Outdoor Team',
    'Indoor Racket',
    'Athletics & Track',
    'Athletics & Field',
    'Traditional',
    'Indoor Mind Sports'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [spData, vData] = await Promise.all([
        api.getAdminSports(),
        api.getVenues()
      ]);
      setSports(spData);
      setVenues(vData);
    } catch (err: any) {
      setError(err.message || 'Failed to load sports.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (sport?: SportItem) => {
    setError(null);
    setSuccess(null);
    if (sport) {
      setEditingSport(sport);
      setFormData({
        name: sport.name,
        category: sport.category,
        gender: sport.gender,
        sport_type: sport.sport_type,
        venue_id: sport.venue_id || '',
        status: sport.status,
        description: sport.description || '',
        banner_url: sport.banner_url || '',
        rules: sport.rules || '',
        scoring_format: sport.scoring_format,
        registration_form_url: sport.registration_form_url || '',
      });
    } else {
      setEditingSport(null);
      setFormData({
        name: '',
        category: 'Outdoor Team',
        gender: 'Boys',
        sport_type: 'Match-based',
        venue_id: venues[0]?.id || '',
        status: 'Upcoming',
        description: '',
        banner_url: '',
        rules: '',
        scoring_format: 'Points',
        registration_form_url: '',
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        ...formData,
        venue_id: formData.venue_id ? Number(formData.venue_id) : null,
      };

      if (editingSport) {
        await api.updateAdminSport(editingSport.id, {
          ...payload,
          version: editingSport.version,
        });
        setSuccess(`Sport '${payload.name}' updated successfully.`);
      } else {
        await api.createAdminSport(payload);
        setSuccess(`Sport '${payload.name}' created successfully.`);
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Error saving sport discipline.');
    }
  };

  const handleDelete = async (sport: SportItem) => {
    if (!window.confirm(`Are you sure you want to delete or archive '${sport.name}'?`)) return;
    try {
      await api.deleteAdminSport(sport.id);
      setSuccess(`Sport '${sport.name}' removed or archived.`);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to remove sport.');
    }
  };

  const filtered = sports.filter((sp) =>
    sp.name.toLowerCase().includes(search.toLowerCase()) ||
    sp.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 dark:border-stone-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 dark:text-white flex items-center space-x-2">
            <Flame className="text-amber-500" size={24} />
            <span>Sports Disciplines Manager</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Configure sports catalog, rules, scoring formats, and designated SBU sports facilities.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-stone-800 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
        >
          <Plus size={15} />
          <span>Add New Sport</span>
        </button>
      </div>

      {/* Feedback Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs text-red-700 dark:text-red-300 flex items-center space-x-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-700 dark:text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center">
        <Search size={16} className="text-stone-400 mr-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter sports by name or category..."
          className="w-full text-xs bg-transparent text-stone-900 dark:text-white focus:outline-none"
        />
      </div>

      {/* Sports Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/50 text-stone-500 border-b border-stone-200 dark:border-stone-800 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Sport Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Division</th>
                <th className="p-4">Type</th>
                <th className="p-4">Scoring Format</th>
                <th className="p-4">Venue</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-500">
                    Loading sports disciplines...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-500">
                    No sports found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((sp) => (
                  <tr key={sp.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="p-4 font-bold text-stone-900 dark:text-white flex items-center space-x-2">
                      <span>{sp.name}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                        {sp.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-amber-600 dark:text-amber-400">{sp.gender}</span>
                    </td>
                    <td className="p-4 text-stone-500">{sp.sport_type}</td>
                    <td className="p-4 font-mono font-medium">{sp.scoring_format}</td>
                    <td className="p-4 text-stone-500">{sp.venue?.name || 'Unassigned'}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(sp)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                        title="Edit Sport"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(sp)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Delete / Archive Sport"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 max-w-xl w-full rounded-3xl p-6 sm:p-8 space-y-5 border border-stone-200 dark:border-stone-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-4">
              <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                {editingSport ? 'Edit Sport Discipline' : 'Add New Sport'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-900 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Sport Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Basketball (Boys)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 dark:text-stone-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 dark:text-stone-300">Division (Gender)</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                  >
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 dark:text-stone-300">Sport Type</label>
                  <select
                    value={formData.sport_type}
                    onChange={(e) => setFormData({ ...formData, sport_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                  >
                    <option value="Match-based">Match-based (Head-to-head)</option>
                    <option value="Individual">Individual Competition</option>
                    <option value="Time-based">Time-based (Track Sprints)</option>
                    <option value="Distance-based">Distance-based (Shot Put)</option>
                    <option value="Position-based">Position-based (Leaderboard)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700 dark:text-stone-300">Scoring Format</label>
                  <input
                    type="text"
                    value={formData.scoring_format}
                    onChange={(e) => setFormData({ ...formData, scoring_format: e.target.value })}
                    placeholder="e.g. Points, Goals, Runs/Wickets, Time (s)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Default Venue</label>
                <select
                  value={formData.venue_id}
                  onChange={(e) => setFormData({ ...formData, venue_id: e.target.value ? Number(e.target.value) : '' })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                >
                  <option value="">-- Select Venue --</option>
                  {venues.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short tournament summary..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Rules & Regulations</label>
                <textarea
                  rows={3}
                  value={formData.rules}
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  placeholder="Eligibility criteria, team sizes, equipment guidelines..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300">Google Registration Form URL (Optional)</label>
                <input
                  type="url"
                  value={formData.registration_form_url}
                  onChange={(e) => setFormData({ ...formData, registration_form_url: e.target.value })}
                  placeholder="https://forms.gle/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-primary text-white font-semibold hover:bg-stone-800 transition-colors"
                >
                  {editingSport ? 'Save Changes' : 'Create Sport'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
