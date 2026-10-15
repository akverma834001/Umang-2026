import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { FormItem } from '../../types';
import { FileSpreadsheet, ExternalLink, Clock, Calendar, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatISTDateTime } from '../../utils/date';

export const RegistrationsPage: React.FC = () => {
  const [forms, setForms] = useState<FormItem[]>([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Management', 'General'];

  useEffect(() => {
    setLoading(true);
    api.getForms()
      .then(setForms)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredForms = forms.filter(f => category === 'All' || f.category.toLowerCase() === category.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 mb-2">
            <ShieldCheck size={13} />
            <span>Official External Google Forms</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-stone-950 dark:text-white">Event Registrations</h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Official registration links for UMANG 2026. Submissions are processed through verified Google Forms.
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
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Forms Grid */}
      {loading ? (
        <div className="py-20 text-center text-stone-500">
          <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Loading active registration forms...</p>
        </div>
      ) : filteredForms.length === 0 ? (
        <div className="py-20 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-center p-8">
          <FileSpreadsheet size={36} className="text-stone-400 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-stone-800 dark:text-stone-200">No active registrations</h3>
          <p className="text-xs text-stone-500 mt-1">Check back soon for upcoming registration openings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form) => (
            <div
              key={form.id}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-stone-300 dark:hover:border-stone-700 transition-all space-y-6"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span
                    className={`font-bold px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider ${
                      form.status === 'CLOSING_SOON'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {form.status.replace('_', ' ')}
                  </span>
                  <span className="font-semibold text-stone-500">{form.category}</span>
                </div>

                <h3 className="font-bold text-lg font-serif text-stone-950 dark:text-white leading-snug">
                  {form.title}
                </h3>

                {form.event_title && (
                  <p className="text-xs font-medium text-brand-primary dark:text-amber-400">
                    Associated Event: {form.event_title}
                  </p>
                )}

                {form.description && (
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-3">
                    {form.description}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-4">
                {form.closing_date && (
                  <div className="flex items-center space-x-1.5 text-xs text-stone-500 dark:text-stone-400">
                    <Clock size={14} className="text-stone-400 flex-shrink-0" />
                    <span>Closes: <span className="font-mono font-medium text-stone-700 dark:text-stone-300">{formatISTDateTime(form.closing_date)}</span></span>
                  </div>
                )}

                <a
                  href={form.form_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-brand-primary hover:bg-stone-800 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-sm hover:shadow-brand-primary/20"
                >
                  <span>Open Official Google Form</span>
                  <ExternalLink size={14} />
                </a>

                <div className="flex items-center justify-center space-x-1.5 text-[10px] text-stone-400">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <span>Verified Google Forms Destination</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
