import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { HistoricalEdition, TeamItem, YearlyHouseStanding, HistoricalSportRecord } from '../../types';
import {
  Trophy,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Users,
  Award,
  Medal,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminArchivesPage: React.FC = () => {
  const [editions, setEditions] = useState<HistoricalEdition[]>([]);
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEdition, setSelectedEdition] = useState<HistoricalEdition | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Form State for Edition
  const [formData, setFormData] = useState<{
    year: number;
    edition_title: string;
    theme: string;
    start_date: string;
    end_date: string;
    chief_guest: string;
    total_athletes: number;
    summary: string;
    banner_url: string;
    champion_team_id: number | '';
    runner_up_team_id: number | '';
    third_place_team_id: number | '';
    best_athlete_boys: string;
    best_athlete_girls: string;
    fair_play_house: string;
    march_past_winner: string;
    is_published: boolean;
    standings: Array<{
      team_id?: number;
      team_name: string;
      team_code: string;
      color: string;
      total_points: number;
      rank: number;
      gold_medals: number;
      silver_medals: number;
      bronze_medals: number;
    }>;
    sports_records: Array<{
      sport_name: string;
      category: string;
      gender: string;
      winner_team_id?: number;
      winner_team_name?: string;
      winner_participant?: string;
      winner_enrollment_no?: string;
      winner_players?: string;
      winner_metric?: string;
      runner_up_team_name?: string;
      runner_up_participant?: string;
      runner_up_enrollment_no?: string;
      runner_up_players?: string;
      remarks?: string;
    }>;
  }>({
    year: new Date().getFullYear(),
    edition_title: '',
    theme: '',
    start_date: '',
    end_date: '',
    chief_guest: '',
    total_athletes: 0,
    summary: '',
    banner_url: '',
    champion_team_id: '',
    runner_up_team_id: '',
    third_place_team_id: '',
    best_athlete_boys: '',
    best_athlete_girls: '',
    fair_play_house: '',
    march_past_winner: '',
    is_published: true,
    standings: [],
    sports_records: []
  });

  const loadData = () => {
    setLoading(true);
    Promise.all([api.getAdminArchives(), api.getHouses()])
      .then(([archivesData, housesData]) => {
        setEditions(archivesData);
        setTeams(housesData);
      })
      .catch((err) => {
        console.error(err);
        setStatusMessage({ type: 'error', text: 'Failed to load archive data from server.' });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNewModal = () => {
    // Default 4 house standings
    const defaultStandings = teams.map((t, idx) => ({
      team_id: t.id,
      team_name: t.name,
      team_code: t.code,
      color: t.color,
      total_points: 0,
      rank: idx + 1,
      gold_medals: 0,
      silver_medals: 0,
      bronze_medals: 0
    }));

    setFormData({
      year: new Date().getFullYear(),
      edition_title: `SBU UMANG ${new Date().getFullYear()} — Annual Sports Championship`,
      theme: 'Passion, Grit & Glory',
      start_date: '',
      end_date: '',
      chief_guest: '',
      total_athletes: 500,
      summary: '',
      banner_url: '',
      champion_team_id: teams[0]?.id || '',
      runner_up_team_id: teams[1]?.id || '',
      third_place_team_id: teams[2]?.id || '',
      best_athlete_boys: '',
      best_athlete_girls: '',
      fair_play_house: '',
      march_past_winner: '',
      is_published: true,
      standings: defaultStandings.length > 0 ? defaultStandings : [
        { team_name: 'Vishvesvaraya House', team_code: 'VISH', color: '#1E40AF', total_points: 0, rank: 1, gold_medals: 0, silver_medals: 0, bronze_medals: 0 },
        { team_name: 'Chanakya House', team_code: 'CHAN', color: '#800000', total_points: 0, rank: 2, gold_medals: 0, silver_medals: 0, bronze_medals: 0 },
        { team_name: 'Patanjali House', team_code: 'PATA', color: '#D97706', total_points: 0, rank: 3, gold_medals: 0, silver_medals: 0, bronze_medals: 0 },
        { team_name: 'Ramanujan House', team_code: 'RAMA', color: '#059669', total_points: 0, rank: 4, gold_medals: 0, silver_medals: 0, bronze_medals: 0 },
      ],
      sports_records: []
    });
    setIsNewModalOpen(true);
  };

  const openEditModal = (edition: HistoricalEdition) => {
    setSelectedEdition(edition);
    setFormData({
      year: edition.year,
      edition_title: edition.edition_title,
      theme: edition.theme || '',
      start_date: edition.start_date || '',
      end_date: edition.end_date || '',
      chief_guest: edition.chief_guest || '',
      total_athletes: edition.total_athletes || 0,
      summary: edition.summary || '',
      banner_url: edition.banner_url || '',
      champion_team_id: edition.champion_team_id || '',
      runner_up_team_id: edition.runner_up_team_id || '',
      third_place_team_id: edition.third_place_team_id || '',
      best_athlete_boys: edition.best_athlete_boys || '',
      best_athlete_girls: edition.best_athlete_girls || '',
      fair_play_house: edition.fair_play_house || '',
      march_past_winner: edition.march_past_winner || '',
      is_published: edition.is_published,
      standings: (edition.standings || []).map((s) => ({
        team_id: s.team_id,
        team_name: s.team_name,
        team_code: s.team_code,
        color: s.color,
        total_points: s.total_points,
        rank: s.rank,
        gold_medals: s.gold_medals,
        silver_medals: s.silver_medals,
        bronze_medals: s.bronze_medals
      })),
      sports_records: (edition.sports_records || []).map((r) => ({
        sport_name: r.sport_name,
        category: r.category,
        gender: r.gender,
        winner_team_id: r.winner_team_id,
        winner_team_name: r.winner_team_name || '',
        winner_participant: r.winner_participant || '',
        winner_enrollment_no: r.winner_enrollment_no || '',
        winner_players: r.winner_players || '',
        winner_metric: r.winner_metric || '',
        runner_up_team_name: r.runner_up_team_name || '',
        runner_up_participant: r.runner_up_participant || '',
        runner_up_enrollment_no: r.runner_up_enrollment_no || '',
        runner_up_players: r.runner_up_players || '',
        remarks: r.remarks || ''
      }))
    });
    setIsEditModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        ...formData,
        champion_team_id: formData.champion_team_id === '' ? null : Number(formData.champion_team_id),
        runner_up_team_id: formData.runner_up_team_id === '' ? null : Number(formData.runner_up_team_id),
        third_place_team_id: formData.third_place_team_id === '' ? null : Number(formData.third_place_team_id),
      };

      await api.createAdminArchive(payload);
      setStatusMessage({ type: 'success', text: `UMANG ${formData.year} archive created successfully!` });
      setIsNewModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to create archive edition.' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEdition) return;
    setSaving(true);
    try {
      const payload: any = {
        ...formData,
        champion_team_id: formData.champion_team_id === '' ? null : Number(formData.champion_team_id),
        runner_up_team_id: formData.runner_up_team_id === '' ? null : Number(formData.runner_up_team_id),
        third_place_team_id: formData.third_place_team_id === '' ? null : Number(formData.third_place_team_id),
        version: selectedEdition.version
      };

      await api.updateAdminArchive(selectedEdition.id, payload);
      setStatusMessage({ type: 'success', text: `UMANG ${formData.year} records updated successfully!` });
      setIsEditModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update archive edition.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (edition: HistoricalEdition) => {
    if (!window.confirm(`Are you sure you want to delete the records for UMANG ${edition.year}? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteAdminArchive(edition.id);
      setStatusMessage({ type: 'success', text: `UMANG ${edition.year} archive deleted.` });
      loadData();
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete edition.' });
    }
  };

  // Helper to add a new sport champion record in modal
  const addSportRecord = () => {
    setFormData((prev) => ({
      ...prev,
      sports_records: [
        ...prev.sports_records,
        {
          sport_name: '',
          category: 'Outdoor Team',
          gender: 'Boys',
          winner_team_name: 'Vishvesvaraya House',
          winner_participant: '',
          winner_enrollment_no: '',
          winner_players: '',
          winner_metric: '',
          runner_up_team_name: 'Chanakya House',
          runner_up_participant: '',
          runner_up_enrollment_no: '',
          runner_up_players: '',
          remarks: ''
        }
      ]
    }));
  };

  const removeSportRecord = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      sports_records: prev.sports_records.filter((_, i) => i !== idx)
    }));
  };

  const updateStandingField = (idx: number, field: string, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.standings];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, standings: updated };
    });
  };

  const updateSportRecordField = (idx: number, field: string, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.sports_records];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, sports_records: updated };
    });
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 mb-2">
            <Trophy size={13} className="text-amber-600" />
            <span>Administrative Archives Control</span>
          </div>
          <h1 className="text-3xl font-extrabold font-serif text-stone-900 dark:text-white">
            Past Years Sports Records & Archives
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Manage, edit, and publish historical sports meet editions (2021 — 2025). Manipulate house standings, points,
            medal tallies, and collegiate sport records.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/archives"
            target="_blank"
            className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-bold text-stone-700 dark:text-stone-200 hover:bg-stone-50 flex items-center space-x-1.5 transition-colors"
          >
            <span>View Public Portal</span>
            <ExternalLink size={13} />
          </Link>
          <button
            onClick={openNewModal}
            className="px-4 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-stone-800 flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <Plus size={15} />
            <span>Add New Year Edition</span>
          </button>
        </div>
      </div>

      {/* Alert Notifications */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-stone-400 hover:text-stone-700">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Archives Table */}
      {loading ? (
        <div className="py-20 text-center text-stone-500">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm">Loading historical archives...</p>
        </div>
      ) : editions.length === 0 ? (
        <div className="py-16 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl text-center p-8 space-y-3">
          <Trophy size={36} className="text-stone-400 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-stone-800 dark:text-stone-200">No Archives Found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            No historical records have been recorded yet. Click 'Add New Year Edition' to begin archiving.
          </p>
          <button
            onClick={openNewModal}
            className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-semibold"
          >
            Create First Edition
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-100/70 dark:bg-stone-800/60 text-stone-500 uppercase font-bold tracking-wider border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="py-3.5 px-6">Year</th>
                  <th className="py-3.5 px-6">Edition Title & Theme</th>
                  <th className="py-3.5 px-6">Overall Champion</th>
                  <th className="py-3.5 px-6">Athletes</th>
                  <th className="py-3.5 px-6">Sports Records</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {editions.map((ed) => (
                  <tr key={ed.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-black text-sm text-stone-900 dark:text-white">
                      {ed.year}
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <span className="font-serif font-bold text-stone-900 dark:text-white block leading-tight">
                        {ed.edition_title}
                      </span>
                      {ed.theme && (
                        <span className="text-[11px] text-amber-700 dark:text-amber-400 italic">
                          "{ed.theme}"
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {ed.champion_team ? (
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: ed.champion_team.color }}
                          ></span>
                          <span className="font-bold text-stone-800 dark:text-stone-200">
                            {ed.champion_team.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-stone-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono font-semibold text-stone-600 dark:text-stone-300">
                      {ed.total_athletes}
                    </td>
                    <td className="py-4 px-6 font-mono font-semibold text-stone-600 dark:text-stone-300">
                      {ed.sports_records ? ed.sports_records.length : 0} events
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          ed.is_published
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-400'
                        }`}
                      >
                        {ed.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(ed)}
                        className="p-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                        title="Edit Edition & Standings"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(ed)}
                        className="p-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                        title="Delete Edition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {(isEditModalOpen || isNewModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-stone-200 dark:border-stone-800 pb-4">
              <div>
                <h3 className="font-serif font-bold text-xl text-stone-900 dark:text-white">
                  {isNewModalOpen ? 'Create New Historical Edition' : `Edit UMANG ${formData.year} Records`}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Update general information, house scores, and individual event gold medalists.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setIsNewModalOpen(false);
                }}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-white p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={isNewModalOpen ? handleCreate : handleUpdate} className="space-y-6">
              {/* Section 1: General Details */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-stone-100 dark:border-stone-800 pb-1">
                  1. Edition Metadata
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Edition Year *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                      disabled={isEditModalOpen}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Edition Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.edition_title}
                      onChange={(e) => setFormData({ ...formData, edition_title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Festival Theme / Slogan
                    </label>
                    <input
                      type="text"
                      value={formData.theme}
                      onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                      placeholder="e.g., Stride of Triumph"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Chief Guest / Dignitary
                    </label>
                    <input
                      type="text"
                      value={formData.chief_guest}
                      onChange={(e) => setFormData({ ...formData, chief_guest: e.target.value })}
                      placeholder="e.g., Deep Grace Ekka, Indian Olympian"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Total Participating Athletes
                    </label>
                    <input
                      type="number"
                      value={formData.total_athletes}
                      onChange={(e) => setFormData({ ...formData, total_athletes: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="text-xs">
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Editorial Summary / Meet Overview
                  </label>
                  <textarea
                    rows={3}
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    placeholder="Brief highlights, inaugural ceremonies, new records set..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Section 2: Championship Houses & Accolades */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-stone-100 dark:border-stone-800 pb-1">
                  2. Overall Trophy Winners & Special Accolades
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      🥇 Champion House *
                    </label>
                    <select
                      value={formData.champion_team_id}
                      onChange={(e) => setFormData({ ...formData, champion_team_id: e.target.value ? Number(e.target.value) : '' })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    >
                      <option value="">Select Champion</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      🥈 Runner-Up House
                    </label>
                    <select
                      value={formData.runner_up_team_id}
                      onChange={(e) => setFormData({ ...formData, runner_up_team_id: e.target.value ? Number(e.target.value) : '' })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    >
                      <option value="">Select Runner-Up</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      🥉 Third Place House
                    </label>
                    <select
                      value={formData.third_place_team_id}
                      onChange={(e) => setFormData({ ...formData, third_place_team_id: e.target.value ? Number(e.target.value) : '' })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    >
                      <option value="">Select Third Place</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Best Athlete (Boys) — Name & Enrollment No.
                    </label>
                    <input
                      type="text"
                      value={formData.best_athlete_boys}
                      onChange={(e) => setFormData({ ...formData, best_athlete_boys: e.target.value })}
                      placeholder="e.g., Rohan Verma (Enrollment No: SBU2423621)"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Best Athlete (Girls) — Name & Enrollment No.
                    </label>
                    <input
                      type="text"
                      value={formData.best_athlete_girls}
                      onChange={(e) => setFormData({ ...formData, best_athlete_girls: e.target.value })}
                      placeholder="e.g., Tanvi Singh (Enrollment No: SBU2415045)"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Best March Past Contingent
                    </label>
                    <input
                      type="text"
                      value={formData.march_past_winner}
                      onChange={(e) => setFormData({ ...formData, march_past_winner: e.target.value })}
                      placeholder="e.g., Chanakya House"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Fair Play Award Winner
                    </label>
                    <input
                      type="text"
                      value={formData.fair_play_house}
                      onChange={(e) => setFormData({ ...formData, fair_play_house: e.target.value })}
                      placeholder="e.g., Patanjali House"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: House Standings Manipulation */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-stone-100 dark:border-stone-800 pb-1">
                  3. House Standings & Points Manipulation
                </h4>

                <div className="space-y-3">
                  {formData.standings.map((st, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center space-x-2 w-48">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: st.color }}></span>
                        <span className="font-bold text-stone-900 dark:text-white">{st.team_name}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <label className="text-[11px] font-semibold text-stone-500">Rank:</label>
                        <input
                          type="number"
                          value={st.rank}
                          onChange={(e) => updateStandingField(idx, 'rank', Number(e.target.value))}
                          className="w-14 px-2 py-1 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 font-mono font-bold"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <label className="text-[11px] font-semibold text-stone-500">Points:</label>
                        <input
                          type="number"
                          value={st.total_points}
                          onChange={(e) => updateStandingField(idx, 'total_points', Number(e.target.value))}
                          className="w-20 px-2 py-1 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 font-mono font-bold text-amber-600 dark:text-amber-400"
                        />
                      </div>

                      <div className="flex items-center space-x-3 text-[11px]">
                        <span className="flex items-center space-x-1">
                          <span>🥇</span>
                          <input
                            type="number"
                            value={st.gold_medals}
                            onChange={(e) => updateStandingField(idx, 'gold_medals', Number(e.target.value))}
                            className="w-12 px-1.5 py-0.5 rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 font-mono"
                          />
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>🥈</span>
                          <input
                            type="number"
                            value={st.silver_medals}
                            onChange={(e) => updateStandingField(idx, 'silver_medals', Number(e.target.value))}
                            className="w-12 px-1.5 py-0.5 rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 font-mono"
                          />
                        </span>
                        <span className="flex items-center space-x-1">
                          <span>🥉</span>
                          <input
                            type="number"
                            value={st.bronze_medals}
                            onChange={(e) => updateStandingField(idx, 'bronze_medals', Number(e.target.value))}
                            className="w-12 px-1.5 py-0.5 rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 font-mono"
                          />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Individual Sport Records Manipulation */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    4. Event Champions & Records ({formData.sports_records.length} Events)
                  </h4>
                  <button
                    type="button"
                    onClick={addSportRecord}
                    className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-[11px] font-bold text-brand-primary dark:text-amber-400 hover:bg-stone-200 dark:hover:bg-stone-700 flex items-center space-x-1"
                  >
                    <Plus size={12} />
                    <span>Add Event Record</span>
                  </button>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {formData.sports_records.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/80 space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-stone-500 text-[10px] uppercase">Record #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeSportRecord(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove record"
                        >
                          <X size={13} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          required
                          value={rec.sport_name}
                          onChange={(e) => updateSportRecordField(idx, 'sport_name', e.target.value)}
                          placeholder="Sport Name (e.g. 100m Sprint)"
                          className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-xs font-semibold"
                        />
                        <select
                          value={rec.category}
                          onChange={(e) => updateSportRecordField(idx, 'category', e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-xs"
                        >
                          <option value="Athletics & Track">Athletics & Track</option>
                          <option value="Outdoor Team">Outdoor Team</option>
                          <option value="Indoor Racket">Indoor Racket</option>
                          <option value="Traditional">Traditional</option>
                          <option value="Indoor Mind Sports">Indoor Mind Sports</option>
                          <option value="Athletics & Field">Athletics & Field</option>
                        </select>
                        <select
                          value={rec.gender}
                          onChange={(e) => updateSportRecordField(idx, 'gender', e.target.value)}
                          className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-xs"
                        >
                          <option value="Boys">Boys</option>
                          <option value="Girls">Girls</option>
                          <option value="Mixed">Mixed</option>
                        </select>
                      </div>

                      {/* 1st Place / Winner Inputs */}
                      <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800 dark:text-amber-400">
                          <span>🥇 1st Place / Gold Winner</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                          <input
                            type="text"
                            value={rec.winner_participant}
                            onChange={(e) => updateSportRecordField(idx, 'winner_participant', e.target.value)}
                            placeholder="Winner Name / Team Title"
                            className="px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800/60 bg-white dark:bg-stone-900 text-xs"
                          />
                          <input
                            type="text"
                            value={rec.winner_enrollment_no || ''}
                            onChange={(e) => updateSportRecordField(idx, 'winner_enrollment_no', e.target.value)}
                            placeholder="Winner Enrollment No. (e.g. SBU2423621)"
                            className="px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800/60 bg-white dark:bg-stone-900 text-xs font-mono"
                          />
                          <select
                            value={rec.winner_team_name}
                            onChange={(e) => updateSportRecordField(idx, 'winner_team_name', e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800/60 bg-white dark:bg-stone-900 text-xs font-semibold"
                          >
                            <option value="">Select Winning House</option>
                            {teams.map((t) => (
                              <option key={t.id} value={t.name}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={rec.winner_metric}
                            onChange={(e) => updateSportRecordField(idx, 'winner_metric', e.target.value)}
                            placeholder="Score/Metric (e.g. 10.65s, 184/3)"
                            className="px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800/60 bg-white dark:bg-stone-900 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-0.5">
                            Team Players Squad (Names & Enrollment Nos) — For team sports:
                          </label>
                          <textarea
                            rows={2}
                            value={rec.winner_players || ''}
                            onChange={(e) => updateSportRecordField(idx, 'winner_players', e.target.value)}
                            placeholder="e.g. Rohan Verma (SBU2423621) [C], Gaurav Mishra (SBU2423027), Ritik Sharma (SBU2423019), ..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300/80 dark:border-amber-800/50 bg-white dark:bg-stone-900 text-xs font-mono"
                          />
                        </div>
                      </div>

                      {/* 2nd Place / Runner-up Inputs */}
                      <div className="p-3 rounded-xl bg-stone-100/70 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 space-y-2">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-stone-700 dark:text-stone-300">
                          <span>🥈 2nd Place / Silver Runner-up</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                          <input
                            type="text"
                            value={rec.runner_up_participant || ''}
                            onChange={(e) => updateSportRecordField(idx, 'runner_up_participant', e.target.value)}
                            placeholder="Runner-up Athlete / Team Title"
                            className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-xs"
                          />
                          <input
                            type="text"
                            value={rec.runner_up_enrollment_no || ''}
                            onChange={(e) => updateSportRecordField(idx, 'runner_up_enrollment_no', e.target.value)}
                            placeholder="Runner-up Enrollment No. (e.g. SBU2423022)"
                            className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-xs font-mono"
                          />
                          <select
                            value={rec.runner_up_team_name || ''}
                            onChange={(e) => updateSportRecordField(idx, 'runner_up_team_name', e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-xs font-semibold"
                          >
                            <option value="">Select Runner-up House</option>
                            {teams.map((t) => (
                              <option key={t.id} value={t.name}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={rec.remarks || ''}
                            onChange={(e) => updateSportRecordField(idx, 'remarks', e.target.value)}
                            placeholder="Remarks / Match Highlights"
                            className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 mb-0.5">
                            Runner-up Team Players Squad (Names & Enrollment Nos):
                          </label>
                          <textarea
                            rows={2}
                            value={rec.runner_up_players || ''}
                            onChange={(e) => updateSportRecordField(idx, 'runner_up_players', e.target.value)}
                            placeholder="e.g. Harshvardhan (SBU2423022) [C], Vishal Pandey (SBU2423071), ..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200 dark:border-stone-800">
                <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="rounded border-stone-300 text-brand-primary focus:ring-amber-500 w-4 h-4"
                  />
                  <span>Published to Public Portal (Visible to visitors)</span>
                </label>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setIsNewModalOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-brand-primary hover:bg-stone-800 text-white text-xs font-bold shadow-md flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <Save size={14} />
                    <span>{saving ? 'Saving Records...' : isNewModalOpen ? 'Create Edition' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
