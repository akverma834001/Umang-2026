import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { AnnouncementItem } from '../../types';
import { Bell, AlertTriangle, Info, Calendar, ShieldCheck, Tag } from 'lucide-react';
import { formatISTDateTime } from '../../utils/date';

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'IMPORTANT', 'GENERAL', 'SCHEDULE_UPDATE', 'RESULT', 'NOTICE'];

  useEffect(() => {
    setLoading(true);
    api.getAnnouncements(category !== 'All' ? category : undefined)
      .then(setAnnouncements)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-stone-950 dark:text-white">Official Announcements</h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Official communications, urgent schedule adjustments, and notifications from the UMANG 2026 organizing council.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                category === c
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50'
              }`}
            >
              {c.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements Stream */}
      {loading ? (
        <div className="py-20 text-center text-stone-500">
          <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Loading official notices...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="py-20 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-center p-8">
          <Bell size={36} className="text-stone-400 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-stone-800 dark:text-stone-200">No notices in this category</h3>
          <p className="text-xs text-stone-500 mt-1">Check back later for newly published bulletins.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => {
            const isHigh = ann.priority === 'HIGH';
            return (
              <div
                key={ann.id}
                className={`p-6 rounded-2xl border transition-all ${
                  isHigh
                    ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60 shadow-xs'
                    : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                        isHigh
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                      }`}
                    >
                      {ann.category.replace('_', ' ')}
                    </span>
                    {isHigh && (
                      <span className="inline-flex items-center space-x-1 text-xs font-bold text-red-600 dark:text-red-400">
                        <AlertTriangle size={13} />
                        <span>High Priority</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-stone-500">
                    {formatISTDateTime(ann.published_at)}
                  </span>
                </div>

                <h3 className="text-xl font-bold font-serif text-stone-950 dark:text-white mt-3">
                  {ann.title}
                </h3>

                <p className="text-sm text-stone-700 dark:text-stone-300 mt-2 leading-relaxed whitespace-pre-line">
                  {ann.description}
                </p>

                {ann.image_url && (
                  <div className="mt-4 rounded-xl overflow-hidden max-w-lg border border-stone-200 dark:border-stone-800">
                    <img src={ann.image_url} alt={ann.title} className="w-full h-auto object-cover" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
