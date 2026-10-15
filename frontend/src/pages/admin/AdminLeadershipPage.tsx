import React, { useEffect, useState, useRef } from 'react';
import { api } from '../../services/api';
import type { LeadershipMember, LeadershipMemberPayload } from '../../types';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Shield,
  Trophy,
  ArrowUpDown,
  Mail,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';

function getInitials(name: string): string {
  const clean = name.replace(/^(Prof\.|Dr\.|Mr\.|Mrs\.|Ms\.|CA|Smt\.)\s*/gi, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'SB';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const AdminLeadershipPage: React.FC = () => {
  const [members, setMembers] = useState<LeadershipMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<LeadershipMember | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState<LeadershipMemberPayload>({
    name: '',
    designation: '',
    category: 'sports',
    bio: '',
    image_url: '',
    display_order: 1,
    is_active: true,
    contact_email: '',
  });

  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMembers = () => {
    setLoading(true);
    api.getAdminLeadership(categoryFilter === 'All' ? undefined : categoryFilter.toLowerCase())
      .then((data) => {
        setMembers(data);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load leadership directory.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMembers();
  }, [categoryFilter]);

  const handleOpenAdd = () => {
    setError(null);
    setSuccess(null);
    setEditingMember(null);
    setFormData({
      name: '',
      designation: '',
      category: categoryFilter === 'executive' ? 'executive' : 'sports',
      bio: '',
      image_url: '',
      display_order: (members.length > 0 ? Math.max(...members.map((m) => m.display_order)) + 1 : 1),
      is_active: true,
      contact_email: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: LeadershipMember) => {
    setError(null);
    setSuccess(null);
    setEditingMember(m);
    setFormData({
      name: m.name,
      designation: m.designation,
      category: m.category,
      bio: m.bio || '',
      image_url: m.image_url || '',
      display_order: m.display_order,
      is_active: m.is_active,
      contact_email: m.contact_email || '',
    });
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);
    try {
      const res = await api.uploadLeadershipImage(file);
      if (res.success && res.image_url) {
        setFormData((prev) => ({ ...prev, image_url: res.image_url }));
        setSuccess('Real photo successfully uploaded!');
      }
    } catch (err: any) {
      setError(err.message || 'Image upload failed. Ensure JPG, PNG, or WEBP under 5MB.');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.name.trim() || !formData.designation.trim()) {
      setError('Official Name and Designation are required.');
      return;
    }

    try {
      if (editingMember) {
        await api.updateAdminLeadership(editingMember.id, formData);
        setSuccess(`Official '${formData.name}' has been successfully updated.`);
      } else {
        await api.createAdminLeadership(formData);
        setSuccess(`Official '${formData.name}' has been successfully added to directory.`);
      }
      setIsModalOpen(false);
      fetchMembers();
    } catch (err: any) {
      setError(err.message || 'Failed to save official.');
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      await api.deleteAdminLeadership(id);
      setSuccess('Official deleted successfully.');
      setDeleteConfirmId(null);
      fetchMembers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete official.');
    }
  };

  const totalOfficials = members.length;
  const executiveCount = members.filter((m) => m.category === 'executive').length;
  const sportsCount = members.filter((m) => m.category === 'sports').length;
  const withRealPhotos = members.filter((m) => Boolean(m.image_url)).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 dark:text-white flex items-center space-x-2.5">
            <Users className="text-brand-primary dark:text-amber-400" size={26} />
            <span>Leadership & Sports Incharges Management</span>
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Configure Sarala Birla University Patrons, Director General, and all Sports Incharges displayed on the public About portal.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs"
          >
            <Plus size={16} />
            <span>Add New Official</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="hover:opacity-75">
            <X size={14} />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess(null)} className="hover:opacity-75">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            Total Officials
          </span>
          <p className="text-2xl font-bold font-serif text-stone-900 dark:text-white mt-1">
            {totalOfficials}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center space-x-1">
            <Shield size={12} />
            <span>Executive & DG</span>
          </span>
          <p className="text-2xl font-bold font-serif text-amber-600 dark:text-amber-400 mt-1">
            {executiveCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
            <Trophy size={12} />
            <span>Sports Incharges</span>
          </span>
          <p className="text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400 mt-1">
            {sportsCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center space-x-1">
            <ImageIcon size={12} />
            <span>Real Photos Active</span>
          </span>
          <p className="text-2xl font-bold font-serif text-blue-600 dark:text-blue-400 mt-1">
            {withRealPhotos} / {totalOfficials}
          </p>
        </div>
      </div>

      {/* Filter and Tab Bar */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
        <div className="flex items-center space-x-2">
          {['All', 'Executive', 'Sports'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                categoryFilter.toLowerCase() === cat.toLowerCase()
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {cat === 'All' ? 'All Personnel' : cat === 'Executive' ? 'Patrons & Executive' : 'Sports Committee'}
            </button>
          ))}
        </div>

        <span className="text-xs text-stone-500 font-mono">
          Showing {members.length} members
        </span>
      </div>

      {/* Officials List / Grid */}
      {loading ? (
        <div className="text-center py-16 text-stone-500 text-xs">
          Loading leadership & sports incharges...
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-3xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
          <Users size={32} className="mx-auto text-stone-400" />
          <h3 className="font-serif font-bold text-stone-800 dark:text-stone-200 text-sm">
            No officials found for this filter
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Click "Add New Official" above to add university patrons, Director General, or Sports Incharges.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-400/40 transition-colors"
            >
              <div className="space-y-3">
                {/* Header row: Order, Category, Status */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                    #{m.display_order}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider text-[10px] ${
                        m.category === 'executive'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {m.category === 'executive' ? 'Executive' : 'Sports'}
                    </span>
                    {!m.is_active && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 text-[10px] font-semibold">
                        Hidden
                      </span>
                    )}
                  </div>
                </div>

                {/* Profile row: Photo + Details */}
                <div className="flex items-start space-x-3.5">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shrink-0 flex items-center justify-center">
                    {m.image_url ? (
                      <img
                        src={m.image_url}
                        alt={m.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full items-center justify-center font-serif font-bold text-base text-stone-600 dark:text-stone-300 bg-stone-200 dark:bg-stone-800 ${
                        m.image_url ? 'hidden' : 'flex'
                      }`}
                    >
                      {getInitials(m.name)}
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="font-serif font-bold text-stone-900 dark:text-white text-sm leading-snug truncate">
                      {m.name}
                    </h3>
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 leading-tight">
                      {m.designation}
                    </p>
                    {m.contact_email && (
                      <p className="text-[11px] text-stone-400 truncate font-mono">
                        {m.contact_email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {m.bio && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-3 leading-relaxed">
                    {m.bio}
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
                <span className="text-[10px] text-stone-400 font-mono">
                  {m.image_url ? 'Real Photo Active' : 'No Photo (Monogram)'}
                </span>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleOpenEdit(m)}
                    className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    title="Edit Official"
                  >
                    <Edit2 size={14} />
                  </button>

                  <button
                    onClick={() => setDeleteConfirmId(m.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="Delete Official"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Official Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-white flex items-center space-x-2">
                <Users className="text-brand-primary dark:text-amber-400" size={20} />
                <span>{editingMember ? 'Edit Official Information' : 'Add New Official'}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Official Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Full Name & Salutation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Prof. (Dr.) Gopal Pathak"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Designation */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Official Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Hon'ble Director General"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Category */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="executive">Patron / Executive Leadership</option>
                    <option value="sports">Sports Incharge / Committee</option>
                  </select>
                </div>

                {/* Display Order */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                {/* Contact Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contact_email || ''}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="official@sbu.ac.in"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Real Photo Upload & URL */}
              <div className="space-y-2 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200">
                    Official Portrait / Real Photo
                  </label>
                  {formData.image_url && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                      className="text-[11px] text-red-500 hover:underline"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  {/* Photo Preview */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 shrink-0 flex items-center justify-center">
                    {formData.image_url ? (
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <span className="font-serif font-bold text-sm text-stone-400">
                        {formData.name ? getInitials(formData.name) : 'Photo'}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      className="hidden"
                    />

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-100 text-xs font-semibold hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
                      >
                        <Upload size={13} />
                        <span>{uploadingImage ? 'Uploading Real Photo...' : 'Upload Real Photo File'}</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      value={formData.image_url || ''}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="Or specify image path (e.g. /images/leadership/gopal_pathak.png)"
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[11px] text-stone-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bio / Guidance */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Leadership Bio & Athletic Responsibilities
                </label>
                <textarea
                  rows={3}
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Outline key academic achievements, administrative leadership, and their oversight in the UMANG sports tournament..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="is_active_toggle"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded-md border-stone-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="is_active_toggle" className="text-xs text-stone-700 dark:text-stone-300">
                  Visible in public directory & About page
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-semibold hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-stone-800 transition-colors shadow-xs"
                >
                  {editingMember ? 'Save Changes' : 'Create Official'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 mx-auto flex items-center justify-center">
              <Trash2 size={24} />
            </div>
            <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">
              Remove Official from Directory?
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              This action will remove the official from public leadership listings and sports incharge rosters.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-semibold hover:bg-stone-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
