import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { SportItem } from '../../types';
import {
  Trophy,
  MapPin,
  Calendar,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  FileText,
  Activity,
  Flame,
  X
} from 'lucide-react';

export const SportsPage: React.FC = () => {
  const [sports, setSports] = useState<SportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGender, setSelectedGender] = useState('All');
  const [activeModalSport, setActiveModalSport] = useState<SportItem | null>(null);

  useEffect(() => {
    fetchSports();
  }, [selectedCategory, selectedGender]);

  const fetchSports = async () => {
    try {
      setLoading(true);
      const data = await api.getSports({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        gender: selectedGender !== 'All' ? selectedGender : undefined,
        search: search.trim() ? search.trim() : undefined
      });
      setSports(data);
    } catch (err) {
      console.error('Failed to load sports:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'All',
    'Outdoor Team',
    'Indoor Racket',
    'Athletics & Track',
    'Athletics & Field',
    'Traditional',
    'Indoor Mind Sports'
  ];

  const genders = ['All', 'Boys', 'Girls', 'Mixed'];

  const filteredSports = sports.filter((sp) => {
    if (!search) return true;
    return (
      sp.name.toLowerCase().includes(search.toLowerCase()) ||
      sp.description?.toLowerCase().includes(search.toLowerCase()) ||
      sp.category.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 p-8 sm:p-12 border border-stone-800 text-white shadow-xl space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
          <Flame size={13} />
          <span>SBU UMANG 2026 DISCIPLINES</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight">
          Official Sports & Competitions
        </h1>
        <p className="text-sm text-stone-300 max-w-2xl">
          Browse the complete catalog of sports contested at the Sarala Birla University Annual Sports Meet. Check tournament rules, scoring formats, and designated campus courts.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by sport name or description..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {/* Gender Filter Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
            {genders.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGender(g)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedGender === g
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                {g === 'All' ? 'All Divisions' : g}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pt-2 border-t border-stone-100 dark:border-stone-800/80">
          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mr-1">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sports Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-stone-500">Loading sports disciplines...</p>
        </div>
      ) : filteredSports.length === 0 ? (
        <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-12 text-center space-y-3">
          <Trophy size={36} className="mx-auto text-stone-400" />
          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">No Sports Found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            No disciplines matched your selected category or search filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSports.map((sport) => (
            <div
              key={sport.id}
              className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Banner / Category Image */}
                <div className="relative h-44 w-full bg-stone-800 overflow-hidden">
                  <img
                    src={sport.banner_url || "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80"}
                    alt={sport.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent"></div>
                  
                  {/* Badges */}
                  <div className="absolute top-3.5 left-3.5 flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur text-white text-[11px] font-semibold border border-white/10">
                      {sport.category}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-amber-500 text-stone-950 text-[11px] font-bold">
                      {sport.gender}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-xl font-bold font-serif text-white tracking-tight leading-snug">
                      {sport.name}
                    </h3>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4">
                  <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                    {sport.description || 'Inter-house championship discipline.'}
                  </p>

                  <div className="space-y-2 text-xs text-stone-500 pt-2 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Venue:</span>
                      <span className="font-medium text-stone-800 dark:text-stone-200">
                        {sport.venue?.name || 'SBU Sports Complex'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Scoring Format:</span>
                      <span className="font-medium text-stone-800 dark:text-stone-200">
                        {sport.scoring_format}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Competition Type:</span>
                      <span className="font-medium text-stone-800 dark:text-stone-200">
                        {sport.sport_type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-2 mt-2">
                <button
                  onClick={() => setActiveModalSport(sport)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors flex items-center space-x-1.5"
                >
                  <FileText size={13} />
                  <span>View Rules</span>
                </button>

                {sport.registration_form_url ? (
                  <a
                    href={sport.registration_form_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-primary text-white hover:bg-stone-800 transition-colors flex items-center space-x-1"
                  >
                    <span>Register</span>
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <Link
                    to="/schedule"
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-brand-primary dark:text-amber-400 hover:underline flex items-center space-x-1"
                  >
                    <span>Fixtures</span>
                    <ChevronRight size={13} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rules Modal */}
      {activeModalSport && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-5 border border-stone-200 dark:border-stone-800 shadow-2xl relative">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">
                  {activeModalSport.category} • {activeModalSport.gender}
                </span>
                <h3 className="text-xl font-bold font-serif text-stone-900 dark:text-white mt-1">
                  {activeModalSport.name} Rules & Regulations
                </h3>
              </div>
              <button
                onClick={() => setActiveModalSport(null)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-900 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-600 dark:text-stone-300 max-h-60 overflow-y-auto pr-2">
              <p className="font-semibold text-stone-900 dark:text-white">Tournament Guidelines:</p>
              <p className="whitespace-pre-line leading-relaxed">
                {activeModalSport.rules ||
                  "1. All participants must present a valid SBU Student Identity Card prior to match commencement.\n2. Official tournament attire and appropriate athletic footwear are mandatory.\n3. House Captains must report to the referee desk 15 minutes before the scheduled start time.\n4. Referee and technical committee decisions are final and binding."}
              </p>
            </div>

            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center text-xs">
              <span className="text-stone-400">Designated Arena:</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                {activeModalSport.venue?.name || 'Main Campus Sports Complex'}
              </span>
            </div>

            <button
              onClick={() => setActiveModalSport(null)}
              className="w-full py-2.5 rounded-xl bg-stone-900 dark:bg-stone-800 text-white font-semibold text-xs hover:bg-stone-800 transition-colors"
            >
              Close Rules
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
