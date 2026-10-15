import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { EventItem } from '../../types';
import { formatISTDate, formatISTTime } from '../../utils/date';
import { Search, Filter, Calendar, MapPin, CheckCircle, Clock, X, FileText, ChevronRight } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Cricket', 'Football', 'Badminton', 'Volleyball', 'Basketball', 'Athletics', 'Table Tennis', 'Chess', 'Kabaddi'];
  const statuses = ['All', 'UPCOMING', 'COMPLETED'];

  const fetchEvents = () => {
    setLoading(true);
    api.getEvents({
      search: search || undefined,
      category: category !== 'All' ? category : undefined,
      status: status !== 'All' ? status : undefined,
    })
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, [category, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-6">
        <h1 className="text-3xl font-bold font-serif text-stone-950 dark:text-white">Sports Matches & Fixtures</h1>
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
          Explore inter-house fixtures, athletic trials, and championship events scheduled for SBU UMANG 2026.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search competitions by title or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-stone-800 rounded-lg transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-stone-500 mr-1">Category:</span>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  category === c
                    ? 'bg-brand-primary text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-stone-500 mr-1">Status:</span>
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  status === s
                    ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-20 text-center text-stone-500">
          <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Loading competitions...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="py-20 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-center p-8">
          <Calendar size={36} className="text-stone-400 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-stone-800 dark:text-stone-200">No competitions found</h3>
          <p className="text-xs text-stone-500 mt-1">Try adjusting your search terms or category filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {ev.banner_url && (
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={ev.banner_url}
                    alt={ev.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                        ev.status === 'COMPLETED'
                          ? 'bg-stone-900/80 text-stone-200'
                          : 'bg-blue-600/90 text-white'
                      }`}
                    >
                      {ev.status === 'COMPLETED' ? 'COMPLETED' : 'SCHEDULED'}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                      {ev.category}
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      {formatISTDate(ev.event_date)}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg font-serif text-stone-950 dark:text-white leading-snug">
                    {ev.title}
                  </h3>

                  <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-3 leading-relaxed">
                    {ev.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
                  <div className="flex items-center space-x-2 text-xs text-stone-500 dark:text-stone-400">
                    <Clock size={14} className="text-stone-400 flex-shrink-0" />
                    <span>{formatISTTime(ev.start_time)} - {formatISTTime(ev.end_time)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-stone-500 dark:text-stone-400">
                    <MapPin size={14} className="text-stone-400 flex-shrink-0" />
                    <span className="truncate">{ev.venue?.name || 'SBU Campus'}</span>
                  </div>

                  <div className="pt-2 flex justify-between items-center">
                    <button
                      onClick={() => setSelectedEvent(ev)}
                      className="text-xs font-semibold text-brand-primary dark:text-amber-400 hover:underline flex items-center space-x-1"
                    >
                      <FileText size={13} />
                      <span>View Full Rules</span>
                    </button>
                    <span className="text-[11px] text-stone-400 font-mono">Asia/Kolkata</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rules Modal Drawer */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-brand-primary dark:text-amber-400 uppercase tracking-wider">
                  {selectedEvent.category} • {formatISTDate(selectedEvent.event_date)}
                </span>
                <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-white mt-1">
                  {selectedEvent.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
              <div>
                <h4 className="font-semibold text-stone-900 dark:text-white uppercase tracking-wider text-xs mb-2">
                  Event Overview
                </h4>
                <p>{selectedEvent.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800 text-xs">
                <div>
                  <span className="text-stone-500 block">Scheduled Time</span>
                  <span className="font-medium text-stone-900 dark:text-white">
                    {formatISTTime(selectedEvent.start_time)} - {formatISTTime(selectedEvent.end_time)}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Assigned Venue</span>
                  <span className="font-medium text-stone-900 dark:text-white">
                    {selectedEvent.venue?.name || 'SBU Campus'}
                  </span>
                </div>
              </div>

              {selectedEvent.rules ? (
                <div>
                  <h4 className="font-semibold text-stone-900 dark:text-white uppercase tracking-wider text-xs mb-2">
                    Official Competition Rules & Guidelines
                  </h4>
                  <div className="bg-stone-50 dark:bg-stone-950 p-4 rounded-xl border border-stone-200 dark:border-stone-800 whitespace-pre-line font-mono text-xs">
                    {selectedEvent.rules}
                  </div>
                </div>
              ) : (
                <p className="text-xs italic text-stone-500">General university inter-house competition guidelines apply.</p>
              )}
            </div>

            <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex justify-end bg-stone-50 dark:bg-stone-950 rounded-b-2xl">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 text-xs font-semibold bg-stone-900 hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 text-white rounded-lg transition-colors"
              >
                Close Rulebook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
