import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ResultItem, EventItem, TeamItem } from '../../types';
import { Award, Plus, Edit, Trash2, ShieldAlert, CheckCircle, AlertCircle, X, History } from 'lucide-react';
import { formatISTDateTime } from '../../utils/date';

export const AdminResultsPage: React.FC = () => {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<ResultItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    event_id: 1,
    category: 'Main Championship',
    winner_team_id: 1,
    winner_points: 10,
    winner_participant: '',
    winner_enrollment_no: '',
    winner_players: '',
    winner_metric: '',
    runner_up_team_id: 2,
    runner_up_points: 7,
    runner_up_participant: '',
    runner_up_enrollment_no: '',
    runner_up_players: '',
    runner_up_metric: '',
    third_place_team_id: 3,
    third_place_points: 5,
    third_place_participant: '',
    third_place_enrollment_no: '',
    third_place_players: '',
    third_place_metric: '',
    remarks: '',
    published_state: 'PUBLISHED',
  });

  const [confirmationChecked, setConfirmationChecked] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.getAdminResults(),
      api.getAdminEvents(),
      api.getAdminTeams(),
      api.getSettings().catch(() => null),
    ])
      .then(([resList, evList, tmList, sett]) => {
        setResults(resList);
        setEvents(evList);
        setTeams(tmList);
        const p1 = sett?.points_first_place ?? 10;
        const p2 = sett?.points_second_place ?? 7;
        const p3 = sett?.points_third_place ?? 5;
        if (evList.length > 0) setFormData(f => ({ ...f, event_id: evList[0].id }));
        if (tmList.length >= 3) {
          setFormData(f => ({
            ...f,
            winner_team_id: tmList[0].id,
            winner_points: p1,
            runner_up_team_id: tmList[1].id,
            runner_up_points: p2,
            third_place_team_id: tmList[2].id,
            third_place_points: p3
          }));
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setError(null);
    setFormData({
      event_id: events[0]?.id || 1,
      category: 'Main Championship',
      winner_team_id: teams[0]?.id || 1,
      winner_points: 10,
      winner_participant: '',
      winner_enrollment_no: '',
      winner_players: '',
      winner_metric: '',
      runner_up_team_id: teams[1]?.id || 2,
      runner_up_points: 7,
      runner_up_participant: '',
      runner_up_enrollment_no: '',
      runner_up_players: '',
      runner_up_metric: '',
      third_place_team_id: teams[2]?.id || 3,
      third_place_points: 5,
      third_place_participant: '',
      third_place_enrollment_no: '',
      third_place_players: '',
      third_place_metric: '',
      remarks: '',
      published_state: 'PUBLISHED',
    });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.createResult(formData);
      setSuccess('Competition result and point ledger rows successfully created.');
      setIsCreateOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleOpenEdit = (res: ResultItem) => {
    setError(null);
    setEditingResult(res);
    setFormData({
      event_id: res.event_id,
      category: res.category,
      winner_team_id: res.winner_team_id,
      winner_points: res.winner_points,
      winner_participant: res.winner_participant || '',
      winner_enrollment_no: res.winner_enrollment_no || '',
      winner_players: res.winner_players || '',
      winner_metric: res.winner_metric || '',
      runner_up_team_id: res.runner_up_team_id || (teams[1]?.id || 2),
      runner_up_points: res.runner_up_points,
      runner_up_participant: res.runner_up_participant || '',
      runner_up_enrollment_no: res.runner_up_enrollment_no || '',
      runner_up_players: res.runner_up_players || '',
      runner_up_metric: res.runner_up_metric || '',
      third_place_team_id: res.third_place_team_id || (teams[2]?.id || 3),
      third_place_points: res.third_place_points,
      third_place_participant: res.third_place_participant || '',
      third_place_enrollment_no: res.third_place_enrollment_no || '',
      third_place_players: res.third_place_players || '',
      third_place_metric: res.third_place_metric || '',
      remarks: res.remarks || '',
      published_state: res.published_state,
    });
    setConfirmationChecked(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResult) return;
    setError(null);

    if (editingResult.published_state === 'PUBLISHED' && !confirmationChecked) {
      setError('You must check the score confirmation box to authorize changing a published result.');
      return;
    }

    try {
      await api.updateResult(editingResult.id, {
        winner_team_id: formData.winner_team_id,
        winner_points: formData.winner_points,
        winner_participant: formData.winner_participant,
        winner_enrollment_no: formData.winner_enrollment_no,
        winner_players: formData.winner_players,
        winner_metric: formData.winner_metric,
        runner_up_team_id: formData.runner_up_team_id,
        runner_up_points: formData.runner_up_points,
        runner_up_participant: formData.runner_up_participant,
        runner_up_enrollment_no: formData.runner_up_enrollment_no,
        runner_up_players: formData.runner_up_players,
        runner_up_metric: formData.runner_up_metric,
        third_place_team_id: formData.third_place_team_id,
        third_place_points: formData.third_place_points,
        third_place_participant: formData.third_place_participant,
        third_place_enrollment_no: formData.third_place_enrollment_no,
        third_place_players: formData.third_place_players,
        third_place_metric: formData.third_place_metric,
        remarks: formData.remarks,
        published_state: formData.published_state,
        version: editingResult.version,
        confirmation: confirmationChecked
      });
      setSuccess('Result score corrected and point ledger recalculated.');
      setEditingResult(null);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this draft result? Note: Published results cannot be hard deleted; please use point correction to maintain ledger audit.')) return;
    try {
      await api.deleteResult(id);
      setSuccess('Draft result removed.');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 dark:text-white">Competition Results & Point Ledger</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Results automatically synchronize point ledger rows. Modifying published results requires confirmation.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-brand-primary hover:bg-stone-800 text-white text-xs font-semibold flex items-center space-x-2 transition-colors shadow-sm"
        >
          <Plus size={16} />
          <span>Award Competition Result</span>
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

      {/* Results Table */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 dark:bg-stone-950 text-xs font-semibold text-stone-500 uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="py-3.5 px-4">Event & Category</th>
                <th className="py-3.5 px-4">Winner (1st)</th>
                <th className="py-3.5 px-4">Runner-up (2nd)</th>
                <th className="py-3.5 px-4">3rd Place</th>
                <th className="py-3.5 px-4 text-center">State</th>
                <th className="py-3.5 px-4 text-center">Ver</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {results.map((r) => (
                <tr key={r.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-serif font-bold text-stone-900 dark:text-white">{r.event_title}</div>
                    <div className="text-xs text-stone-500">{r.category}</div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-amber-600 dark:text-amber-400">🏆 {r.winner_team_name}</div>
                    {r.winner_participant && (
                      <div className="text-xs text-stone-700 dark:text-stone-300 font-medium">{r.winner_participant}</div>
                    )}
                    {r.winner_enrollment_no && (
                      <span className="inline-block mt-0.5 font-mono text-[10px] text-amber-900 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 px-1.5 py-0.5 rounded">
                        {r.winner_enrollment_no}
                      </span>
                    )}
                    {r.winner_players && (
                      <span className="inline-block ml-1 mt-0.5 text-[9px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                        👥 Squad
                      </span>
                    )}
                    <div className="text-xs font-mono text-stone-500 mt-0.5">
                      +{r.winner_points} pts {r.winner_metric && `• ${r.winner_metric}`}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs">
                    <div className="text-stone-700 dark:text-stone-300 font-medium">{r.runner_up_team_name || '—'}</div>
                    {r.runner_up_participant && (
                      <div className="text-stone-600 dark:text-stone-400">{r.runner_up_participant}</div>
                    )}
                    {r.runner_up_enrollment_no && (
                      <span className="inline-block mt-0.5 font-mono text-[10px] text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-1.5 py-0.5 rounded">
                        {r.runner_up_enrollment_no}
                      </span>
                    )}
                    {r.runner_up_players && (
                      <span className="inline-block ml-1 mt-0.5 text-[9px] font-semibold text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">
                        👥 Squad
                      </span>
                    )}
                    <div className="text-stone-400 font-mono mt-0.5">
                      +{r.runner_up_points} pts {r.runner_up_metric && `• ${r.runner_up_metric}`}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs">
                    <div className="text-stone-700 dark:text-stone-300 font-medium">{r.third_place_team_name || '—'}</div>
                    {r.third_place_participant && (
                      <div className="text-stone-600 dark:text-stone-400">{r.third_place_participant}</div>
                    )}
                    {r.third_place_enrollment_no && (
                      <span className="inline-block mt-0.5 font-mono text-[10px] text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-1.5 py-0.5 rounded">
                        {r.third_place_enrollment_no}
                      </span>
                    )}
                    {r.third_place_players && (
                      <span className="inline-block ml-1 mt-0.5 text-[9px] font-semibold text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">
                        👥 Squad
                      </span>
                    )}
                    <div className="text-stone-400 font-mono mt-0.5">
                      +{r.third_place_points} pts {r.third_place_metric && `• ${r.third_place_metric}`}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      r.published_state === 'PUBLISHED'
                        ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
                        : 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400'
                    }`}>
                      {r.published_state}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center font-mono text-xs text-stone-400">
                    v{r.version}
                  </td>
                  <td className="py-4 px-4 text-right space-x-1">
                    <button
                      onClick={() => handleOpenEdit(r)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800"
                      title="Correct Result / Adjust Points"
                    >
                      <Edit size={14} />
                    </button>
                    {r.published_state === 'DRAFT' && (
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                        title="Delete Draft Result"
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
      </div>

      {/* CREATE & EDIT MODAL */}
      {(isCreateOpen || editingResult) && (
        <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-xl w-full overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
              <div>
                <h3 className="font-serif font-bold text-base text-stone-900 dark:text-white">
                  {isCreateOpen ? 'Award Competition Result' : `Score Correction — ${editingResult?.event_title}`}
                </h3>
                <p className="text-[11px] text-stone-500">
                  {isCreateOpen ? 'Allocate official house championship points.' : `Editing version v${editingResult?.version}. Changes require audit sign-off.`}
                </p>
              </div>
              <button
                onClick={() => { setIsCreateOpen(false); setEditingResult(null); }}
                className="text-stone-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={isCreateOpen ? handleCreateSubmit : handleEditSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Event selection (disabled on edit) */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase">Competition Event</label>
                <select
                  disabled={!isCreateOpen}
                  value={formData.event_id}
                  onChange={(e) => setFormData({ ...formData, event_id: Number(e.target.value) })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white disabled:opacity-60"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.title} ({ev.category})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase">Category / Bracket</label>
                <input
                  type="text"
                  required
                  disabled={!isCreateOpen}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Main Championship, Group A, Blitz"
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white disabled:opacity-60"
                />
              </div>

              {/* 1st Place */}
              <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-2">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="font-bold text-amber-800 dark:text-amber-300 uppercase">🥇 1st Place Winner House</label>
                    <select
                      value={formData.winner_team_id}
                      onChange={(e) => setFormData({ ...formData, winner_team_id: Number(e.target.value) })}
                      className="w-full p-2 bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-800 rounded-lg"
                    >
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-amber-800 dark:text-amber-300 uppercase">Points</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.winner_points}
                      onChange={(e) => setFormData({ ...formData, winner_points: Number(e.target.value) })}
                      className="w-full p-2 bg-white dark:bg-stone-900 border border-amber-300 dark:border-amber-800 rounded-lg font-mono font-bold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <input
                    type="text"
                    value={formData.winner_participant}
                    onChange={(e) => setFormData({ ...formData, winner_participant: e.target.value })}
                    placeholder="Winner Athlete / Captain Name"
                    className="p-2 bg-white dark:bg-stone-900 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={formData.winner_enrollment_no}
                    onChange={(e) => setFormData({ ...formData, winner_enrollment_no: e.target.value })}
                    placeholder="Enrollment No. (e.g. SBU2423621)"
                    className="p-2 bg-white dark:bg-stone-900 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={formData.winner_metric}
                    onChange={(e) => setFormData({ ...formData, winner_metric: e.target.value })}
                    placeholder="Metric (e.g. 10.82s, 14.5m, 21-18)"
                    className="p-2 bg-white dark:bg-stone-900 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">
                    Team Squad Players (Name & Enrollment No) — For Team Sports:
                  </label>
                  <textarea
                    rows={2}
                    value={formData.winner_players}
                    onChange={(e) => setFormData({ ...formData, winner_players: e.target.value })}
                    placeholder="e.g. Rahul Kumar (SBU2423621) [C], Amit Sen (SBU2423622), ..."
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* 2nd Place */}
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-2">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase">🥈 2nd Place Runner-up House</label>
                    <select
                      value={formData.runner_up_team_id}
                      onChange={(e) => setFormData({ ...formData, runner_up_team_id: Number(e.target.value) })}
                      className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg"
                    >
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase">Points</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.runner_up_points}
                      onChange={(e) => setFormData({ ...formData, runner_up_points: Number(e.target.value) })}
                      className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <input
                    type="text"
                    value={formData.runner_up_participant}
                    onChange={(e) => setFormData({ ...formData, runner_up_participant: e.target.value })}
                    placeholder="Runner-up Athlete / Captain Name"
                    className="p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={formData.runner_up_enrollment_no}
                    onChange={(e) => setFormData({ ...formData, runner_up_enrollment_no: e.target.value })}
                    placeholder="Enrollment No. (e.g. SBU2423022)"
                    className="p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={formData.runner_up_metric}
                    onChange={(e) => setFormData({ ...formData, runner_up_metric: e.target.value })}
                    placeholder="Metric (e.g. 11.05s, 13.9m)"
                    className="p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">
                    Runner-up Team Squad Players (Name & Enrollment No):
                  </label>
                  <textarea
                    rows={2}
                    value={formData.runner_up_players}
                    onChange={(e) => setFormData({ ...formData, runner_up_players: e.target.value })}
                    placeholder="e.g. Kunal Shaw (SBU2423022) [C], Vikas Singh (SBU2412081), ..."
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* 3rd Place */}
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-2">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase">🥉 3rd Place House</label>
                    <select
                      value={formData.third_place_team_id}
                      onChange={(e) => setFormData({ ...formData, third_place_team_id: Number(e.target.value) })}
                      className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg"
                    >
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase">Points</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.third_place_points}
                      onChange={(e) => setFormData({ ...formData, third_place_points: Number(e.target.value) })}
                      className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <input
                    type="text"
                    value={formData.third_place_participant}
                    onChange={(e) => setFormData({ ...formData, third_place_participant: e.target.value })}
                    placeholder="3rd Place Athlete / Captain Name"
                    className="p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={formData.third_place_enrollment_no}
                    onChange={(e) => setFormData({ ...formData, third_place_enrollment_no: e.target.value })}
                    placeholder="Enrollment No. (Optional)"
                    className="p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={formData.third_place_metric}
                    onChange={(e) => setFormData({ ...formData, third_place_metric: e.target.value })}
                    placeholder="Metric (Optional)"
                    className="p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-0.5">
                    3rd Place Team Squad Players (Name & Enrollment No):
                  </label>
                  <textarea
                    rows={2}
                    value={formData.third_place_players}
                    onChange={(e) => setFormData({ ...formData, third_place_players: e.target.value })}
                    placeholder="e.g. Sumit Mahto (SBU2415018), ..."
                    className="w-full p-2 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300 uppercase">Jury Remarks</label>
                <input
                  type="text"
                  placeholder="e.g. Won by 4 goals in second half..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-white"
                />
              </div>

              {/* Confirmation Checkbox on Editing Published Result */}
              {editingResult && editingResult.published_state === 'PUBLISHED' && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 space-y-2">
                  <div className="flex items-start space-x-2">
                    <ShieldAlert size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-800 dark:text-amber-300">Administrative Score Correction</h4>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                        This competition result is already PUBLISHED. Changing points will recalculate the overall inter-house leaderboard and log an immutable audit event with previous score values.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center space-x-2 pt-1 font-semibold text-amber-900 dark:text-amber-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmationChecked}
                      onChange={(e) => setConfirmationChecked(e.target.checked)}
                      className="w-4 h-4 text-brand-primary rounded"
                    />
                    <span>I confirm this result correction and authorize leaderboard recalculation.</span>
                  </label>
                </div>
              )}

              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setIsCreateOpen(false); setEditingResult(null); }}
                  className="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-primary hover:bg-stone-800 text-white rounded-lg font-semibold"
                >
                  {isCreateOpen ? 'Publish Result & Award Points' : 'Save Score Correction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
