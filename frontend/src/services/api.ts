import type {
  LeadershipMember,
  LeadershipSectionResponse,
  LeadershipMemberPayload,
} from '../types';

const RAW_API_BASE = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  (import.meta.env.VITE_API_URL as string | undefined) ||
  '/api'
).trim();

const API_BASE = RAW_API_BASE.endsWith('/api')
  ? RAW_API_BASE
  : RAW_API_BASE === '' || RAW_API_BASE === '/'
  ? '/api'
  : `${RAW_API_BASE.replace(/\/+$/, '')}/api`;

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('sbu_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  // Public Endpoints
  getSports: (params?: { category?: string; gender?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.category && params.category !== 'All') q.append('category', params.category);
    if (params?.gender && params.gender !== 'All') q.append('gender', params.gender);
    if (params?.search) q.append('search', params.search);
    return request<any[]>(`/sports?${q.toString()}`);
  },
  getSportDetail: (slugOrId: string) => request<any>(`/sports/${slugOrId}`),
  getLiveMatches: () => request<any[]>('/live'),
  getEvents: (params?: { search?: string; category?: string; status?: string; event_date?: string; sport_id?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.category) q.append('category', params.category);
    if (params?.status) q.append('status', params.status);
    if (params?.event_date) q.append('event_date', params.event_date);
    if (params?.sport_id) q.append('sport_id', String(params.sport_id));
    return request<any[]>(`/events?${q.toString()}`);
  },
  getEventDetail: (slugOrId: string) => request<any>(`/events/${slugOrId}`),
  getSchedule: (params?: { category?: string; venue_id?: number; event_date?: string; sport_id?: number }) => {
    const q = new URLSearchParams();
    if (params?.category) q.append('category', params.category);
    if (params?.venue_id) q.append('venue_id', String(params.venue_id));
    if (params?.event_date) q.append('event_date', params.event_date);
    if (params?.sport_id) q.append('sport_id', String(params.sport_id));
    return request<any[]>(`/schedule?${q.toString()}`);
  },
  getLeaderboard: () => request<any[]>('/leaderboard'),
  getPointsBreakdown: (teamId: number) => request<any>(`/leaderboard/breakdown/${teamId}`),
  getAthletesLeaderboard: (year?: number) => {
    const q = year ? `?year=${year}` : '';
    return request<any>(`/leaderboard/athletes${q}`);
  },
  getResults: (category?: string) => {
    const q = category ? `?category=${encodeURIComponent(category)}` : '';
    return request<any[]>(`/results${q}`);
  },
  getForms: () => request<any[]>('/forms'),
  getAnnouncements: (priority?: string) => {
    const q = priority ? `?priority=${encodeURIComponent(priority)}` : '';
    return request<any[]>(`/announcements${q}`);
  },
  getVenues: () => request<any[]>('/venues'),
  getSettings: () => request<any>('/settings'),
  getStats: () => request<any>('/events').then((evs: any[]) => {
    const live = evs.filter((e) => e.status === 'LIVE').length;
    const upcoming = evs.filter((e) => e.status === 'UPCOMING').length;
    const completed = evs.filter((e) => e.status === 'COMPLETED').length;
    return {
      total_sports: 12,
      total_events: evs.length,
      live_events: live,
      upcoming_events: upcoming,
      completed_events: completed,
      open_forms: 3,
      teams_count: 4,
    };
  }),

  // Admin Sports Endpoints
  getAdminSports: () => request<any[]>('/admin/sports'),
  getAdminSport: (id: number) => request<any>(`/admin/sports/${id}`),
  createAdminSport: (data: any) => request<any>('/admin/sports', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminSport: (id: number, data: any) => request<any>(`/admin/sports/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminSport: (id: number) => request<any>(`/admin/sports/${id}`, { method: 'DELETE' }),

  // Admin Matches & Events Endpoints
  getAdminEvents: (state?: string) => {
    const q = state ? `?state=${encodeURIComponent(state)}` : '';
    return request<any[]>(`/admin/events${q}`);
  },
  getAdminEvent: (id: number) => request<any>(`/admin/events/${id}`),
  createAdminEvent: (data: any) => request<any>('/admin/events', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminEvent: (id: number, data: any) => request<any>(`/admin/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateLiveScore: (id: number, data: any) => request<any>(`/admin/events/${id}/live-score`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminEvent: (id: number, hardDelete = false) => request<any>(`/admin/events/${id}?hard_delete=${hardDelete}`, { method: 'DELETE' }),
  archiveAdminEvent: (id: number) => request<any>(`/admin/events/${id}/archive`, { method: 'POST' }),
  checkConflict: (params: { venue_id?: number; event_date: string; start_time: string; end_time: string; exclude_event_id?: number }) => {
    const q = new URLSearchParams();
    if (params.venue_id) q.append('venue_id', String(params.venue_id));
    q.append('event_date', params.event_date);
    q.append('start_time', params.start_time);
    q.append('end_time', params.end_time);
    if (params.exclude_event_id) q.append('exclude_event_id', String(params.exclude_event_id));
    return request<{ has_conflict: boolean; conflicts: any[] }>(`/admin/events/check-conflict?${q.toString()}`, { method: 'POST' });
  },

  // Admin Results
  getAdminResults: () => request<any[]>('/admin/results'),
  createAdminResult: (data: any) => request<any>('/admin/results', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminResult: (id: number, data: any) => request<any>(`/admin/results/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminResult: (id: number) => request<any>(`/admin/results/${id}`, { method: 'DELETE' }),
  createResult: (data: any) => request<any>('/admin/results', { method: 'POST', body: JSON.stringify(data) }),
  updateResult: (id: number, data: any) => request<any>(`/admin/results/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteResult: (id: number) => request<any>(`/admin/results/${id}`, { method: 'DELETE' }),

  // Admin Forms
  getAdminForms: () => request<any[]>('/admin/forms'),
  createAdminForm: (data: any) => request<any>('/admin/forms', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminForm: (id: number, data: any) => request<any>(`/admin/forms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminForm: (id: number) => request<any>(`/admin/forms/${id}`, { method: 'DELETE' }),
  createForm: (data: any) => request<any>('/admin/forms', { method: 'POST', body: JSON.stringify(data) }),
  updateForm: (id: number, data: any) => request<any>(`/admin/forms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteForm: (id: number) => request<any>(`/admin/forms/${id}`, { method: 'DELETE' }),

  // Admin Teams
  getAdminTeams: () => request<any[]>('/admin/teams'),
  getHouses: () => request<any[]>('/admin/teams'),
  getAdminHouses: () => request<any[]>('/admin/teams'),
  createAdminTeam: (data: any) => request<any>('/admin/teams', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminTeam: (id: number, data: any) => request<any>(`/admin/teams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminTeam: (id: number) => request<any>(`/admin/teams/${id}`, { method: 'DELETE' }),
  createTeam: (data: any) => request<any>('/admin/teams', { method: 'POST', body: JSON.stringify(data) }),
  updateTeam: (id: number, data: any) => request<any>(`/admin/teams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Admin Venues
  getAdminVenues: () => request<any[]>('/admin/venues'),
  createAdminVenue: (data: any) => request<any>('/admin/venues', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminVenue: (id: number, data: any) => request<any>(`/admin/venues/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminVenue: (id: number) => request<any>(`/admin/venues/${id}`, { method: 'DELETE' }),
  createVenue: (data: any) => request<any>('/admin/venues', { method: 'POST', body: JSON.stringify(data) }),
  updateVenue: (id: number, data: any) => request<any>(`/admin/venues/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Admin Announcements
  getAdminAnnouncements: () => request<any[]>('/admin/announcements'),
  createAdminAnnouncement: (data: any) => request<any>('/admin/announcements', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminAnnouncement: (id: number, data: any) => request<any>(`/admin/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminAnnouncement: (id: number) => request<any>(`/admin/announcements/${id}`, { method: 'DELETE' }),
  createAnnouncement: (data: any) => request<any>('/admin/announcements', { method: 'POST', body: JSON.stringify(data) }),
  updateAnnouncement: (id: number, data: any) => request<any>(`/admin/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAnnouncement: (id: number) => request<any>(`/admin/announcements/${id}`, { method: 'DELETE' }),

  // Admin Settings
  getAdminSettings: () => request<any>('/admin/settings'),
  updateAdminSettings: (data: any) => request<any>('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
  updateSettings: (data: any) => request<any>('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Admin Audit
  getAdminAuditLogs: (params?: { limit?: string; action?: string; target?: string; entity_type?: string }) => {
    const q = new URLSearchParams();
    if (params?.limit) q.append('limit', params.limit);
    if (params?.action) q.append('action', params.action);
    if (params?.target) q.append('target', params.target);
    if (params?.entity_type) q.append('entity_type', params.entity_type);
    const qs = q.toString();
    return request<any[]>(`/admin/audit${qs ? `?${qs}` : ''}`);
  },

  // Public Archives & Past Records
  getArchives: () => request<any[]>('/archives'),
  getArchiveDetail: (year: number | string) => request<any>(`/archives/${year}`),
  getArchivesStats: () => request<any>('/archives-stats'),

  // Admin Archives & Past Records
  getAdminArchives: () => request<any[]>('/admin/archives'),
  getAdminArchiveDetail: (idOrYear: number | string) => request<any>(`/admin/archives/${idOrYear}`),
  createAdminArchive: (data: any) => request<any>('/admin/archives', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminArchive: (idOrYear: number | string, data: any) => request<any>(`/admin/archives/${idOrYear}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminArchive: (idOrYear: number | string) => request<any>(`/admin/archives/${idOrYear}`, { method: 'DELETE' }),

  // Leadership & Sports Incharges
  getLeadership: () => request<LeadershipSectionResponse>('/leadership'),
  getAdminLeadership: (category?: string) => {
    const q = category && category !== 'All' ? `?category=${category}` : '';
    return request<LeadershipMember[]>(`/admin/leadership${q}`);
  },
  createAdminLeadership: (data: LeadershipMemberPayload) =>
    request<LeadershipMember>('/admin/leadership', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminLeadership: (id: number, data: Partial<LeadershipMemberPayload>) =>
    request<LeadershipMember>(`/admin/leadership/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminLeadership: (id: number) =>
    request<{ message: string }>(`/admin/leadership/${id}`, { method: 'DELETE' }),
  uploadLeadershipImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request<{ success: boolean; image_url: string; filename: string }>('/admin/leadership/upload-image', {
      method: 'POST',
      body: formData,
    });
  },

  // Auth
  login: (credentials: { username: string; password: string }) =>
    request<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getMe: () => request<any>('/auth/me'),
  logout: () => Promise.resolve(),
};
