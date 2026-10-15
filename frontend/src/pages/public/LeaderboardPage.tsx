import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  LeaderboardItem,
  PointsBreakdown,
  BestAthletesLeaderboardResponse,
  BestAthleteItem
} from '../../types';
import {
  Trophy,
  Award,
  ShieldCheck,
  ListOrdered,
  X,
  ChevronRight,
  Info,
  History,
  Medal,
  Star,
  Users,
  User,
  Sparkles,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { formatISTDateTime } from '../../utils/date';

export const LeaderboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'athletes' | 'houses'>('athletes');

  // House Standings State
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [selectedBreakdown, setSelectedBreakdown] = useState<PointsBreakdown | null>(null);
  const [loadingHouses, setLoadingHouses] = useState(true);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);

  // Best Athletes State
  const [athletesData, setAthletesData] = useState<BestAthletesLeaderboardResponse | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [loadingAthletes, setLoadingAthletes] = useState(true);
  const [selectedAthlete, setSelectedAthlete] = useState<BestAthleteItem | null>(null);

  // Fetch House Standings
  useEffect(() => {
    api.getLeaderboard()
      .then(setLeaderboard)
      .catch(console.error)
      .finally(() => setLoadingHouses(false));
  }, []);

  // Fetch Best Athletes Leaderboard
  useEffect(() => {
    setLoadingAthletes(true);
    api.getAthletesLeaderboard(selectedYear)
      .then((data: BestAthletesLeaderboardResponse) => {
        setAthletesData(data);
      })
      .catch(console.error)
      .finally(() => setLoadingAthletes(false));
  }, [selectedYear]);

  const handleOpenBreakdown = (teamId: number) => {
    setLoadingBreakdown(true);
    api.getPointsBreakdown(teamId)
      .then(setSelectedBreakdown)
      .catch(console.error)
      .finally(() => setLoadingBreakdown(false));
  };

  const topThreeHouses = leaderboard.slice(0, 3);
  const remainingHouses = leaderboard.slice(3);

  const topAthletes = athletesData?.top_athletes || [];
  const topThreeAthletes = topAthletes.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 mb-2.5 border border-amber-300 dark:border-amber-800">
            <Trophy size={14} className="text-amber-600 dark:text-amber-400" />
            <span>Official University Competition Standings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-stone-950 dark:text-white tracking-tight">
            UMANG Championship Leaderboard
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-3xl leading-relaxed">
            Immutable point ledger standings audited by the sports council. Switch between individual student athlete rankings
            and inter-house championship totals.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-stone-100 dark:bg-stone-900 p-1.5 rounded-2xl border border-stone-200 dark:border-stone-800 shrink-0 self-start md:self-auto shadow-inner">
          <button
            onClick={() => setActiveTab('athletes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'athletes'
                ? 'bg-amber-500 text-stone-950 shadow-md scale-[1.02]'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Medal size={15} />
            <span>Best Athletes (Top 5 MVP)</span>
          </button>
          <button
            onClick={() => setActiveTab('houses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'houses'
                ? 'bg-amber-500 text-stone-950 shadow-md scale-[1.02]'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Trophy size={15} />
            <span>Inter-House Standings</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BEST INDIVIDUAL ATHLETES LEADERBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'athletes' && (
        <div className="space-y-10">
          {/* Subheader with Edition Selector */}
          <div className="bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Enrollment-Referenced Scoring Model
                </span>
              </div>
              <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-white">
                {athletesData?.edition_label || 'Top 5 Individual Athletes'}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-2xl">
                Score Formula: <strong className="text-stone-700 dark:text-stone-300">Solo Event Points</strong> (Individual 1st/2nd/3rd) +{' '}
                <strong className="text-stone-700 dark:text-stone-300">Team Event Squad Points</strong> ={' '}
                <span className="text-amber-600 dark:text-amber-400 font-bold">Total Athlete Score</span>.
                Ranked by Enrollment ID tie-breaker.
              </p>
            </div>

            {/* Year / Tournament Filter */}
            {athletesData && athletesData.available_years && (
              <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-stone-950 p-1.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
                <button
                  onClick={() => setSelectedYear(undefined)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    selectedYear === undefined
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  Latest / Live
                </button>
                {athletesData.available_years
                  .filter((y) => y !== 2026)
                  .map((y) => (
                    <button
                      key={y}
                      onClick={() => setSelectedYear(y)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        selectedYear === y
                          ? 'bg-amber-500 text-stone-950 shadow-xs'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {loadingAthletes ? (
            <div className="py-20 text-center text-stone-500">
              <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm">Aggregating solo & team points by student enrollment number...</p>
            </div>
          ) : topAthletes.length === 0 ? (
            <div className="py-20 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl text-center p-8 space-y-3">
              <Medal size={40} className="text-stone-400 mx-auto" />
              <h3 className="font-serif font-bold text-stone-800 dark:text-stone-200 text-lg">No athlete points recorded yet</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                Individual athlete scores will automatically appear once competition results with student enrollment numbers are published.
              </p>
            </div>
          ) : (
            <>
              {/* ========================================================= */}
              {/* TOP THREE ATHLETES PODIUM SPOTLIGHT (HIGHLIGHTED) */}
              {/* ========================================================= */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles size={16} className="text-amber-500" />
                    <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-white">
                      Podium Laureates — Top 3 Student Athletes
                    </h3>
                  </div>
                  <span className="text-xs text-stone-400 font-mono">Ranked by Total Event Points</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
                  {/* #2 SILVER 1ST RUNNER-UP */}
                  {topThreeAthletes[1] && (
                    <div
                      onClick={() => setSelectedAthlete(topThreeAthletes[1])}
                      className="bg-white dark:bg-stone-900 border-2 border-stone-300 dark:border-stone-700/80 rounded-3xl p-6 shadow-sm order-2 md:order-1 hover:scale-[1.02] cursor-pointer transition-all hover:shadow-lg space-y-4 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1.5">
                          <span>🥈</span>
                          <span>#2 Silver Laureate</span>
                        </span>
                        <span className="font-mono text-xs text-stone-400">Rank #2</span>
                      </div>

                      <div className="text-center pt-2">
                        <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-serif font-black text-2xl flex items-center justify-center mx-auto shadow-inner border border-stone-300 dark:border-stone-700">
                          🥈
                        </div>
                        <h4 className="font-serif font-bold text-xl text-stone-900 dark:text-white mt-3">
                          {topThreeAthletes[1].name}
                        </h4>
                        <div className="mt-1 flex items-center justify-center space-x-2">
                          <span className="inline-block font-mono text-xs font-semibold px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700">
                            Enr: {topThreeAthletes[1].enrollment_no}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-stone-500 mt-1">
                          {topThreeAthletes[1].team_name}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 space-y-2 text-center">
                        <div className="text-3xl font-mono font-black text-stone-900 dark:text-white">
                          {topThreeAthletes[1].total_points}{' '}
                          <span className="text-xs text-stone-400 font-sans font-normal uppercase">PTS</span>
                        </div>
                        <div className="flex justify-around text-[11px] pt-1 border-t border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400">
                          <span>Solo: <strong>{topThreeAthletes[1].solo_points}</strong> pts</span>
                          <span className="text-stone-300 dark:text-stone-700">•</span>
                          <span>Team: <strong>{topThreeAthletes[1].team_points}</strong> pts</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs text-stone-500 pt-1">
                        <span>🥇 {topThreeAthletes[1].gold_medals} Gold • 🥈 {topThreeAthletes[1].silver_medals} Silv</span>
                        <span className="text-brand-primary dark:text-amber-400 font-semibold text-[11px] group-hover:underline flex items-center space-x-0.5">
                          <span>Audit Log</span>
                          <ChevronRight size={13} />
                        </span>
                      </div>
                    </div>
                  )}

                  {/* #1 GOLD CHAMPION / BEST ATHLETE */}
                  {topThreeAthletes[0] && (
                    <div
                      onClick={() => setSelectedAthlete(topThreeAthletes[0])}
                      className="bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-white dark:to-stone-900 border-2 border-amber-500 dark:border-amber-400 rounded-3xl p-7 shadow-xl order-1 md:order-2 hover:scale-[1.03] cursor-pointer transition-all hover:shadow-2xl space-y-5 relative group"
                    >
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-[11px] uppercase tracking-wider flex items-center space-x-1.5 shadow-md">
                        <Trophy size={13} />
                        <span>#1 Tournament Best Athlete</span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="px-3 py-1 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1.5">
                          <span>🥇</span>
                          <span>Gold Laureate</span>
                        </span>
                        <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">#1 Champion</span>
                      </div>

                      <div className="text-center pt-1">
                        <div className="w-18 h-18 rounded-3xl bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-serif font-black text-3xl flex items-center justify-center mx-auto shadow-inner border-2 border-amber-300 dark:border-amber-700">
                          🏆
                        </div>
                        <h4 className="font-serif font-black text-2xl text-stone-950 dark:text-white mt-3">
                          {topThreeAthletes[0].name}
                        </h4>
                        <div className="mt-1.5 flex items-center justify-center space-x-2">
                          <span className="inline-block font-mono text-xs font-bold px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-xs">
                            Enr: {topThreeAthletes[0].enrollment_no}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-1.5">
                          {topThreeAthletes[0].team_name}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-stone-950/80 border border-amber-200 dark:border-amber-900/60 space-y-2 text-center">
                        <div className="text-4xl font-mono font-black text-amber-600 dark:text-amber-400">
                          {topThreeAthletes[0].total_points}{' '}
                          <span className="text-xs text-amber-800 dark:text-amber-500 font-sans font-bold uppercase">PTS</span>
                        </div>
                        <div className="flex justify-around text-xs pt-1 border-t border-amber-200 dark:border-amber-900/60 text-stone-700 dark:text-stone-300 font-medium">
                          <span>Solo: <strong className="text-stone-950 dark:text-white">{topThreeAthletes[0].solo_points}</strong> pts</span>
                          <span className="text-amber-300 dark:text-amber-800">•</span>
                          <span>Team: <strong className="text-stone-950 dark:text-white">{topThreeAthletes[0].team_points}</strong> pts</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs font-medium text-stone-600 dark:text-stone-400 pt-1">
                        <span>🥇 {topThreeAthletes[0].gold_medals} Gold • 🥈 {topThreeAthletes[0].silver_medals} Silver</span>
                        <span className="text-amber-700 dark:text-amber-400 font-bold group-hover:underline flex items-center space-x-1">
                          <span>View {topThreeAthletes[0].events_count} Events</span>
                          <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  )}

                  {/* #3 BRONZE 2ND RUNNER-UP */}
                  {topThreeAthletes[2] && (
                    <div
                      onClick={() => setSelectedAthlete(topThreeAthletes[2])}
                      className="bg-white dark:bg-stone-900 border-2 border-orange-200 dark:border-orange-900/50 rounded-3xl p-6 shadow-sm order-3 hover:scale-[1.02] cursor-pointer transition-all hover:shadow-lg space-y-4 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1.5">
                          <span>🥉</span>
                          <span>#3 Bronze Laureate</span>
                        </span>
                        <span className="font-mono text-xs text-stone-400">Rank #3</span>
                      </div>

                      <div className="text-center pt-2">
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950 text-orange-800 dark:text-orange-300 font-serif font-black text-2xl flex items-center justify-center mx-auto shadow-inner border border-orange-200 dark:border-orange-800">
                          🥉
                        </div>
                        <h4 className="font-serif font-bold text-xl text-stone-900 dark:text-white mt-3">
                          {topThreeAthletes[2].name}
                        </h4>
                        <div className="mt-1 flex items-center justify-center space-x-2">
                          <span className="inline-block font-mono text-xs font-semibold px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700">
                            Enr: {topThreeAthletes[2].enrollment_no}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-stone-500 mt-1">
                          {topThreeAthletes[2].team_name}
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 space-y-2 text-center">
                        <div className="text-3xl font-mono font-black text-stone-900 dark:text-white">
                          {topThreeAthletes[2].total_points}{' '}
                          <span className="text-xs text-stone-400 font-sans font-normal uppercase">PTS</span>
                        </div>
                        <div className="flex justify-around text-[11px] pt-1 border-t border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400">
                          <span>Solo: <strong>{topThreeAthletes[2].solo_points}</strong> pts</span>
                          <span className="text-stone-300 dark:text-stone-700">•</span>
                          <span>Team: <strong>{topThreeAthletes[2].team_points}</strong> pts</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs text-stone-500 pt-1">
                        <span>🥇 {topThreeAthletes[2].gold_medals} Gold • 🥈 {topThreeAthletes[2].silver_medals} Silv</span>
                        <span className="text-brand-primary dark:text-amber-400 font-semibold text-[11px] group-hover:underline flex items-center space-x-0.5">
                          <span>Audit Log</span>
                          <ChevronRight size={13} />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ========================================================= */}
              {/* TOP 5 COMPLETE ATHLETE LEADERBOARD TABLE */}
              {/* ========================================================= */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-xs space-y-0">
                <div className="p-5 bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white flex items-center space-x-2">
                      <Medal size={16} className="text-amber-500" />
                      <span>Top 5 Best Individual Athletes Official Standings</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Strictly reflects the top 5 athletes combining solo disciplines and team squad contributions.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-stone-400 bg-stone-100 dark:bg-stone-800 px-2.5 py-1 rounded-lg">
                    Top 5 Ranked Cutoff
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50/50 dark:bg-stone-950/50 text-[11px] font-bold text-stone-500 uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
                      <tr>
                        <th className="py-4 px-5">Rank</th>
                        <th className="py-4 px-5">Student Athlete</th>
                        <th className="py-4 px-4">Enrollment No.</th>
                        <th className="py-4 px-4">House / Team</th>
                        <th className="py-4 px-4 text-center">Solo Pts</th>
                        <th className="py-4 px-4 text-center">Team Pts</th>
                        <th className="py-4 px-4 text-center">Medals (G-S-B)</th>
                        <th className="py-4 px-5 text-right">Total Score</th>
                        <th className="py-4 px-5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                      {topAthletes.map((ath) => {
                        const isTopThree = ath.rank <= 3;
                        return (
                          <tr
                            key={ath.enrollment_no}
                            className={`transition-colors ${
                              ath.rank === 1
                                ? 'bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-50 dark:hover:bg-amber-950/30 font-medium'
                                : ath.rank === 2
                                ? 'bg-stone-50/50 dark:bg-stone-800/20 hover:bg-stone-100/60 dark:hover:bg-stone-800/30'
                                : ath.rank === 3
                                ? 'bg-orange-50/40 dark:bg-orange-950/15 hover:bg-orange-50/70 dark:hover:bg-orange-950/25'
                                : 'hover:bg-stone-50/80 dark:hover:bg-stone-800/40'
                            }`}
                          >
                            <td className="py-4 px-5 font-bold font-mono">
                              {ath.rank === 1 ? (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-400 text-stone-950 font-black text-xs shadow-xs">
                                  <span>🥇 #1</span>
                                </span>
                              ) : ath.rank === 2 ? (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-stone-300 dark:bg-stone-700 text-stone-900 dark:text-stone-100 font-bold text-xs shadow-xs">
                                  <span>🥈 #2</span>
                                </span>
                              ) : ath.rank === 3 ? (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-orange-200 dark:bg-orange-900 text-orange-950 dark:text-orange-200 font-bold text-xs shadow-xs">
                                  <span>🥉 #3</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-mono text-xs">
                                  #{ath.rank}
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-5 font-serif font-bold text-stone-950 dark:text-white">
                              <div>{ath.name}</div>
                              {isTopThree && (
                                <span className="text-[10px] font-sans font-semibold text-amber-600 dark:text-amber-400">
                                  {ath.rank === 1 ? 'Tournament Gold Laureate' : ath.rank === 2 ? 'Silver Laureate' : 'Bronze Laureate'}
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700">
                                {ath.enrollment_no}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-xs font-semibold text-stone-700 dark:text-stone-300">
                              {ath.team_name}
                            </td>
                            <td className="py-4 px-4 text-center font-mono text-xs text-stone-600 dark:text-stone-400">
                              {ath.solo_points} pts
                            </td>
                            <td className="py-4 px-4 text-center font-mono text-xs text-stone-600 dark:text-stone-400">
                              {ath.team_points} pts
                            </td>
                            <td className="py-4 px-4 text-center text-xs font-mono">
                              <span className="text-amber-600 dark:text-amber-400 font-bold">{ath.gold_medals}G</span>
                              <span className="text-stone-400 mx-1">•</span>
                              <span className="text-stone-500 font-semibold">{ath.silver_medals}S</span>
                              <span className="text-stone-400 mx-1">•</span>
                              <span className="text-orange-600 font-semibold">{ath.bronze_medals}B</span>
                            </td>
                            <td className="py-4 px-5 text-right font-mono font-black text-base text-stone-950 dark:text-white">
                              {ath.total_points}{' '}
                              <span className="text-[10px] font-sans font-normal text-stone-400 uppercase">PTS</span>
                            </td>
                            <td className="py-4 px-5 text-center">
                              <button
                                onClick={() => setSelectedAthlete(ath)}
                                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-700 dark:text-stone-300 transition-all cursor-pointer"
                              >
                                View Log
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Historical Archives Callout */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <History size={24} />
              </div>
              <div>
                <h4 className="font-serif font-bold text-stone-900 dark:text-white text-base">
                  Championship Hall of Fame & Archives (2021 – 2025)
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Inspect annual championship rosters, student enrollment IDs, and historic match scores.
                </p>
              </div>
            </div>
            <Link
              to="/archives"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-primary dark:bg-amber-500 hover:bg-stone-800 dark:hover:bg-amber-400 text-white dark:text-stone-950 font-semibold text-xs tracking-wider uppercase transition-all shadow shrink-0 self-start sm:self-auto"
            >
              <span>View Full Archives</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INTER-HOUSE CHAMPIONSHIP STANDINGS */}
      {/* ========================================================================= */}
      {activeTab === 'houses' && (
        <div className="space-y-10">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold font-serif text-stone-950 dark:text-white">
                Inter-House Championship Standings
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Aggregate house scores calculated dynamically from validated point ledger allocations.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs text-stone-500 bg-stone-100 dark:bg-stone-900 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800">
              <Info size={14} className="text-stone-400" />
              <span>Tie-breaker: Total points &gt; 1st Place wins &gt; 2nd Place</span>
            </div>
          </div>

          {loadingHouses ? (
            <div className="py-20 text-center text-stone-500">
              <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm">Calculating house ledger totals...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="py-20 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl text-center p-8">
              <Trophy size={36} className="text-stone-400 mx-auto mb-3" />
              <h3 className="font-serif font-bold text-stone-800 dark:text-stone-200">No score records recorded yet</h3>
              <p className="text-xs text-stone-500 mt-1">Standings will update automatically as competitions conclude.</p>
            </div>
          ) : (
            <>
              {/* House Podium Visual (1st, 2nd, 3rd) */}
              {topThreeHouses.length >= 1 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
                  {/* 2nd Place */}
                  {topThreeHouses[1] && (
                    <div
                      onClick={() => handleOpenBreakdown(topThreeHouses[1].id)}
                      className="bg-white dark:bg-stone-900 border-2 border-stone-300 dark:border-stone-700 rounded-3xl p-6 text-center shadow-xs order-2 md:order-1 hover:scale-[1.02] cursor-pointer transition-transform space-y-3"
                    >
                      <div className="w-12 h-12 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-lg flex items-center justify-center mx-auto shadow-inner">
                        #2
                      </div>
                      <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">{topThreeHouses[1].name}</h3>
                      <div className="text-3xl font-mono font-bold text-stone-900 dark:text-white">
                        {topThreeHouses[1].total_points} <span className="text-xs text-stone-500 font-sans font-normal uppercase">PTS</span>
                      </div>
                      <p className="text-xs text-stone-500">
                        {topThreeHouses[1].first_places} Wins • {topThreeHouses[1].second_places} Runner-ups
                      </p>
                      <button className="text-xs font-semibold text-brand-primary dark:text-amber-400 hover:underline inline-flex items-center space-x-1">
                        <span>Audit Breakdown</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  )}

                  {/* 1st Place (Champion) */}
                  {topThreeHouses[0] && (
                    <div
                      onClick={() => handleOpenBreakdown(topThreeHouses[0].id)}
                      className="bg-gradient-to-b from-amber-500/10 to-transparent dark:from-amber-500/20 bg-white dark:bg-stone-900 border-2 border-amber-400 dark:border-amber-500 rounded-3xl p-8 text-center shadow-md order-1 md:order-2 hover:scale-[1.03] cursor-pointer transition-transform space-y-4 relative"
                    >
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1 shadow-sm">
                        <Trophy size={12} />
                        <span>Tournament Leader</span>
                      </div>
                      <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold text-2xl flex items-center justify-center mx-auto shadow-inner">
                        🏆
                      </div>
                      <h3 className="font-serif font-bold text-2xl text-stone-900 dark:text-white">{topThreeHouses[0].name}</h3>
                      <div className="text-4xl font-mono font-bold text-amber-600 dark:text-amber-400">
                        {topThreeHouses[0].total_points} <span className="text-xs text-stone-500 font-sans font-normal uppercase">PTS</span>
                      </div>
                      <p className="text-xs text-stone-500">
                        {topThreeHouses[0].first_places} Wins • {topThreeHouses[0].event_count} Events Scored
                      </p>
                      <button className="text-xs font-semibold text-brand-primary dark:text-amber-400 hover:underline inline-flex items-center space-x-1">
                        <span>Audit Breakdown</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  )}

                  {/* 3rd Place */}
                  {topThreeHouses[2] && (
                    <div
                      onClick={() => handleOpenBreakdown(topThreeHouses[2].id)}
                      className="bg-white dark:bg-stone-900 border-2 border-orange-200 dark:border-orange-900/50 rounded-3xl p-6 text-center shadow-xs order-3 hover:scale-[1.02] cursor-pointer transition-transform space-y-3"
                    >
                      <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 font-bold text-lg flex items-center justify-center mx-auto shadow-inner">
                        #3
                      </div>
                      <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-white">{topThreeHouses[2].name}</h3>
                      <div className="text-3xl font-mono font-bold text-stone-900 dark:text-white">
                        {topThreeHouses[2].total_points} <span className="text-xs text-stone-500 font-sans font-normal uppercase">PTS</span>
                      </div>
                      <p className="text-xs text-stone-500">
                        {topThreeHouses[2].first_places} Wins • {topThreeHouses[2].third_places} 3rd Places
                      </p>
                      <button className="text-xs font-semibold text-brand-primary dark:text-amber-400 hover:underline inline-flex items-center space-x-1">
                        <span>Audit Breakdown</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Full House Standings Table */}
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-xs">
                <div className="p-4 bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  <span>Overall House Standings</span>
                  <span>Ledger Verified</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50/50 dark:bg-stone-950/50 text-xs font-semibold text-stone-500 dark:text-stone-400 border-b border-stone-100 dark:border-stone-800">
                      <tr>
                        <th className="py-3.5 px-4">Rank</th>
                        <th className="py-3.5 px-4">House</th>
                        <th className="py-3.5 px-4 text-center">Code</th>
                        <th className="py-3.5 px-4 text-center">1st Wins</th>
                        <th className="py-3.5 px-4 text-center">2nd Runner-up</th>
                        <th className="py-3.5 px-4 text-center">3rd Places</th>
                        <th className="py-3.5 px-4 text-center">Events</th>
                        <th className="py-3.5 px-4 text-right">Total Points</th>
                        <th className="py-3.5 px-4 text-center">Ledger Audit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                      {leaderboard.map((team) => (
                        <tr
                          key={team.id}
                          className="hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors"
                        >
                          <td className="py-4 px-4 font-bold font-mono text-stone-900 dark:text-white">
                            #{team.rank}
                          </td>
                          <td className="py-4 px-4 font-serif font-bold text-stone-950 dark:text-white">
                            {team.name}
                          </td>
                          <td className="py-4 px-4 text-center font-mono text-xs text-stone-500">
                            {team.code}
                          </td>
                          <td className="py-4 px-4 text-center font-mono font-medium text-emerald-600 dark:text-emerald-400">
                            {team.first_places}
                          </td>
                          <td className="py-4 px-4 text-center font-mono text-stone-600 dark:text-stone-400">
                            {team.second_places}
                          </td>
                          <td className="py-4 px-4 text-center font-mono text-stone-600 dark:text-stone-400">
                            {team.third_places}
                          </td>
                          <td className="py-4 px-4 text-center font-mono text-stone-600 dark:text-stone-400">
                            {team.event_count}
                          </td>
                          <td className="py-4 px-4 text-right font-mono font-bold text-base text-stone-900 dark:text-white">
                            {team.total_points}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => handleOpenBreakdown(team.id)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
                            >
                              View Breakdown
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ATHLETE EVENT BREAKDOWN AUDIT MODAL */}
      {/* ========================================================================= */}
      {selectedAthlete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex items-start justify-between bg-stone-50 dark:bg-stone-950">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-serif text-2xl font-bold shrink-0">
                  {selectedAthlete.rank === 1 ? '🥇' : selectedAthlete.rank === 2 ? '🥈' : selectedAthlete.rank === 3 ? '🥉' : '🏅'}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      Rank #{selectedAthlete.rank} Athlete
                    </span>
                    <span className="font-mono text-xs font-bold text-stone-600 dark:text-stone-400">
                      Enr: {selectedAthlete.enrollment_no}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-white mt-1">
                    {selectedAthlete.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Affiliation: <span className="font-semibold text-stone-700 dark:text-stone-300">{selectedAthlete.team_name}</span> ({selectedAthlete.team_code})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAthlete(null)}
                className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Score Summary Metrics */}
            <div className="p-6 border-b border-stone-200 dark:border-stone-800 grid grid-cols-3 gap-3 bg-stone-50/50 dark:bg-stone-950/40 text-center">
              <div className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Total Points</span>
                <span className="text-2xl font-mono font-black text-amber-600 dark:text-amber-400">
                  {selectedAthlete.total_points}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Solo Disciplines</span>
                <span className="text-2xl font-mono font-bold text-stone-900 dark:text-white">
                  {selectedAthlete.solo_points} <span className="text-xs font-normal text-stone-400">pts</span>
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Team Squads</span>
                <span className="text-2xl font-mono font-bold text-stone-900 dark:text-white">
                  {selectedAthlete.team_points} <span className="text-xs font-normal text-stone-400">pts</span>
                </span>
              </div>
            </div>

            {/* Events List */}
            <div className="p-6 overflow-y-auto space-y-3">
              <div className="flex justify-between items-center pb-1">
                <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-white">
                  Event Contributions & Match Scores ({selectedAthlete.events.length})
                </h4>
                <div className="text-xs text-stone-400 font-mono">
                  🥇 {selectedAthlete.gold_medals} Gold • 🥈 {selectedAthlete.silver_medals} Silver • 🥉 {selectedAthlete.bronze_medals} Bronze
                </div>
              </div>

              {selectedAthlete.events.map((ev, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ev.event_type === 'Solo'
                          ? 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                          : 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-900'
                      }`}>
                        {ev.event_type}
                      </span>
                      <span className="font-serif font-bold text-stone-900 dark:text-white text-sm">
                        {ev.sport_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-stone-500">
                      <span>{ev.category}</span>
                      <span>•</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">{ev.position}</span>
                      {ev.role && <span className="text-stone-400 font-mono">({ev.role})</span>}
                      {ev.metric && <span className="text-stone-400 font-mono">[{ev.metric}]</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400 block">
                      +{ev.points}
                    </span>
                    <span className="text-[10px] text-stone-400">pts</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-mono">
                Official Student Athlete Performance Audit
              </span>
              <button
                onClick={() => setSelectedAthlete(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 dark:bg-stone-700 dark:hover:bg-stone-600 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HOUSE POINTS BREAKDOWN AUDIT MODAL */}
      {/* ========================================================================= */}
      {selectedBreakdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-brand-primary dark:text-amber-400 uppercase tracking-wider">
                  Verified Points Audit
                </span>
                <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-white mt-1">
                  {selectedBreakdown.team_name} ({selectedBreakdown.team_code})
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Aggregate Score: <span className="font-bold font-mono text-stone-900 dark:text-white">{selectedBreakdown.total_points} Points</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedBreakdown(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3">
              {selectedBreakdown.breakdown.length === 0 ? (
                <p className="text-sm text-stone-500 text-center py-6">No point records registered for this house yet.</p>
              ) : (
                selectedBreakdown.breakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-white font-serif">{item.event_title}</h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {item.category} • <span className="font-semibold text-amber-600 dark:text-amber-400">{item.position}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        +{item.points}
                      </span>
                      <span className="text-[10px] text-stone-400 block">pts</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex justify-end bg-stone-50 dark:bg-stone-950 rounded-b-3xl">
              <button
                onClick={() => setSelectedBreakdown(null)}
                className="px-4 py-2 text-xs font-semibold bg-stone-900 hover:bg-stone-800 dark:bg-stone-800 text-white rounded-xl transition-colors cursor-pointer"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
