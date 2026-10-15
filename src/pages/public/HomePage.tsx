import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { api } from '../../services/api';
import { EventItem, FormItem, AnnouncementItem, LeaderboardItem, ResultItem, SportItem } from '../../types';
import { formatISTDate, formatISTTime } from '../../utils/date';
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  Award,
  FileSpreadsheet,
  Bell,
  ArrowRight,
  Radio,
  ExternalLink,
  ChevronRight,
  Flame,
  CheckCircle2,
  Users,
  Activity
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { settings } = useSettings();
  const [upcomingMatches, setUpcomingMatches] = useState<EventItem[]>([]);
  const [sports, setSports] = useState<SportItem[]>([]);
  const [openForms, setOpenForms] = useState<FormItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Load public sports meet data
    api.getEvents({ status: 'UPCOMING' }).then((evs) => setUpcomingMatches(evs.slice(0, 6))).catch(console.error);
    api.getSports().then((sp) => setSports(sp.slice(0, 6))).catch(console.error);
    api.getForms().then((forms) => setOpenForms(forms.slice(0, 3))).catch(console.error);
    api.getAnnouncements().then((ann) => setAnnouncements(ann.slice(0, 3))).catch(console.error);
    api.getLeaderboard().then(setLeaderboard).catch(console.error);
  }, []);

  // Countdown calculation based on fest_start_date from Admin Settings
  useEffect(() => {
    const targetDate = settings?.fest_start_date
      ? new Date(`${settings.fest_start_date}T09:00:00+05:30`)
      : new Date('2026-10-15T09:00:00+05:30');

    const updateTimer = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [settings?.fest_start_date]);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO SECTION WITH SBU RANCHI MONOGRAM */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-white py-16 sm:py-24 border-b border-stone-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#800000_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Branding & Intro */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <img src="/sbu-emblem.png" alt="SBU Logo" className="w-5 h-5 rounded-full object-contain bg-white/10" />
                <span>SARALA BIRLA UNIVERSITY, RANCHI</span>
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl sm:text-6xl font-extrabold font-serif tracking-tight leading-tight">
                  {settings?.fest_name || "SBU UMANG 2026"}
                </h1>
                <p className="text-lg sm:text-2xl font-bold text-amber-400 font-serif">
                  Annual Inter-House Sports Championship
                </p>
              </div>

              <p className="text-sm sm:text-base text-stone-300 max-w-2xl leading-relaxed">
                {settings?.fest_tagline ||
                  "The premier collegiate sports meet where Vishvesvaraya, Chanakya, Patanjali, and Ramanujan houses compete for glory across 13 athletic and team sports disciplines."}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/schedule"
                  className="px-6 py-3 rounded-xl bg-brand-primary hover:bg-stone-800 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-lg border border-amber-500/40 flex items-center space-x-2"
                >
                  <Calendar size={15} />
                  <span>View Fixtures & Schedule</span>
                </Link>
                <Link
                  to="/sports"
                  className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs tracking-wider uppercase backdrop-blur transition-all border border-white/15"
                >
                  Sports Disciplines
                </Link>
                <Link
                  to="/archives"
                  className="px-6 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs tracking-wider uppercase backdrop-blur transition-all border border-amber-500/30 flex items-center space-x-1.5"
                >
                  <Trophy size={14} className="text-amber-400" />
                  <span>5-Year Archives</span>
                </Link>
                <Link
                  to="/registrations"
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs tracking-wider uppercase transition-all shadow-md flex items-center space-x-1.5"
                >
                  <span>Register via Google Forms</span>
                  <ExternalLink size={13} />
                </Link>
              </div>
            </div>

            {/* Right: Countdown & SBU Monogram Spotlight Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-stone-950/80 border border-stone-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl max-w-md w-full text-center space-y-6">
                <div className="flex flex-col items-center space-y-2">
                  <img
                    src="/sbu-emblem.png"
                    alt="Sarala Birla University Official Crest"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full shadow-lg border-2 border-amber-500/40 p-1.5 bg-white object-contain"
                  />
                  <h3 className="font-serif font-bold text-sm tracking-wider uppercase text-amber-400">
                    Championship Countdown
                  </h3>
                  <p className="text-[11px] text-stone-400">Opening Ceremony & Torch Lighting</p>
                </div>

                {/* Countdown Grid */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-stone-900/90 rounded-2xl p-3 border border-stone-800">
                    <span className="text-2xl sm:text-4xl font-extrabold text-amber-400 font-mono">{countdown.days}</span>
                    <p className="text-[10px] text-stone-400 font-medium uppercase mt-1">Days</p>
                  </div>
                  <div className="bg-stone-900/90 rounded-2xl p-3 border border-stone-800">
                    <span className="text-2xl sm:text-4xl font-extrabold text-white font-mono">{countdown.hours}</span>
                    <p className="text-[10px] text-stone-400 font-medium uppercase mt-1">Hours</p>
                  </div>
                  <div className="bg-stone-900/90 rounded-2xl p-3 border border-stone-800">
                    <span className="text-2xl sm:text-4xl font-extrabold text-white font-mono">{countdown.minutes}</span>
                    <p className="text-[10px] text-stone-400 font-medium uppercase mt-1">Mins</p>
                  </div>
                  <div className="bg-stone-900/90 rounded-2xl p-3 border border-stone-800">
                    <span className="text-2xl sm:text-4xl font-extrabold text-amber-500 font-mono">{countdown.seconds}</span>
                    <p className="text-[10px] text-stone-400 font-medium uppercase mt-1">Secs</p>
                  </div>
                </div>

                <div className="text-xs text-stone-400 space-y-1.5 pt-2">
                  <div className="flex justify-between">
                    <span>Scheduled Date:</span>
                    <span className="text-white font-semibold">{settings?.fest_start_date ? formatISTDate(settings.fest_start_date) : 'October 15, 2026'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sports Venue Hub:</span>
                    <span className="text-white font-semibold">SBU Athletics Stadium & Arena</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. UPCOMING TOURNAMENT FIXTURES SPOTLIGHT */}
      {upcomingMatches.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-amber-400 font-bold text-xs tracking-wider flex items-center space-x-1.5">
                  <Calendar size={13} />
                  <span>SCHEDULED FIXTURES</span>
                </span>
                <h2 className="text-xl font-bold font-serif text-stone-900 dark:text-white">
                  Featured Inter-House Matches
                </h2>
              </div>
              <Link
                to="/schedule"
                className="text-xs font-semibold text-brand-primary dark:text-amber-400 hover:underline flex items-center space-x-1"
              >
                <span>View Full Timetable</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingMatches.slice(0, 3).map((match) => (
                <div
                  key={match.id}
                  className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-3"
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500">
                    <span className="text-amber-600 dark:text-amber-400 uppercase font-bold">{match.category}</span>
                    <span>{formatISTDate(match.event_date)} • {match.start_time} IST</span>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-white line-clamp-1">
                    {match.title}
                  </h4>

                  {match.team_a && match.team_b && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
                      <span className="font-bold truncate" style={{ color: match.team_a.color }}>
                        {match.team_a.name}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono uppercase px-1">VS</span>
                      <span className="font-bold truncate" style={{ color: match.team_b.color }}>
                        {match.team_b.name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
                    <span className="flex items-center space-x-1">
                      <MapPin size={12} />
                      <span className="truncate">{match.venue?.name || 'SBU Sports Complex'}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-[10px] font-medium text-stone-700 dark:text-stone-300">
                      {match.round || 'League'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. INTER-HOUSE CHAMPIONSHIP STANDINGS PODIUM PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              OFFICIAL SBU STANDINGS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-white">
              Inter-House Leaderboard
            </h2>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              to="/leaderboard"
              className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/25 transition-colors flex items-center space-x-1"
            >
              <span>🏅 Top 5 Athletes</span>
              <ChevronRight size={12} />
            </Link>
            <Link
              to="/archives"
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center space-x-1"
            >
              <span>Past 5-Year History</span>
              <ChevronRight size={14} />
            </Link>
            <span className="text-stone-300 dark:text-stone-700">|</span>
            <Link
              to="/leaderboard"
              className="text-xs font-semibold text-brand-primary dark:text-amber-400 hover:underline flex items-center space-x-1"
            >
              <span>Full Points Table</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {leaderboard.slice(0, 4).map((team) => (
            <div
              key={team.id}
              className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden space-y-4"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: team.color }}
              ></div>

              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-xs flex items-center justify-center font-mono">
                  #{team.rank}
                </span>
                <span className="text-2xl font-black font-mono text-stone-900 dark:text-white">
                  {team.total_points} <span className="text-xs font-medium text-stone-400">PTS</span>
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white leading-snug">
                  {team.name}
                </h3>
                <p className="text-xs text-stone-500 font-semibold">{team.code}</p>
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-between text-[11px] text-stone-500 font-medium">
                <span>🥇 {team.first_places} Wins</span>
                <span>🥈 {team.second_places} Runner</span>
                <span>🥉 {team.third_places} Third</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SPORTS DISCIPLINES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-xs font-bold text-brand-primary dark:text-amber-400 uppercase tracking-wider">
              TOURNAMENT CATALOG
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 dark:text-white">
              Featured Sports Disciplines
            </h2>
          </div>
          <Link
            to="/sports"
            className="text-xs font-semibold text-brand-primary dark:text-amber-400 hover:underline flex items-center space-x-1"
          >
            <span>View All Sports & Rules</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sports.map((sport) => (
            <Link
              key={sport.id}
              to="/sports"
              className="group p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold">
                  {sport.category}
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">{sport.gender}</span>
              </div>
              <h3 className="text-lg font-bold font-serif text-stone-900 dark:text-white group-hover:text-brand-primary dark:group-hover:text-amber-400 transition-colors">
                {sport.name}
              </h3>
              <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                {sport.description || 'Inter-house championship competition.'}
              </p>
              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center text-xs text-stone-400">
                <span>{sport.venue?.name || 'Campus Arena'}</span>
                <span className="font-semibold text-brand-primary dark:text-amber-400 flex items-center space-x-0.5">
                  <span>Rules</span>
                  <ChevronRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SBU RANCHI CAMPUS & ATHLETIC INFRASTRUCTURE SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-stone-900 via-brand-primary/40 to-stone-950 text-white p-8 sm:p-12 border border-stone-800 shadow-xl space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-stone-800/80 pb-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold border border-amber-400/30">
                <MapPin size={12} />
                <span>60-ACRE BIRLA CAMPUS • MAHILONG, RANCHI</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold font-serif text-white">
                World-Class University Sports Infrastructure
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Situated amidst verdant surroundings at Birla Campus, Ara, Mahilong on the Ranchi-Purulia Highway. SBU sports facilities empower students with holistic <em>"education for life"</em>.
              </p>
            </div>
            <a
              href="https://sbu.ac.in"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs tracking-wider uppercase transition-all shadow-md flex items-center space-x-2 flex-shrink-0"
            >
              <span>Visit SBU.AC.IN</span>
              <ExternalLink size={13} />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800">
              <span className="text-lg font-bold text-amber-400 block font-serif">4 Courts</span>
              <span className="text-xs font-semibold text-white block mt-0.5">AstroTurf Volleyball</span>
              <span className="text-[10px] text-stone-400 block mt-1">Specialized Turf Flooring</span>
            </div>
            <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800">
              <span className="text-lg font-bold text-amber-400 block font-serif">Regulation</span>
              <span className="text-xs font-semibold text-white block mt-0.5">Football Arena</span>
              <span className="text-[10px] text-stone-400 block mt-1">Lush Green Turf Ground</span>
            </div>
            <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800">
              <span className="text-lg font-bold text-amber-400 block font-serif">Turf & Nets</span>
              <span className="text-xs font-semibold text-white block mt-0.5">Cricket Arena</span>
              <span className="text-[10px] text-stone-400 block mt-1">Practice Nets & Pavilion</span>
            </div>
            <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800">
              <span className="text-lg font-bold text-amber-400 block font-serif">Concrete</span>
              <span className="text-xs font-semibold text-white block mt-0.5">Basketball Courts</span>
              <span className="text-[10px] text-stone-400 block mt-1">Championship Standards</span>
            </div>
            <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800">
              <span className="text-lg font-bold text-amber-400 block font-serif">Indoor</span>
              <span className="text-xs font-semibold text-white block mt-0.5">Racquet Hall</span>
              <span className="text-[10px] text-stone-400 block mt-1">Badminton & Table Tennis</span>
            </div>
            <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800">
              <span className="text-lg font-bold text-amber-400 block font-serif">400m Track</span>
              <span className="text-xs font-semibold text-white block mt-0.5">Athletics Complex</span>
              <span className="text-[10px] text-stone-400 block mt-1">Sprints, Relays & Shot Put</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. UPCOMING FIXTURES & NOTICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Upcoming Matches */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold font-serif text-stone-900 dark:text-white flex items-center space-x-2">
              <Calendar size={18} className="text-brand-primary" />
              <span>Upcoming Match Fixtures</span>
            </h3>
            <Link to="/schedule" className="text-xs text-brand-primary font-semibold hover:underline">
              Full Schedule
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingMatches.map((ev) => (
              <div
                key={ev.id}
                className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-[11px] font-semibold text-stone-500">
                    <span>{formatISTDate(ev.event_date)}</span>
                    <span>•</span>
                    <span>{ev.start_time} - {ev.end_time} IST</span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-white">{ev.title}</h4>
                  <p className="text-xs text-stone-500 flex items-center space-x-1">
                    <MapPin size={12} />
                    <span>{ev.venue?.name || 'Main Grounds'}</span>
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 self-start sm:self-center">
                  {ev.round || 'Scheduled'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Urgent Announcements & Google Forms */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold font-serif text-stone-900 dark:text-white flex items-center space-x-2">
              <Bell size={18} className="text-amber-500" />
              <span>Announcements & Forms</span>
            </h3>
            <Link to="/announcements" className="text-xs text-brand-primary font-semibold hover:underline">
              All Notices
            </Link>
          </div>

          <div className="space-y-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-1.5"
              >
                <div className="flex justify-between text-[11px]">
                  <span className="font-semibold text-amber-600 dark:text-amber-400 uppercase">
                    {ann.category}
                  </span>
                  <span className="text-stone-400">{formatISTDate(ann.published_at)}</span>
                </div>
                <h5 className="font-bold text-xs text-stone-900 dark:text-white leading-tight">{ann.title}</h5>
                <p className="text-xs text-stone-500 line-clamp-2">{ann.description}</p>
              </div>
            ))}

            {openForms.slice(0, 2).map((form) => (
              <div
                key={form.id}
                className="p-4 rounded-2xl bg-brand-primary/5 dark:bg-brand-primary/10 border border-brand-primary/20 space-y-2"
              >
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-brand-primary dark:text-amber-400 uppercase">Registration Open</span>
                  <span className="text-stone-400 font-mono">Closes in {form.closing_date ? formatISTDate(form.closing_date) : 'Soon'}</span>
                </div>
                <h5 className="font-bold text-xs text-stone-900 dark:text-white">{form.title}</h5>
                <a
                  href={form.form_url || form.google_form_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-brand-primary dark:text-amber-400 hover:underline pt-1"
                >
                  <span>Submit Entry on Google Form</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
