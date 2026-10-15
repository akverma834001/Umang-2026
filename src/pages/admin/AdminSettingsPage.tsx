import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { WebsiteSettings } from '../../types';
import { Palette, Building2, Calendar, Share2, FileText, CheckCircle, AlertCircle, X, RefreshCw } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { settings, refreshSettings } = useSettings();
  const [formData, setFormData] = useState<WebsiteSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData({ ...settings });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setError(null);
    setLoading(true);

    try {
      const updated = await api.updateSettings(formData);
      setFormData(updated);
      await refreshSettings();
      setSuccess('Institutional settings and branding variables updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  if (!formData) {
    return (
      <div className="py-20 text-center text-stone-500">
        <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm">Loading university settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-serif text-stone-900 dark:text-white">Institution & Platform Branding Settings</h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
          Centralized configuration controlling university identity, fest metadata, CSS color tokens, and contact channels.
        </p>
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

      <form onSubmit={handleSubmit} className="space-y-8 text-xs">
        {/* Institutional Identity */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-stone-100 dark:border-stone-800 pb-3">
            <Building2 size={18} className="text-brand-primary dark:text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-white font-sans">
              University Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase">University Full Name</label>
              <input
                type="text"
                required
                value={formData.university_name}
                onChange={(e) => setFormData({ ...formData, university_name: e.target.value })}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase">Short Name</label>
              <input
                type="text"
                required
                value={formData.university_short_name}
                onChange={(e) => setFormData({ ...formData, university_short_name: e.target.value })}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase">Campus Location Address</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase">Official Contact Email</label>
              <input
                type="email"
                required
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase">Official Phone</label>
              <input
                type="text"
                required
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Fest Details */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-stone-100 dark:border-stone-800 pb-3">
            <Calendar size={18} className="text-brand-primary dark:text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-white font-sans">
              Fest & Event Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase">Fest Title</label>
              <input
                type="text"
                required
                value={formData.fest_name}
                onChange={(e) => setFormData({ ...formData, fest_name: e.target.value })}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase">Tagline</label>
              <input
                type="text"
                required
                value={formData.fest_tagline}
                onChange={(e) => setFormData({ ...formData, fest_tagline: e.target.value })}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase">Commencement Date</label>
              <input
                type="date"
                value={formData.fest_start_date || ''}
                onChange={(e) => setFormData({ ...formData, fest_start_date: e.target.value })}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase">Conclusion Date</label>
              <input
                type="date"
                value={formData.fest_end_date || ''}
                onChange={(e) => setFormData({ ...formData, fest_end_date: e.target.value })}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase">Hero Background Image URL</label>
            <input
              type="url"
              value={formData.hero_image_url || ''}
              onChange={(e) => setFormData({ ...formData, hero_image_url: e.target.value })}
              className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white font-mono"
            />
          </div>
        </div>

        {/* Dynamic Branding Colors with Live Swatches */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-stone-100 dark:border-stone-800 pb-3">
            <Palette size={18} className="text-brand-primary dark:text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-white font-sans">
              Dynamic Institutional Color Tokens
            </h2>
          </div>
          <p className="text-xs text-stone-500">
            Colors map immediately to CSS variables (<code className="font-mono">--brand-primary</code>, etc.). Modify these to customize the visual theme for any institution.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            {/* Primary */}
            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
              <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase block">Primary Institutional Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="w-10 h-10 p-0.5 rounded border border-stone-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="flex-1 p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg font-mono"
                />
              </div>
              <div className="h-4 rounded mt-2 shadow-inner" style={{ backgroundColor: formData.primary_color }} />
            </div>

            {/* Secondary */}
            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
              <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase block">Secondary Navy Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="w-10 h-10 p-0.5 rounded border border-stone-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="flex-1 p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg font-mono"
                />
              </div>
              <div className="h-4 rounded mt-2 shadow-inner" style={{ backgroundColor: formData.secondary_color }} />
            </div>

            {/* Accent */}
            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
              <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase block">Heritage Gold Accent</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.accent_color}
                  onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                  className="w-10 h-10 p-0.5 rounded border border-stone-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.accent_color}
                  onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                  className="flex-1 p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg font-mono"
                />
              </div>
              <div className="h-4 rounded mt-2 shadow-inner" style={{ backgroundColor: formData.accent_color }} />
            </div>
          </div>
        </div>

        {/* Inter-House Championship Points System */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-stone-100 dark:border-stone-800 pb-3">
            <span className="text-base">🏆</span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-white font-sans">
              Inter-House Championship Points System
            </h2>
          </div>
          <p className="text-xs text-stone-500">
            Define points awarded to houses for podium finishes across all sports matches, tournament brackets, and track events. These feed strictly into the transactional Point Ledger.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 space-y-1">
              <label className="font-bold text-amber-700 dark:text-amber-400 uppercase text-[11px] block">
                🥇 1st Place (Gold / Champion)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.points_first_place ?? 10}
                  onChange={(e) => setFormData({ ...formData, points_first_place: Number(e.target.value) })}
                  className="w-full p-2 bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-700 rounded-lg text-stone-900 dark:text-white font-mono font-bold text-base text-center"
                />
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">pts</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-950/40 space-y-1">
              <label className="font-bold text-stone-700 dark:text-stone-300 uppercase text-[11px] block">
                🥈 2nd Place (Silver / Runner-up)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.points_second_place ?? 7}
                  onChange={(e) => setFormData({ ...formData, points_second_place: Number(e.target.value) })}
                  className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white font-mono font-bold text-base text-center"
                />
                <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">pts</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-amber-700/20 dark:border-amber-900/30 bg-amber-900/5 dark:bg-amber-950/10 space-y-1">
              <label className="font-bold text-amber-800 dark:text-amber-500 uppercase text-[11px] block">
                🥉 3rd Place (Bronze / 2nd Runner-up)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.points_third_place ?? 5}
                  onChange={(e) => setFormData({ ...formData, points_third_place: Number(e.target.value) })}
                  className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white font-mono font-bold text-base text-center"
                />
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-500">pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media & Footer */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-stone-100 dark:border-stone-800 pb-3">
            <Share2 size={18} className="text-brand-primary dark:text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-white font-sans">
              Social Channels & Footer
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase">Website URL</label>
              <input
                type="url"
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase">Instagram URL</label>
              <input
                type="url"
                value={formData.instagram_url || ''}
                onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase">Footer Legal Statement</label>
            <textarea
              rows={2}
              value={formData.footer_text || ''}
              onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
              className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase">Copyright Line</label>
            <input
              type="text"
              value={formData.copyright_text}
              onChange={(e) => setFormData({ ...formData, copyright_text: e.target.value })}
              className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg"
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-stone-400 font-mono text-[11px]">
            Settings Version: v{formData.version} (Optimistic Locking Active)
          </span>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-brand-primary hover:bg-stone-800 text-white rounded-xl font-bold transition-all shadow-md flex items-center space-x-2 disabled:opacity-50"
          >
            <CheckCircle size={16} />
            <span>{loading ? 'Saving Changes...' : 'Save & Publish Branding Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
