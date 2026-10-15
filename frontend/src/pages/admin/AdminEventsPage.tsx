import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { EventItem, VenueItem, SportItem, TeamItem } from '../../types';
import { formatISTDate, formatISTTime } from '../../utils/date';
import {
  Plus,
  Edit,
  Trash2,
  Archive,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  Search,
  Flame,
  Calendar,
  MapPin
} from 'lucide-react';

export const AdminEventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [sports, setSports] = useState<SportItem[]>([]);
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [filterState, setFilterState] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Match Form state
  const [formData, setFormData] = useState({
    sport_id: 1,
    title: '',
    description: '',
    category: 'Sports',
    gender: 'Boys',
    event_type: 'Match-based',
    stage: 'LEAGUE',
    round: 'League Match 1',
    team_a_id: undefined as number | undefined,
    team_b_id: undefined as number | undefined,
    venue_id: 1,
    event_date: '2026-10-15',
    start_time: '10:00',
    end_time: '11:30',
    rules: '',
    status: 'UPCOMING' as 'UPCOMING' | 'COMPLETED' | 'POSTPONED' | 'CANCELLED',
    published_state: 'DRAFT' as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [evList, spList, vnList, tmList] = await Promise.all([
        api.getAdminEvents(filterState !== 'ALL' ? filterState : undefined),
        api.getAdminSports().catch(() => api.getSports()),
        api.getAdminVenues(),
        api.getAdminTeams(),
      ]);
      setEvents(evList);
      setSports(spList);
      setVenues(vnList);
      setTeams(tmList);
    } catch (err: any) {
      setError(err.message || 'Failed to load sports fixtures.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterState]);

  // Real-time schedule conflict check
  const checkScheduleConflict = async (venue_id: number, date: string, start: string, end: string, exclude_id?: number) => {
    try {
      const res = await api.checkConflict({
        venue_id,
        event_date: date,
        start_time: start,
        end_time: end,
        exclude_event_id: exclude_id
      });
      if (res.has_conflict && res.conflicts.length > 0) {
        setConflictWarning(`⚠️ Schedule Conflict: Venue booked for '${res.conflicts[0].title}' (${res.conflicts[0].start_time} - ${res.conflicts[0].end_time})`);
      } else {
        setConflictWarning(null);
      }
    } catch {
      setConflictWarning(null);
    }
  };

  const handleOpenCreate = () => {
    const defaultSport = sports[0];
    const teamA = teams[0]?.id;
    const teamB = teams[1]?.id;

    setFormData({
      sport_id: defaultSport?.id || 1,
      title: defaultSport ? `${defaultSport.name} Fixture` : 'Inter-House Fixture',
      description: 'Official SBU UMANG Sports Meet Tournament Fixture',
      category: 'Sports',
      gender: defaultSport?.gender || 'Boys',
      event_type: defaultSport?.sport_type || 'Match-based',
      stage: 'LEAGUE',
      round: 'League Match 1',
      team_a_id: teamA,
      team_b_id: teamB,
      venue_id: defaultSport?.venue_id || defaultSport?.default_venue_id || venues[0]?.id || 1,
      event_date: '2026-10-15',
      start_time: '10:00',
      end_time: '11:30',
      rules: defaultSport?.rules || '',
      status: 'UPCOMING',
      published_state: 'DRAFT',
    });
    setConflictWarning(null);
    setIsCreateOpen(true);
  };

  const handleSportChange = (sportId: number) => {
    const sp = sports.find(s => s.id === sportId);
    if (!sp) return;
    setFormData(prev => ({
      ...prev,
      sport_id: sportId,
      gender: sp.gender || prev.gender,
      event_type: sp.sport_type || prev.event_type,
      venue_id: sp.venue_id || sp.default_venue_id || prev.venue_id,
      title: `${sp.name} — ${teams.find(t => t.id === prev.team_a_id)?.name || 'House A'} vs ${teams.find(t => t.id === prev.team_b_id)?.name || 'House B'}`
    }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.createAdminEvent(formData);
      setSuccess(`Match fixture '${formData.title}' created successfully.`);
      setIsCreateOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to create match fixture.');
    }
  };

  const handleOpenEdit = (ev: EventItem) => {
    setEditingEvent(ev);
    setFormData({
      sport_id: ev.sport_id || (sports[0]?.id || 1),
      title: ev.title,
      description: ev.description,
      category: ev.category || 'Sports',
      gender: ev.gender || 'Boys',
      event_type: ev.event_type || 'Match-based',
      stage: ev.stage || 'LEAGUE',
      round: ev.round || '',
      team_a_id: ev.team_a_id,
      team_b_id: ev.team_b_id,
      venue_id: ev.venue_id || (venues[0]?.id || 1),
      event_date: ev.event_date,
      start_time: ev.start_time,
      end_time: ev.end_time,
      rules: ev.rules || '',
      status: ev.status === 'LIVE' ? 'UPCOMING' : (ev.status as any),
      published_state: ev.published_state,
    });
    setConflictWarning(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    setError(null);
    try {
      await api.updateAdminEvent(editingEvent.id, {
        ...formData,
        version: editingEvent.version,
        override_status_check: true
      });
      setSuccess(`Fixture '${formData.title}' updated successfully.`);
      setEditingEvent(null);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to update fixture.');
    }
  };

  const handleArchive = async (id: number) => {
    if (!confirm('Archive this fixture? It will be safely preserved in history.')) return;
    try {
      await api.archiveAdminEvent(id);
      setSuccess('Fixture moved to historical archives.');
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Archival failed.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Permanently delete this draft fixture?')) return;
    try {
      await api.deleteAdminEvent(id);
      setSuccess('Draft fixture removed.');
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Delete failed.');
    }
  };

  const filteredEvents = events.filter((ev) => {
    if (filterStatus !== 'ALL' && ev.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        ev.title.toLowerCase().includes(q) ||
        (ev.sport_name && ev.sport_name.toLowerCase().includes(q)) ||
        (ev.team_a_name && ev.team_a_name.toLowerCase().includes(q)) ||
        (ev.team_b_name && ev.team_b_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 dark:text-white flex items-center space-x-2">
            <span>Matches & Fixtures Manager</span>
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Inter-House sports fixtures, real-time venue conflict guards, and official tournament timetables.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-stone-800 text-white text-xs font-semibold flex items-center space-x-2 transition-colors shadow-sm"
        >
          <Plus size={16} />
          <span>Create Match Fixture</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex justify-between items-center">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}><X size={14} /></button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
        {/* Publication Tabs */}
        <div className="flex items-center space-x-1 text-xs font-semibold">
          {['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterState(st)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterState === st
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Status Filters & Search */}
        <div className="flex items-center space-x-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-700 dark:text-stone-300"
          >
            <option value="ALL">All Statuses</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="COMPLETED">Completed</option>
            <option value="POSTPONED">Postponed</option>
          </select>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search sports or house..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg text-xs text-stone-900 dark:text-white w-48 focus:w-60 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Fixtures Table */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 text-center text-stone-500 text-xs">Loading sports meet schedule...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-16 text-center text-stone-500 text-xs">
            No match fixtures found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-950 text-stone-500 uppercase font-semibold border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="py-3 px-4">Sport / Matchup</th>
                  <th className="py-3 px-4">Division & Stage</th>
                  <th className="py-3 px-4">Venue & Timetable</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Pub State</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                    {/* Matchup */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900 dark:text-white flex items-center space-x-2">
                        <Flame size={14} className="text-amber-500 shrink-0" />
                        <span>{ev.title}</span>
                      </div>
                      {ev.team_a_name && ev.team_b_name && (
                        <div className="text-[11px] text-stone-500 mt-1 flex items-center space-x-1.5">
                          <span className="font-medium text-stone-700 dark:text-stone-300">{ev.team_a_name}</span>
                          <span className="text-stone-400">vs</span>
                          <span className="font-medium text-stone-700 dark:text-stone-300">{ev.team_b_name}</span>
                        </div>
                      )}
                    </td>

                    {/* Division & Stage */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-stone-800 dark:text-stone-200">
                        {ev.gender ? `${ev.gender}` : 'Open'}
                      </div>
                      <div className="text-[10px] text-stone-400 uppercase tracking-wider">
                        {ev.stage || 'LEAGUE'} • {ev.round || 'MATCH'}
                      </div>
                    </td>

                    {/* Venue & Time */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-stone-800 dark:text-stone-200">{ev.venue_name || ev.venue?.name}</div>
                      <div className="text-[11px] text-stone-500 font-mono">
                        {formatISTDate(ev.event_date)} • {formatISTTime(ev.start_time)} - {formatISTTime(ev.end_time)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      {ev.status === 'COMPLETED' ? (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                          COMPLETED
                        </span>
                      ) : ev.status === 'CANCELLED' ? (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900">
                          CANCELLED
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                          SCHEDULED
                        </span>
                      )}
                    </td>

                    {/* Pub State */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          ev.published_state === 'PUBLISHED'
                            ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                            : ev.published_state === 'ARCHIVED'
                            ? 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                            : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {ev.published_state}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(ev)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800"
                        title="Edit Fixture"
                      >
                        <Edit size={14} />
                      </button>
                      {ev.published_state !== 'ARCHIVED' && (
                        <button
                          onClick={() => handleArchive(ev.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-amber-600 hover:bg-stone-100 dark:hover:bg-stone-800"
                          title="Archive"
                        >
                          <Archive size={14} />
                        </button>
                      )}
                      {ev.published_state === 'DRAFT' && (
                        <button
                          onClick={() => handleDelete(ev.id)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                          title="Delete Draft"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE & EDIT MODAL */}
      {(isCreateOpen || editingEvent) && (
        <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                {editingEvent ? 'Modify Sports Fixture' : 'Schedule New Match / Track Event'}
              </h3>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingEvent(null);
                }}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {conflictWarning && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-600 dark:text-amber-400 text-xs flex items-center space-x-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{conflictWarning}</span>
              </div>
            )}

            <form onSubmit={editingEvent ? handleEditSubmit : handleCreateSubmit} className="space-y-4 text-xs">
              {/* Sport Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase block mb-1">
                    Sport Discipline
                  </label>
                  <select
                    value={formData.sport_id}
                    onChange={(e) => handleSportChange(Number(e.target.value))}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                  >
                    {sports.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase block mb-1">
                    Division / Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                  >
                    <option value="Boys">Boys / Men's Division</option>
                    <option value="Girls">Girls / Women's Division</option>
                    <option value="Mixed">Mixed / Open</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase block mb-1">
                  Match / Event Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Basketball Men's — Vishvesvaraya vs Chanakya"
                  className="w-full p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                />
              </div>

              {/* Inter-House Matchup Teams */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-stone-50 dark:bg-stone-950/60 rounded-xl border border-stone-200 dark:border-stone-800">
                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase block mb-1">
                    House A
                  </label>
                  <select
                    value={formData.team_a_id || ''}
                    onChange={(e) => setFormData({ ...formData, team_a_id: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                  >
                    <option value="">None / Solo Track Event</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase block mb-1">
                    House B
                  </label>
                  <select
                    value={formData.team_b_id || ''}
                    onChange={(e) => setFormData({ ...formData, team_b_id: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                  >
                    <option value="">None / Solo Track Event</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stage & Round */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase block mb-1">Tournament Stage</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                  >
                    <option value="LEAGUE">League Stage</option>
                    <option value="QUARTERFINAL">Quarter-Final</option>
                    <option value="SEMIFINAL">Semi-Final</option>
                    <option value="FINAL">Grand Final</option>
                    <option value="HEATS">Preliminary Heats</option>
                    <option value="KNOCKOUT">Knockout</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase block mb-1">Round Detail</label>
                  <input
                    type="text"
                    value={formData.round}
                    onChange={(e) => setFormData({ ...formData, round: e.target.value })}
                    placeholder="e.g., Match 1, Heat 2, Final"
                    className="w-full p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Venue & Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase block mb-1">Sports Venue</label>
                  <select
                    value={formData.venue_id}
                    onChange={(e) => {
                      const vId = Number(e.target.value);
                      setFormData({ ...formData, venue_id: vId });
                      checkScheduleConflict(vId, formData.event_date, formData.start_time, formData.end_time, editingEvent?.id);
                    }}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                  >
                    {venues.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.event_date}
                    onChange={(e) => {
                      const d = e.target.value;
                      setFormData({ ...formData, event_date: d });
                      checkScheduleConflict(formData.venue_id, d, formData.start_time, formData.end_time, editingEvent?.id);
                    }}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase block mb-1">Time (Start - End)</label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="time"
                      required
                      value={formData.start_time}
                      onChange={(e) => {
                        const st = e.target.value;
                        setFormData({ ...formData, start_time: st });
                        checkScheduleConflict(formData.venue_id, formData.event_date, st, formData.end_time, editingEvent?.id);
                      }}
                      className="w-1/2 p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white font-mono"
                    />
                    <span className="text-stone-400">-</span>
                    <input
                      type="time"
                      required
                      value={formData.end_time}
                      onChange={(e) => {
                        const et = e.target.value;
                        setFormData({ ...formData, end_time: et });
                        checkScheduleConflict(formData.venue_id, formData.event_date, formData.start_time, et, editingEvent?.id);
                      }}
                      className="w-1/2 p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Publication */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase block mb-1">Match Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                  >
                    <option value="UPCOMING">Upcoming / Scheduled</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="POSTPONED">Postponed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase block mb-1">Publish State</label>
                  <select
                    value={formData.published_state}
                    onChange={(e) => setFormData({ ...formData, published_state: e.target.value as any })}
                    className="w-full p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                  >
                    <option value="DRAFT">DRAFT (Admin Only)</option>
                    <option value="PUBLISHED">PUBLISHED (Visible to Public)</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              {/* Rules / Specific Instructions */}
              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase block mb-1">Match Regulations / Equipment Notes</label>
                <textarea
                  rows={3}
                  value={formData.rules}
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  placeholder="Official sporting regulations, duration, equipment requirements..."
                  className="w-full p-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingEvent(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-brand-primary hover:bg-stone-800 text-white font-semibold shadow-sm"
                >
                  {editingEvent ? 'Save Changes' : 'Schedule Fixture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
