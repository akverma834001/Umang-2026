import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { AnnouncementItem } from '../../types';
import { Plus, Edit, Trash2, Bell, AlertTriangle, X } from 'lucide-react';
import { formatISTDateTime } from '../../utils/date';

export const AdminAnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<AnnouncementItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'GENERAL',
    priority: 'MEDIUM',
    image_url: '',
    published_state: 'PUBLISHED'
  });

  const categories = ['IMPORTANT', 'GENERAL', 'SCHEDULE_UPDATE', 'RESULT', 'NOTICE'];
  const priorities = ['HIGH', 'MEDIUM', 'LOW'];

  const fetchAnnouncements = () => {
    setLoading(true);
    api.getAdminAnnouncements()
      .then(setAnnouncements)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenCreate = () => {
    setError(null);
    setFormData({
      title: '',
      description: '',
      category: 'GENERAL',
      priority: 'MEDIUM',
      image_url: '',
      published_state: 'PUBLISHED'
    });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.createAnnouncement(formData);
      setSuccess('Announcement published.');
      setIsCreateOpen(false);
      fetchAnnouncements();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleOpenEdit = (a: AnnouncementItem) => {
    setError(null);
    setEditingAnn(a);
    setFormData({
      title: a.title,
      description: a.description,
      category: a.category,
      priority: a.priority,
      image_url: a.image_url || '',
      published_state: a.published_state
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnn) return;
    setError(null);
    try {
      await api.updateAnnouncement(editingAnn.id, {
        ...formData,
        version: editingAnn.version
      });
      setSuccess('Announcement updated.');
      setEditingAnn(null);
      fetchAnnouncements();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await api.deleteAnnouncement(id);
      setSuccess('Announcement deleted.');
      fetchAnnouncements();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 dark:text-white">Announcement Broadcaster</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Broadcast official notices, urgent schedule revisions, and tournament alerts to students.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-stone-800 text-white text-xs font-semibold flex items-center space-x-2 transition-colors shadow-sm"
        >
          <Plus size={16} />
          <span>Publish Notice</span>
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

      <div className="space-y-4">
        {announcements.map((a) => (
          <div
            key={a.id}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row justify-between sm:items-start gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center space-x-2 text-xs">
                <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                  a.priority === 'HIGH' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                }`}>
                  {a.category.replace('_', ' ')}
                </span>
                <span className="text-stone-400 font-mono text-[11px]">{formatISTDateTime(a.published_at)}</span>
              </div>
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">{a.title}</h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">{a.description}</p>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={() => handleOpenEdit(a)}
                className="p-1.5 rounded text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <Edit size={15} />
              </button>
              <button
                onClick={() => handleDelete(a.id)}
                className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {(isCreateOpen || editingAnn) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-800 pb-3">
              <h2 className="text-lg font-bold font-serif text-stone-900 dark:text-white">
                {isCreateOpen ? 'Broadcast Notice' : `Edit Notice: ${editingAnn?.title}`}
              </h2>
              <button onClick={() => { setIsCreateOpen(false); setEditingAnn(null); }}><X size={18} /></button>
            </div>

            <form onSubmit={isCreateOpen ? handleCreateSubmit : handleEditSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold uppercase text-stone-700 dark:text-stone-300">Notice Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold uppercase text-stone-700 dark:text-stone-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                  >
                    {categories.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold uppercase text-stone-700 dark:text-stone-300">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                  >
                    {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase text-stone-700 dark:text-stone-300">Notice Content</label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase text-stone-700 dark:text-stone-300">Banner Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setIsCreateOpen(false); setEditingAnn(null); }}
                  className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-primary text-white font-semibold rounded-lg"
                >
                  {isCreateOpen ? 'Publish Notice' : 'Update Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
