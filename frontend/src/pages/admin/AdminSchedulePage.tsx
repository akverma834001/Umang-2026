import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { EventItem, VenueItem } from '../../types';
import { formatISTDate, formatISTTime } from '../../utils/date';
import { Clock, Calendar, MapPin, AlertTriangle, ShieldCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminSchedulePage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAdminEvents(), api.getAdminVenues()])
      .then(([evs, vns]) => {
        setEvents(evs);
        setVenues(vns);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Detect any conflicting events across the dataset
  const conflicts: Array<{ ev1: EventItem; ev2: EventItem; venueName: string }> = [];
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const e1 = events[i];
      const e2 = events[j];
      if (
        e1.venue_id &&
        e1.venue_id === e2.venue_id &&
        e1.event_date === e2.event_date &&
        e1.status !== 'CANCELLED' &&
        e2.status !== 'CANCELLED' &&
        e1.published_state !== 'ARCHIVED' &&
        e2.published_state !== 'ARCHIVED'
      ) {
        // Overlap: (e1.start_time < e2.end_time) && (e2.start_time < e1.end_time)
        if (e1.start_time < e2.end_time && e2.start_time < e1.end_time) {
          const v = venues.find(vn => vn.id === e1.venue_id);
          conflicts.push({ ev1: e1, ev2: e2, venueName: v?.name || 'Assigned Venue' });
        }
      }
    }
  }

  // Group events by date
  const eventsByDate = events.reduce((acc, ev) => {
    const d = ev.event_date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(ev);
    return acc;
  }, {} as Record<string, EventItem[]>);

  const sortedDates = Object.keys(eventsByDate).sort();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 dark:text-white">Admin Schedule & Timetable Controller</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Monitor venue allotments, identify overlapping time slots, and verify chronological integrity.
          </p>
        </div>
        <Link
          to="/admin/events"
          className="px-3.5 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
        >
          Manage in Events Table
        </Link>
      </div>

      {/* Conflict Alert Banner */}
      {conflicts.length > 0 ? (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900 space-y-2">
          <div className="flex items-center space-x-2 text-red-700 dark:text-red-400 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle size={16} />
            <span>Active Venue Scheduling Overlaps Detected ({conflicts.length})</span>
          </div>
          <div className="space-y-1.5 text-xs text-red-800 dark:text-red-300">
            {conflicts.map((c, idx) => (
              <p key={idx}>
                • Overlap at <strong>{c.venueName}</strong>: "{c.ev1.title}" ({c.ev1.start_time} - {c.ev1.end_time}) clashes with "{c.ev2.title}" ({c.ev2.start_time} - {c.ev2.end_time}) on {formatISTDate(c.ev1.event_date)}.
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span>Zero schedule conflicts detected. All active events have conflict-free venue allocations.</span>
        </div>
      )}

      {/* Schedule by Dates */}
      <div className="space-y-8">
        {sortedDates.map((dateKey) => (
          <div key={dateKey} className="space-y-3">
            <div className="flex items-center space-x-2 text-sm font-serif font-bold text-stone-900 dark:text-white bg-stone-100 dark:bg-stone-900/60 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800">
              <Calendar size={16} className="text-brand-primary dark:text-amber-400" />
              <span>{formatISTDate(dateKey)}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventsByDate[dateKey].map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xs flex flex-col justify-between text-xs space-y-3"
                >
                  <div>
                    <div className="flex justify-between items-center text-stone-500">
                      <span className="font-mono font-bold text-brand-primary dark:text-amber-400">
                        {ev.start_time} - {ev.end_time}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800">
                        {ev.published_state}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-white mt-1.5">{ev.title}</h4>
                    <p className="text-stone-500 text-[11px] mt-0.5">{ev.category}</p>
                  </div>

                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-stone-400 text-[11px]">
                    <span className="flex items-center space-x-1 truncate max-w-[160px]">
                      <MapPin size={12} />
                      <span className="truncate">{ev.venue?.name || 'Unassigned'}</span>
                    </span>
                    <span className="font-semibold text-stone-700 dark:text-stone-300 uppercase text-[10px]">{ev.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
