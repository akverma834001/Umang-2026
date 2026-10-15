import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { EventItem, VenueItem } from '../../types';
import { formatISTDate, formatISTTime } from '../../utils/date';
import { Clock, Calendar, MapPin, ShieldCheck, Filter } from 'lucide-react';

export const SchedulePage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);

  const categories = ['All', 'Cricket', 'Football', 'Badminton', 'Volleyball', 'Basketball', 'Athletics', 'Table Tennis', 'Chess', 'Kabaddi'];

  useEffect(() => {
    api.getVenues().then(setVenues).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    api.getSchedule({
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
      venue_id: selectedVenue !== 'All' ? Number(selectedVenue) : undefined,
    })
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedVenue]);

  // Group events by date
  const eventsByDate = events.reduce((acc, ev) => {
    const d = ev.event_date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(ev);
    return acc;
  }, {} as Record<string, EventItem[]>);

  const sortedDates = Object.keys(eventsByDate).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-2">
            <ShieldCheck size={13} />
            <span>Conflict-Free Verified Schedule</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-stone-950 dark:text-white">Sports Meet Timetable & Schedule</h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            All fixtures and tournament rounds rendered canonically in Asia/Kolkata (IST). Venues and grounds are conflict-checked.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Venue Filter */}
          <select
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value)}
            className="text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg px-3 py-2 text-stone-800 dark:text-stone-200 focus:outline-hidden"
          >
            <option value="All">All Venues</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg px-3 py-2 text-stone-800 dark:text-stone-200 focus:outline-hidden"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c} Category</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic Timeline Grid */}
      {loading ? (
        <div className="py-20 text-center text-stone-500">
          <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Loading synchronized timetable...</p>
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="py-20 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-center p-8">
          <Calendar size={36} className="text-stone-400 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-stone-800 dark:text-stone-200">No scheduled sessions</h3>
          <p className="text-xs text-stone-500 mt-1">No sessions match the selected venue or category filters.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {sortedDates.map((dateKey) => (
            <div key={dateKey} className="space-y-4">
              <div className="sticky top-20 z-20 bg-stone-100/90 dark:bg-stone-950/90 backdrop-blur-xs py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar size={18} className="text-brand-primary dark:text-amber-400" />
                  <h2 className="font-bold text-base font-serif text-stone-900 dark:text-white">
                    {formatISTDate(dateKey)}
                  </h2>
                </div>
                <span className="text-xs font-mono text-stone-500">
                  {eventsByDate[dateKey].length} Competitions
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventsByDate[dateKey].map((ev) => (
                  <div
                    key={ev.id}
                    className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-stone-300 dark:hover:border-stone-700 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-brand-primary dark:text-amber-400">
                          <Clock size={14} />
                          <span>{formatISTTime(ev.start_time)} - {formatISTTime(ev.end_time)}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            ev.status === 'COMPLETED'
                              ? 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {ev.status === 'COMPLETED' ? 'COMPLETED' : 'SCHEDULED'}
                        </span>
                      </div>

                      <h3 className="font-bold text-base font-serif text-stone-900 dark:text-white">{ev.title}</h3>
                      <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                        {ev.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                      <div className="flex items-center space-x-1.5 truncate max-w-[180px]">
                        <MapPin size={14} className="flex-shrink-0 text-stone-400" />
                        <span className="truncate">{ev.venue?.name || 'SBU Campus'}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-medium text-[10px] uppercase">
                        {ev.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
