import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { VenueItem } from '../../types';
import { MapPin, Users, ExternalLink, Navigation } from 'lucide-react';

export const VenuesPage: React.FC = () => {
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getVenues()
      .then(setVenues)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-6">
        <h1 className="text-3xl font-bold font-serif text-stone-950 dark:text-white">SBU Sports Arenas & Campus Venues</h1>
        <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
          Four AstroTurf volleyball courts, full-size football ground, cricket arena, basketball courts, badminton pavilion, and 400m athletics tracks across the 60-acre Birla Campus, Mahilong, Ranchi.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-stone-500">
          <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Loading campus venues...</p>
        </div>
      ) : venues.length === 0 ? (
        <div className="py-20 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-center p-8">
          <MapPin size={36} className="text-stone-400 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-stone-800 dark:text-stone-200">No venues configured</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((v) => (
            <div
              key={v.id}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              {v.image_url && (
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={v.image_url}
                    alt={v.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-stone-950/80 text-white backdrop-blur-md flex items-center space-x-1.5">
                      <Users size={12} />
                      <span>Capacity: ~{v.capacity} Attendees</span>
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-xl font-serif text-stone-950 dark:text-white leading-snug">
                    {v.name}
                  </h3>

                  <div className="flex items-start space-x-1.5 text-xs text-stone-500 dark:text-stone-400">
                    <MapPin size={14} className="text-stone-400 flex-shrink-0 mt-0.5" />
                    <span>{v.location}</span>
                  </div>

                  {v.description && (
                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed pt-1">
                      {v.description}
                    </p>
                  )}
                </div>

                {v.map_url && (
                  <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
                    <a
                      href={v.map_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
                    >
                      <Navigation size={13} className="text-brand-primary dark:text-amber-400" />
                      <span>Open Campus Directions in Google Maps</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
