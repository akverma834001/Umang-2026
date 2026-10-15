import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { HistoricalEdition, ArchivesStats, HistoricalSportRecord } from '../../types';
import {
  Trophy,
  Award,
  Medal,
  Calendar,
  Users,
  Search,
  Sparkles,
  Flame,
  ShieldCheck,
  ChevronRight,
  Filter,
  Star,
  Quote,
  X
} from 'lucide-react';

export const ArchivesPage: React.FC = () => {
  const [editions, setEditions] = useState<HistoricalEdition[]>([]);
  const [stats, setStats] = useState<ArchivesStats | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSquadRecord, setSelectedSquadRecord] = useState<HistoricalSportRecord | null>(null);

  // Helper to parse roster text into structured players
  const parsePlayerList = (playersStr?: string) => {
    if (!playersStr) return [];
    return playersStr
      .split(/,|\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0)
      .map((playerRaw) => {
        // Matches e.g. "Rahul Kumar (SBU2423621) [C]" or "Rahul (Enrollment No: SBU2423621)" or "Rahul (SBU/2024/...)"
        const match = playerRaw.match(/^(.*?)\s*\((?:(?:Enrollment\s*(?:No\.?)?|Enr\.?)\s*:\s*)?([A-Za-z0-9/_-]+)\)(.*)$/i);
        if (match) {
          return {
            name: match[1].trim(),
            enrollment: match[2].trim(),
            tag: match[3].trim()
          };
        }
        return {
          name: playerRaw,
          enrollment: '',
          tag: ''
        };
      });
  };

  const renderAccoladeName = (rawText: string) => {
    // Matches "Amit Sen (Enrollment No: SBU2423621)" or "Amit Sen (SBU2423621)"
    const match = rawText.match(/^(.*?)\s*\((?:(?:Enrollment\s*(?:No\.?)?|Enr\.?)\s*:\s*)?([A-Za-z0-9/_-]+)\)$/i);
    if (match && (match[2].toUpperCase().startsWith('SBU') || match[2].length >= 5)) {
      return (
        <div>
          <p className="font-serif font-bold text-stone-900 dark:text-white text-base">
            {match[1].trim()}
          </p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 text-xs font-mono font-medium border border-amber-300 dark:border-amber-800">
            Enr: {match[2].trim()}
          </span>
        </div>
      );
    }
    return (
      <p className="font-serif font-bold text-stone-900 dark:text-white text-base">
        {rawText}
      </p>
    );
  };

  useEffect(() => {
    Promise.all([
      api.getArchives(),
      api.getArchivesStats()
    ])
      .then(([archivesData, statsData]) => {
        setEditions(archivesData);
        setStats(statsData);
        if (archivesData && archivesData.length > 0) {
          setSelectedYear(archivesData[0].year);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const currentEdition = editions.find((e) => e.year === selectedYear) || editions[0];

  const categories = [
    'All',
    'Athletics & Track',
    'Outdoor Team',
    'Indoor Racket',
    'Traditional',
    'Indoor Mind Sports'
  ];

  const filteredSports = (currentEdition?.sports_records || []).filter((rec) => {
    const matchesCategory =
      selectedCategory === 'All' || rec.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      rec.sport_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rec.winner_participant && rec.winner_participant.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rec.winner_enrollment_no && rec.winner_enrollment_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rec.winner_players && rec.winner_players.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rec.winner_team_name && rec.winner_team_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rec.runner_up_participant && rec.runner_up_participant.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rec.runner_up_enrollment_no && rec.runner_up_enrollment_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rec.runner_up_players && rec.runner_up_players.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (rec.winner_metric && rec.winner_metric.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-stone-500">Retrieving past championship records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Page Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 mb-3 border border-amber-300 dark:border-amber-800">
            <Trophy size={14} className="text-amber-600 dark:text-amber-400" />
            <span>Official University Hall of Fame & Archives</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-stone-950 dark:text-white tracking-tight">
            Past 5-6 Years Championship Records
          </h1>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-400 mt-2 max-w-3xl leading-relaxed">
            Chronological archive of Sarala Birla University (SBU) UMANG sports festivals. Explore annual champion houses,
            historic points tables, collegiate records, and distinguished student athletes.
          </p>
        </div>

        {/* Trophies Counter Summary Badge */}
        {stats && (
          <div className="bg-white dark:bg-stone-900 border border-amber-500/20 dark:border-stone-800 rounded-2xl p-4 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-serif text-xl font-black">
              5
            </div>
            <div>
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                Recorded Editions
              </span>
              <span className="text-sm font-bold text-stone-900 dark:text-white">
                2021 — 2025 Championships
              </span>
            </div>
          </div>
        )}
      </div>

      {/* All-Time House Trophies Honor Roll */}
      {stats && stats.house_trophy_tally && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center space-x-1.5">
              <Sparkles size={14} className="text-amber-500" />
              <span>All-Time Inter-House Trophy Cabinet (2021 — 2025)</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.house_trophy_tally.map((h) => (
              <div
                key={h.id}
                className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: h.color }}></div>
                <div className="flex justify-between items-start pt-1">
                  <div>
                    <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-white leading-tight">
                      {h.name}
                    </h3>
                    <span className="text-[11px] font-mono text-stone-400 font-semibold">{h.code}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black font-mono text-amber-600 dark:text-amber-400 flex items-center justify-end space-x-1">
                      <Trophy size={16} />
                      <span>{h.championships}</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-stone-400">Championships</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800/60 flex justify-between text-[11px] text-stone-500">
                  <span>🥈 {h.runners_up} Runners-up</span>
                  <span className="font-semibold text-stone-700 dark:text-stone-300 font-mono">
                    {h.total_historical_points} Total PTS
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Year Selection Tabs */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin">
          {editions.map((ed) => {
            const isSelected = ed.year === selectedYear;
            return (
              <button
                key={ed.year}
                onClick={() => setSelectedYear(ed.year)}
                className={`px-5 py-3 rounded-2xl font-serif text-sm font-bold flex items-center space-x-2.5 transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-brand-primary text-white shadow-md scale-105'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:border-brand-primary'
                }`}
              >
                <Trophy size={15} className={isSelected ? 'text-amber-300' : 'text-stone-400'} />
                <span>UMANG {ed.year}</span>
                {ed.champion_team && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-sans font-bold uppercase ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    🏆 {ed.champion_team.code}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Edition Featured Hero Card */}
        {currentEdition && (
          <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 text-white p-6 sm:p-10 relative overflow-hidden border border-stone-800 shadow-xl">
            {/* Ambient Background Glow */}
            <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8 items-start lg:items-center">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Flame size={13} className="text-amber-400" />
                  <span>Championship Edition Archive</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold font-serif tracking-tight leading-tight">
                  {currentEdition.edition_title}
                </h2>

                {currentEdition.theme && (
                  <p className="text-amber-300 text-sm sm:text-base font-medium flex items-center space-x-2 italic">
                    <Quote size={16} className="inline rotate-180" />
                    <span>"{currentEdition.theme}"</span>
                  </p>
                )}

                {currentEdition.summary && (
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed pt-1">
                    {currentEdition.summary}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 pt-2">
                  {currentEdition.start_date && (
                    <span className="flex items-center space-x-1.5">
                      <Calendar size={14} className="text-amber-400" />
                      <span>{currentEdition.start_date} to {currentEdition.end_date}</span>
                    </span>
                  )}
                  {currentEdition.total_athletes > 0 && (
                    <span className="flex items-center space-x-1.5">
                      <Users size={14} className="text-amber-400" />
                      <span>{currentEdition.total_athletes} Athletes</span>
                    </span>
                  )}
                  {currentEdition.chief_guest && (
                    <span className="flex items-center space-x-1.5">
                      <Award size={14} className="text-amber-400" />
                      <span>Chief Guest: {currentEdition.chief_guest}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Champion House Podium Spotlight Card */}
              {currentEdition.champion_team && (
                <div className="w-full lg:w-80 bg-stone-900/90 backdrop-blur border border-amber-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex-shrink-0 text-center space-y-4">
                  <div
                    className="absolute top-0 left-0 right-0 h-2"
                    style={{ backgroundColor: currentEdition.champion_team.color }}
                  ></div>

                  <div className="w-16 h-16 rounded-full bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
                    <Trophy size={32} />
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block">
                      OVERALL CHAMPION HOUSE
                    </span>
                    <h3 className="font-serif font-extrabold text-xl text-white mt-1">
                      {currentEdition.champion_team.name}
                    </h3>
                    <span className="text-xs font-mono font-bold text-stone-400">
                      {currentEdition.champion_team.code}
                    </span>
                  </div>

                  {/* Standing stats for champion */}
                  {currentEdition.standings && currentEdition.standings[0] && (
                    <div className="pt-3 border-t border-stone-800 flex justify-around text-xs">
                      <div>
                        <span className="text-2xl font-black font-mono text-white block">
                          {currentEdition.standings[0].total_points}
                        </span>
                        <span className="text-[10px] text-stone-400 uppercase font-semibold">Total Points</span>
                      </div>
                      <div>
                        <span className="text-2xl font-black font-mono text-amber-400 block">
                          {currentEdition.standings[0].gold_medals}
                        </span>
                        <span className="text-[10px] text-stone-400 uppercase font-semibold">Gold Medals</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* House Standings Table for Selected Year */}
      {currentEdition?.standings && currentEdition.standings.length > 0 && (
        <section className="space-y-4">
          <div className="flex justify-between items-end border-b border-stone-200 dark:border-stone-800 pb-3">
            <div>
              <h2 className="text-2xl font-bold font-serif text-stone-950 dark:text-white">
                Final Inter-House Standings — UMANG {currentEdition.year}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Official validated point scores and medal counts awarded at the valedictory ceremony.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {currentEdition.standings.map((st) => (
              <div
                key={st.id}
                className={`p-5 rounded-3xl bg-white dark:bg-stone-900 border transition-all ${
                  st.rank === 1
                    ? 'border-amber-400 dark:border-amber-600 shadow-md scale-102 ring-2 ring-amber-400/20'
                    : 'border-stone-200 dark:border-stone-800'
                } relative overflow-hidden space-y-4`}
              >
                <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: st.color }}></div>

                <div className="flex items-center justify-between">
                  <span
                    className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center font-mono ${
                      st.rank === 1
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 ring-2 ring-amber-400/50'
                        : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                    }`}
                  >
                    #{st.rank}
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-stone-900 dark:text-white">
                      {st.total_points}
                    </span>
                    <span className="text-xs font-semibold text-stone-400 ml-1">PTS</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">{st.team_name}</h3>
                  <span className="text-xs font-mono font-semibold text-stone-500">{st.team_code}</span>
                </div>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex justify-between text-xs text-stone-600 dark:text-stone-400">
                  <span className="flex items-center space-x-1">
                    <span>🥇 {st.gold_medals}</span>
                    <span className="text-[10px] text-stone-400">Gold</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>🥈 {st.silver_medals}</span>
                    <span className="text-[10px] text-stone-400">Silv</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span>🥉 {st.bronze_medals}</span>
                    <span className="text-[10px] text-stone-400">Bronz</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Special Accolades & Trophies */}
      {(currentEdition?.best_athlete_boys ||
        currentEdition?.best_athlete_girls ||
        currentEdition?.fair_play_house ||
        currentEdition?.march_past_winner) && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold font-serif text-stone-950 dark:text-white">
            Special Accolades & Honors — UMANG {currentEdition.year}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {currentEdition.best_athlete_boys && (
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-stone-900 border border-amber-200 dark:border-amber-900/50 space-y-1.5">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                  <Star size={13} />
                  <span>Best Athlete (Boys)</span>
                </span>
                {renderAccoladeName(currentEdition.best_athlete_boys)}
              </div>
            )}

            {currentEdition.best_athlete_girls && (
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-stone-900 border border-amber-200 dark:border-amber-900/50 space-y-1.5">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                  <Star size={13} />
                  <span>Best Athlete (Girls)</span>
                </span>
                {renderAccoladeName(currentEdition.best_athlete_girls)}
              </div>
            )}

            {currentEdition.march_past_winner && (
              <div className="p-4 rounded-2xl bg-stone-100/80 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5">
                <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider flex items-center space-x-1">
                  <ShieldCheck size={13} />
                  <span>Best March Past Contingent</span>
                </span>
                <p className="font-serif font-bold text-stone-900 dark:text-white text-base">
                  {currentEdition.march_past_winner}
                </p>
              </div>
            )}

            {currentEdition.fair_play_house && (
              <div className="p-4 rounded-2xl bg-stone-100/80 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5">
                <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider flex items-center space-x-1">
                  <Award size={13} />
                  <span>Fair Play Trophy</span>
                </span>
                <p className="font-serif font-bold text-stone-900 dark:text-white text-base">
                  {currentEdition.fair_play_house}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Discipline-by-Discipline Sports Champions */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold font-serif text-stone-950 dark:text-white">
              Event Champions & Gold Medalists — UMANG {currentEdition.year}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Final match results, individual champions, winning metrics, and photo finishes.
            </p>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search champion or event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs focus:ring-2 focus:ring-amber-500 outline-none w-48 sm:w-56"
              />
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sport Records Grid */}
        {filteredSports.length === 0 ? (
          <div className="py-12 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl text-center p-6 text-stone-500">
            <Award size={32} className="mx-auto text-stone-400 mb-2" />
            <p className="text-sm">No historical sport records match the selected filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSports.map((rec) => (
              <div
                key={rec.id}
                className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex justify-between items-center text-[11px] mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-semibold">
                      {rec.category}
                    </span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{rec.gender}</span>
                  </div>

                  <h3 className="text-base font-bold font-serif text-stone-900 dark:text-white pt-1">
                    {rec.sport_name}
                  </h3>
                </div>

                {/* Gold & Silver Placements */}
                <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800/80 text-xs">
                  {/* Gold Winner */}
                  <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2">
                      <span className="text-base leading-none">🥇</span>
                      <div>
                        <span className="font-bold text-stone-900 dark:text-white block">
                          {rec.winner_participant || rec.winner_team_name}
                        </span>
                        
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          {rec.winner_participant && rec.winner_team_name && (
                            <span className="text-[11px] text-amber-800 dark:text-amber-400 font-semibold">
                              {rec.winner_team_name}
                            </span>
                          )}
                          {rec.winner_enrollment_no && (
                            <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded bg-amber-200/70 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 text-[10px] font-mono font-bold">
                              <span>ID:</span>
                              <span>{rec.winner_enrollment_no}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {rec.winner_metric && (
                      <span className="text-right font-mono font-bold text-amber-700 dark:text-amber-300 bg-white/70 dark:bg-stone-900 px-2 py-0.5 rounded text-[11px] flex-shrink-0">
                        {rec.winner_metric}
                      </span>
                    )}
                  </div>

                  {/* Silver Runner-up */}
                  {rec.runner_up_team_name && (
                    <div className="px-2.5 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-400">
                      <div className="flex items-center space-x-2">
                        <span>🥈</span>
                        <div className="flex flex-wrap items-center gap-1">
                          <span>
                            {rec.runner_up_participant ? `${rec.runner_up_participant} (${rec.runner_up_team_name})` : rec.runner_up_team_name}
                          </span>
                          {rec.runner_up_enrollment_no && (
                            <span className="font-mono text-[9px] text-stone-600 dark:text-stone-300 bg-stone-200/80 dark:bg-stone-700 px-1 py-0.2 rounded">
                              {rec.runner_up_enrollment_no}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-stone-400 text-[10px] shrink-0">Runner-up</span>
                    </div>
                  )}

                  {/* View Team Squad Button (if team players recorded) */}
                  {(rec.winner_players || rec.runner_up_players) && (
                    <button
                      onClick={() => setSelectedSquadRecord(rec)}
                      className="w-full mt-2 py-1.5 px-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 text-[11px] font-semibold flex items-center justify-between border border-amber-500/30 transition-all cursor-pointer"
                    >
                      <span className="flex items-center space-x-1.5">
                        <Users size={12} className="text-amber-600 dark:text-amber-400" />
                        <span>View Team Squad & Enrollment Nos</span>
                      </span>
                      <ChevronRight size={13} className="text-amber-600 dark:text-amber-400" />
                    </button>
                  )}

                  {rec.remarks && (
                    <p className="text-[11px] text-stone-500 italic pt-1 leading-normal">
                      "{rec.remarks}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* TEAM SQUAD ROSTER MODAL */}
      {selectedSquadRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Users size={20} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      {selectedSquadRecord.category}
                    </span>
                    <span className="text-xs text-stone-500 font-semibold">
                      {selectedSquadRecord.gender}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                    {selectedSquadRecord.sport_name} — Team Squads
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedSquadRecord(null)}
                className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Winner Team Squad */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-900/40 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🥇</span>
                    <h4 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                      {selectedSquadRecord.winner_team_name || 'Champion Team'}
                    </h4>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
                      Championship Squad
                    </span>
                  </div>
                  {selectedSquadRecord.winner_metric && (
                    <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                      {selectedSquadRecord.winner_metric}
                    </span>
                  )}
                </div>

                {selectedSquadRecord.winner_players ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {parsePlayerList(selectedSquadRecord.winner_players).map((p, pIdx) => (
                      <div
                        key={pIdx}
                        className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-stone-800/40 border border-amber-200/50 dark:border-stone-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-mono text-[10px] font-bold flex items-center justify-center">
                            {pIdx + 1}
                          </span>
                          <span className="font-bold text-stone-900 dark:text-white">
                            {p.name} {p.tag && <span className="text-amber-700 dark:text-amber-400 font-semibold">{p.tag}</span>}
                          </span>
                        </div>
                        {p.enrollment && (
                          <span className="font-mono text-[10px] font-semibold bg-white dark:bg-stone-900 px-2 py-0.5 rounded text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-stone-700">
                            {p.enrollment}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone-500 italic">Individual victory: {selectedSquadRecord.winner_participant} ({selectedSquadRecord.winner_enrollment_no || 'N/A'})</p>
                )}
              </div>

              {/* Runner-up Team Squad */}
              {selectedSquadRecord.runner_up_players && (
                <div className="space-y-3 pt-4 border-t border-stone-200 dark:border-stone-800">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🥈</span>
                      <h4 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                        {selectedSquadRecord.runner_up_team_name || 'Runner-up Team'}
                      </h4>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                        Runner-up Squad
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {parsePlayerList(selectedSquadRecord.runner_up_players).map((p, pIdx) => (
                      <div
                        key={pIdx}
                        className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-mono text-[10px] font-bold flex items-center justify-center">
                            {pIdx + 1}
                          </span>
                          <span className="font-medium text-stone-900 dark:text-white">
                            {p.name} {p.tag && <span className="text-stone-500 font-semibold">{p.tag}</span>}
                          </span>
                        </div>
                        {p.enrollment && (
                          <span className="font-mono text-[10px] font-semibold bg-white dark:bg-stone-900 px-2 py-0.5 rounded text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                            {p.enrollment}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-mono">
                Official SBU Sports Council Verified Squad Roster
              </span>
              <button
                onClick={() => setSelectedSquadRecord(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 dark:bg-stone-700 dark:hover:bg-stone-600 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
