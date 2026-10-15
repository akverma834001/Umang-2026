import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { EventItem, FormItem, LeaderboardItem, AuditLogItem } from '../../types';
import {
  Calendar,
  Flame,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  Bell,
  AlertTriangle,
  Trophy,
  History,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { formatISTDateTime } from '../../utils/date';

export const AdminDashboard: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [sportsCount, setSportsCount] = useState<number>(0);
  const [forms, setForms] = useState<FormItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAdminEvents(),
      api.getAdminSports ? api.getAdminSports() : Promise.resolve([]),
      api.getAdminForms(),
      api.getLeaderboard(),
      api.getAdminAuditLogs({ limit: '6' })
    ])
      .then(([evs, sps, frms, lb, logs]) => {
        setEvents(evs);
        setSportsCount(Array.isArray(sps) ? sps.length : 0);
        setForms(frms);
        setLeaderboard(lb);
        setAuditLogs(logs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Compute metrics
  const totalEvents = events.length;
  const upcomingEvents = events.filter(e => e.status === 'UPCOMING').length;
  const completedEvents = events.filter(e => e.status === 'COMPLETED').length;
  const pendingDrafts = events.filter(e => e.published_state === 'DRAFT');
  const formsClosingSoon = forms.filter(f => f.status === 'CLOSING_SOON' || (f.status === 'OPEN' && f.closing_date));

  // Category chart data
  const categoryCounts = events.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.keys(categoryCounts).map(cat => ({
    name: cat,
    count: categoryCounts[cat]
  }));

  // Status chart data
  const statusCounts = [
    { name: 'Upcoming Fixtures', value: upcomingEvents, color: '#3B82F6' },
    { name: 'Completed Matches', value: completedEvents, color: '#10B981' },
    { name: 'Drafts', value: pendingDrafts.length, color: '#F59E0B' },
  ].filter(s => s.value > 0);

  // Leaderboard chart data
  const housePointsData = leaderboard.map(team => ({
    name: team.code,
    fullName: team.name,
    points: team.total_points,
    color: team.color || '#800000'
  }));

  if (loading) {
    return (
      <div className="py-20 text-center text-stone-500">
        <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm">Synthesizing platform analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner / Metrics Overview */}
      <div>
        <h1 className="text-2xl font-bold font-serif text-stone-900 dark:text-white">Admin Command Center</h1>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
          Real-time metrics, draft state monitoring, scoring ledger, and audit feeds.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-stone-500 uppercase">Total Fixtures</span>
            <Calendar size={16} className="text-stone-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-stone-900 dark:text-white mt-2">{totalEvents}</p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">Sports</span>
            <Flame size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-2">{sportsCount}</p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">Scheduled</span>
            <Clock size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-2">{upcomingEvents}</p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Completed</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">{completedEvents}</p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">Pending Drafts</span>
            <AlertTriangle size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-2">{pendingDrafts.length}</p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-stone-500 uppercase">Published Forms</span>
            <FileSpreadsheet size={16} className="text-stone-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-stone-900 dark:text-white mt-2">{forms.length}</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-6 bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
            Events by Category
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#800000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inter-House Points Distribution Chart */}
        <div className="lg:col-span-6 bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
              Points Ledger Distribution
            </h3>
            <Link to="/admin/results" className="text-xs text-brand-primary dark:text-amber-400 hover:underline">
              Manage Scores →
            </Link>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={housePointsData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="points" fill="#D4AF37" radius={[4, 4, 0, 0]}>
                  {housePointsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Draft Action Alerts & Recent Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Drafts Warning Card */}
        <div className="lg:col-span-6 bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                Pending Drafts ({pendingDrafts.length})
              </h3>
            </div>
            <Link to="/admin/events" className="text-xs font-semibold text-brand-primary dark:text-amber-400 hover:underline">
              Open Event Manager
            </Link>
          </div>

          {pendingDrafts.length === 0 ? (
            <p className="text-xs text-stone-500 py-4 text-center">
              All events are currently published or archived. No unpublished drafts pending review.
            </p>
          ) : (
            <div className="space-y-2.5">
              {pendingDrafts.slice(0, 4).map((draft) => (
                <div
                  key={draft.id}
                  className="p-3 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-stone-900 dark:text-white">{draft.title}</span>
                    <span className="text-stone-400 block mt-0.5">{draft.category} • v{draft.version}</span>
                  </div>
                  <Link
                    to="/admin/events"
                    className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 font-semibold"
                  >
                    Review & Publish
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real-time Audit Activity Stream */}
        <div className="lg:col-span-6 bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <History size={18} className="text-stone-500" />
              <h3 className="text-sm font-bold text-stone-900 dark:text-white">
                Recent Administrative Audits
              </h3>
            </div>
            <Link to="/admin/audit" className="text-xs font-semibold text-brand-primary dark:text-amber-400 hover:underline">
              Full Audit Trail
            </Link>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-brand-primary dark:text-amber-400">
                    {log.action}
                  </span>
                  <span className="text-stone-400 block text-[10px]">
                    by @{log.admin_username} • {log.entity_type} #{log.entity_id || ''}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-stone-400">
                  {formatISTDateTime(log.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
