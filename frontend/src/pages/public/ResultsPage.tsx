import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ResultItem } from '../../types';
import { Award, Trophy, Medal, Search, Calendar, ShieldCheck, Users, X, ChevronRight, Star } from 'lucide-react';
import { formatISTDateTime } from '../../utils/date';

export const ResultsPage: React.FC = () => {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSquadResult, setSelectedSquadResult] = useState<ResultItem | null>(null);

  const categories = ['All', 'Technical', 'Cultural', 'Sports', 'Management', 'Literary', 'Main'];

  useEffect(() => {
    setLoading(true);
    api.getResults(category !== 'All' ? category : undefined)
      .then(setResults)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [category]);

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

  const filteredResults = results.filter((res) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (res.event_title && res.event_title.toLowerCase().includes(q)) ||
      (res.category && res.category.toLowerCase().includes(q)) ||
      (res.winner_team_name && res.winner_team_name.toLowerCase().includes(q)) ||
      (res.winner_participant && res.winner_participant.toLowerCase().includes(q)) ||
      (res.winner_enrollment_no && res.winner_enrollment_no.toLowerCase().includes(q)) ||
      (res.winner_players && res.winner_players.toLowerCase().includes(q)) ||
      (res.runner_up_team_name && res.runner_up_team_name.toLowerCase().includes(q)) ||
      (res.runner_up_participant && res.runner_up_participant.toLowerCase().includes(q)) ||
      (res.runner_up_enrollment_no && res.runner_up_enrollment_no.toLowerCase().includes(q)) ||
      (res.runner_up_players && res.runner_up_players.toLowerCase().includes(q)) ||
      (res.third_place_team_name && res.third_place_team_name.toLowerCase().includes(q)) ||
      (res.third_place_participant && res.third_place_participant.toLowerCase().includes(q)) ||
      (res.third_place_enrollment_no && res.third_place_enrollment_no.toLowerCase().includes(q)) ||
      (res.third_place_players && res.third_place_players.toLowerCase().includes(q)) ||
      (res.remarks && res.remarks.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 mb-2 border border-amber-300 dark:border-amber-800">
            <Trophy size={14} className="text-amber-600 dark:text-amber-400" />
            <span>Official University Competition Standings</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-stone-950 dark:text-white">Official Competition Results</h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Verified podium standings, winner student enrollment IDs, team squad rosters, and point allocations signed off by the competition jury.
          </p>
        </div>

        {/* Live Search */}
        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search winner, enrollment no, squad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-hidden focus:border-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              category === c
                ? 'bg-brand-primary text-white shadow-xs'
                : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Results List */}
      {loading ? (
        <div className="py-20 text-center text-stone-500">
          <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Fetching verified result sheets...</p>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="py-20 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-center p-8">
          <Award size={36} className="text-stone-400 mx-auto mb-3" />
          <h3 className="font-serif font-bold text-stone-800 dark:text-stone-200">
            {searchQuery ? 'No results matching your search' : 'No published results in this category'}
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            {searchQuery ? 'Try clearing your search query or choosing another category.' : 'Official results will be published once jury deliberations conclude.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredResults.map((res) => (
            <div
              key={res.id}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6 hover:border-stone-300 dark:hover:border-stone-700 transition-colors"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 uppercase tracking-wider">
                      {res.category}
                    </span>
                    <h3 className="text-xl font-bold font-serif text-stone-950 dark:text-white mt-1.5">
                      {res.event_title}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-stone-400">
                    {formatISTDateTime(res.created_at)}
                  </span>
                </div>

                {/* Podium Cards */}
                <div className="mt-5 space-y-2.5">
                  {/* Winner / 1st Place */}
                  <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-900/80 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
                        🥇
                      </span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                          1st Place / Winner
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-sm text-stone-900 dark:text-white font-serif">
                            {res.winner_team_name}
                          </span>
                          {res.winner_participant && (
                            <span className="text-xs text-stone-700 dark:text-stone-300 font-medium">
                              — {res.winner_participant}
                            </span>
                          )}
                          {res.winner_enrollment_no && (
                            <span className="font-mono text-[10px] font-semibold text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/70 border border-amber-300 dark:border-amber-700 px-1.5 py-0.5 rounded">
                              {res.winner_enrollment_no}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-base text-amber-600 dark:text-amber-400 block">
                        +{res.winner_points} pts
                      </span>
                      {res.winner_metric && (
                        <span className="font-mono text-[11px] text-stone-500">
                          {res.winner_metric}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Runner-up / 2nd Place */}
                  {res.runner_up_team_name && (
                    <div className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center font-bold text-sm shrink-0">
                          🥈
                        </span>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                            2nd Place / Runner-up
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-semibold text-sm text-stone-800 dark:text-stone-200 font-serif">
                              {res.runner_up_team_name}
                            </span>
                            {res.runner_up_participant && (
                              <span className="text-xs text-stone-600 dark:text-stone-400">
                                — {res.runner_up_participant}
                              </span>
                            )}
                            {res.runner_up_enrollment_no && (
                              <span className="font-mono text-[10px] font-semibold text-stone-700 dark:text-stone-300 bg-stone-200/80 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 px-1.5 py-0.5 rounded">
                                {res.runner_up_enrollment_no}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-semibold text-sm text-stone-600 dark:text-stone-400 block">
                          +{res.runner_up_points} pts
                        </span>
                        {res.runner_up_metric && (
                          <span className="font-mono text-[11px] text-stone-400">
                            {res.runner_up_metric}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {res.third_place_team_name && (
                    <div className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 flex items-center justify-center font-bold text-sm shrink-0">
                          🥉
                        </span>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                            3rd Place
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-semibold text-sm text-stone-800 dark:text-stone-200 font-serif">
                              {res.third_place_team_name}
                            </span>
                            {res.third_place_participant && (
                              <span className="text-xs text-stone-600 dark:text-stone-400">
                                — {res.third_place_participant}
                              </span>
                            )}
                            {res.third_place_enrollment_no && (
                              <span className="font-mono text-[10px] font-semibold text-stone-700 dark:text-stone-300 bg-stone-200/80 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 px-1.5 py-0.5 rounded">
                                {res.third_place_enrollment_no}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono font-semibold text-sm text-stone-600 dark:text-stone-400 block">
                          +{res.third_place_points} pts
                        </span>
                        {res.third_place_metric && (
                          <span className="font-mono text-[11px] text-stone-400">
                            {res.third_place_metric}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Team Squad Roster Button (if squad players are registered) */}
                {(res.winner_players || res.runner_up_players || res.third_place_players) && (
                  <button
                    onClick={() => setSelectedSquadResult(res)}
                    className="w-full mt-3 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 text-xs font-semibold flex items-center justify-between border border-amber-500/30 transition-all cursor-pointer"
                  >
                    <span className="flex items-center space-x-1.5">
                      <Users size={14} className="text-amber-600 dark:text-amber-400" />
                      <span>View Team Squad Rosters & Enrollment Nos</span>
                    </span>
                    <ChevronRight size={14} className="text-amber-600 dark:text-amber-400" />
                  </button>
                )}

                {res.remarks && (
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-3 italic bg-stone-50 dark:bg-stone-950/60 p-3 rounded-lg border border-stone-100 dark:border-stone-800">
                    Jury Remarks: "{res.remarks}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-400">
                <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck size={14} />
                  <span>Ledger Synchronized</span>
                </span>
                <span className="font-mono text-[11px]">Audit ID: #{res.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TEAM SQUAD ROSTER MODAL */}
      {selectedSquadResult && (
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
                      {selectedSquadResult.category}
                    </span>
                    <span className="text-xs text-stone-400 font-mono">
                      Event #{selectedSquadResult.event_id}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">
                    {selectedSquadResult.event_title} — Team Squads
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedSquadResult(null)}
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
                      {selectedSquadResult.winner_team_name || 'Champion Team'}
                    </h4>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
                      1st Place Squad (+{selectedSquadResult.winner_points} pts)
                    </span>
                  </div>
                  {selectedSquadResult.winner_metric && (
                    <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                      {selectedSquadResult.winner_metric}
                    </span>
                  )}
                </div>

                {selectedSquadResult.winner_players ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {parsePlayerList(selectedSquadResult.winner_players).map((p, pIdx) => (
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
                  <p className="text-xs text-stone-500 italic">
                    Individual victory: {selectedSquadResult.winner_participant || 'N/A'} {selectedSquadResult.winner_enrollment_no && `(${selectedSquadResult.winner_enrollment_no})`}
                  </p>
                )}
              </div>

              {/* Runner-up Team Squad */}
              {selectedSquadResult.runner_up_players && (
                <div className="space-y-3 pt-4 border-t border-stone-200 dark:border-stone-800">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🥈</span>
                      <h4 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                        {selectedSquadResult.runner_up_team_name || 'Runner-up Team'}
                      </h4>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                        2nd Place Squad (+{selectedSquadResult.runner_up_points} pts)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {parsePlayerList(selectedSquadResult.runner_up_players).map((p, pIdx) => (
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

              {/* 3rd Place Team Squad */}
              {selectedSquadResult.third_place_players && (
                <div className="space-y-3 pt-4 border-t border-stone-200 dark:border-stone-800">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🥉</span>
                      <h4 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                        {selectedSquadResult.third_place_team_name || '3rd Place Team'}
                      </h4>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                        3rd Place Squad (+{selectedSquadResult.third_place_points} pts)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {parsePlayerList(selectedSquadResult.third_place_players).map((p, pIdx) => (
                      <div
                        key={pIdx}
                        className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 font-mono text-[10px] font-bold flex items-center justify-center">
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
                onClick={() => setSelectedSquadResult(null)}
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
