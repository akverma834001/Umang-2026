import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { FormItem, EventItem } from '../../types';
import { Plus, Edit, Trash2, ExternalLink, FileSpreadsheet, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatISTDateTime } from '../../utils/date';

export const AdminFormsPage: React.FC = () => {
  const [forms, setForms] = useState<FormItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<FormItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    form_url: '',
    event_id: undefined as number | undefined,
    category: 'Technical',
    status: 'OPEN',
    published_state: 'PUBLISHED',
  });

  const categories = ['Technical', 'Cultural', 'Sports', 'Management', 'Literary', 'General'];

  const fetchForms = () => {
    setLoading(true);
    Promise.all([api.getAdminForms(), api.getAdminEvents()])
      .then(([frms, evs]) => {
        setForms(frms);
        setEvents(evs);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleOpenCreate = () => {
    setError(null);
    setFormData({
      title: '',
      description: '',
      form_url: '',
      event_id: events[0]?.id,
      category: 'Technical',
      status: 'OPEN',
      published_state: 'PUBLISHED',
    });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.createForm(formData);
      setSuccess('Google Form published successfully.');
      setIsCreateOpen(false);
      fetchForms();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleOpenEdit = (f: FormItem) => {
    setError(null);
    setEditingForm(f);
    setFormData({
      title: f.title,
      description: f.description || '',
      form_url: f.form_url,
      event_id: f.event_id,
      category: f.category,
      status: f.status,
      published_state: f.published_state,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingForm) return;
    setError(null);
    try {
      await api.updateForm(editingForm.id, {
        ...formData,
        version: editingForm.version,
      });
      setSuccess('Google Form updated successfully.');
      setEditingForm(null);
      fetchForms();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Permanently remove this registration form link?')) return;
    try {
      await api.deleteForm(id);
      setSuccess('Form link deleted.');
      fetchForms();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 dark:text-white">Google Forms Registration Hub</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Create, publish, and validate secure Google Forms for external participant registrations.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-stone-800 text-white text-xs font-semibold flex items-center space-x-2 transition-colors shadow-sm"
        >
          <Plus size={16} />
          <span>Publish Google Form</span>
        </button>
      </div>

      {/* Alerts */}
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

      {/* Forms Table */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 dark:bg-stone-950 text-xs font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="py-3.5 px-4">Form Title & Category</th>
                <th className="py-3.5 px-4">Associated Event</th>
                <th className="py-3.5 px-4">Destination Link</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">State</th>
                <th className="py-3.5 px-4 text-center">Ver</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {forms.map((f) => (
                <tr key={f.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-serif font-bold text-stone-900 dark:text-white">{f.title}</div>
                    <div className="text-xs text-stone-500">{f.category}</div>
                  </td>
                  <td className="py-4 px-4 text-xs text-stone-600 dark:text-stone-300">
                    {f.event_title || 'General University'}
                  </td>
                  <td className="py-4 px-4 text-xs font-mono text-stone-500 max-w-[200px] truncate">
                    <a href={f.form_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center space-x-1">
                      <span className="truncate">{f.form_url}</span>
                      <ExternalLink size={12} />
                    </a>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase">
                      {f.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 uppercase">
                      {f.published_state}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center font-mono text-xs text-stone-400">
                    v{f.version}
                  </td>
                  <td className="py-4 px-4 text-right space-x-1">
                    <button
                      onClick={() => handleOpenEdit(f)}
                      title="Edit Form"
                      className="p-1.5 rounded text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(f.id)}
                      title="Delete Form"
                      className="p-1.5 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {(isCreateOpen || editingForm) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-800 pb-3">
              <h2 className="text-lg font-bold font-serif text-stone-900 dark:text-white">
                {isCreateOpen ? 'Publish Google Form Link' : `Edit Form: ${editingForm?.title}`}
              </h2>
              <button onClick={() => { setIsCreateOpen(false); setEditingForm(null); }}><X size={18} /></button>
            </div>

            <form onSubmit={isCreateOpen ? handleCreateSubmit : handleEditSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold uppercase text-stone-700 dark:text-stone-300">Form Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. CodeCraft 2026 - Hackathon Entry"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase text-stone-700 dark:text-stone-300">Google Form URL (HTTPS Required)</label>
                <input
                  type="url"
                  required
                  placeholder="https://forms.gle/..."
                  value={formData.form_url}
                  onChange={(e) => setFormData({ ...formData, form_url: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white font-mono"
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
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold uppercase text-stone-700 dark:text-stone-300">Associated Event</label>
                  <select
                    value={formData.event_id || ''}
                    onChange={(e) => setFormData({ ...formData, event_id: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                  >
                    <option value="">None / General</option>
                    {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold uppercase text-stone-700 dark:text-stone-300">Registration Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="OPEN">OPEN</option>
                    <option value="CLOSING_SOON">CLOSING SOON</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold uppercase text-stone-700 dark:text-stone-300">Publication State</label>
                  <select
                    value={formData.published_state}
                    onChange={(e) => setFormData({ ...formData, published_state: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                  >
                    <option value="PUBLISHED">PUBLISHED (Public)</option>
                    <option value="DRAFT">DRAFT (Admin Only)</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase text-stone-700 dark:text-stone-300">Instructions / Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setIsCreateOpen(false); setEditingForm(null); }}
                  className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-brand-primary text-white font-semibold rounded-lg"
                >
                  {isCreateOpen ? 'Publish Form' : 'Update Form'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
