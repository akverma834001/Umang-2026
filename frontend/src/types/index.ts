export type EventStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
export type PublishedState = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type AnnouncementPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type FormStatus = 'UPCOMING' | 'OPEN' | 'CLOSING_SOON' | 'CLOSED';
export type GenderCategory = 'Boys' | 'Girls' | 'Mixed';
export type SportType = 'Match-based' | 'Individual' | 'Time-based' | 'Distance-based' | 'Position-based';

export interface VenueItem {
  id: number;
  name: string;
  description?: string;
  location: string;
  capacity: number;
  image_url?: string;
  map_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamItem {
  id: number;
  name: string;
  code: string;
  color: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SportItem {
  id: number;
  name: string;
  slug: string;
  category: string;
  gender: GenderCategory | string;
  sport_type: SportType | string;
  venue_id?: number;
  default_venue_id?: number;
  status: string;
  description?: string;
  banner_url?: string;
  rules?: string;
  scoring_format: string;
  registration_form_url?: string;
  version: number;
  created_at: string;
  updated_at: string;
  venue?: VenueItem;
}

export interface EventItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  sport_id?: number;
  sport_name?: string;
  venue_name?: string;
  gender?: GenderCategory | string;
  event_type?: SportType | string;
  round?: string;
  stage?: string;
  team_a_id?: number;
  team_a_name?: string;
  team_b_id?: number;
  team_b_name?: string;
  score_a?: string;
  score_b?: string;
  winner_team_id?: number;
  winner_team_name?: string;
  venue_id?: number;
  event_date: string;
  start_time: string;
  end_time: string;
  banner_url?: string;
  rules?: string;
  status: EventStatus;
  published_state: PublishedState;
  live_score?: string;
  live_round?: string;
  live_stage?: string;
  live_status_detail?: string;
  live_notes?: string;
  version: number;
  created_at: string;
  updated_at: string;
  venue?: VenueItem;
  sport?: SportItem;
  team_a?: TeamItem;
  team_b?: TeamItem;
  winner_team?: TeamItem;
}

export interface ResultItem {
  id: number;
  event_id: number;
  category: string;
  winner_team_id: number;
  winner_points: number;
  winner_participant?: string;
  winner_enrollment_no?: string;
  winner_players?: string;
  winner_metric?: string;
  runner_up_team_id?: number;
  runner_up_points: number;
  runner_up_participant?: string;
  runner_up_enrollment_no?: string;
  runner_up_players?: string;
  runner_up_metric?: string;
  third_place_team_id?: number;
  third_place_points: number;
  third_place_participant?: string;
  third_place_enrollment_no?: string;
  third_place_players?: string;
  third_place_metric?: string;
  remarks?: string;
  published_state: PublishedState;
  version: number;
  created_at: string;
  event_title?: string;
  winner_team_name?: string;
  runner_up_team_name?: string;
  third_place_team_name?: string;
}

export interface LeaderboardItem {
  rank: number;
  id: number;
  name: string;
  code: string;
  color: string;
  logo_url?: string;
  total_points: number;
  first_places: number;
  second_places: number;
  third_places: number;
  event_count: number;
}

export interface PointsBreakdown {
  team_id: number;
  team_name: string;
  team_code: string;
  team_color: string;
  total_points: number;
  breakdown: Array<{
    event_id: number;
    event_title: string;
    category: string;
    position: string;
    points: number;
    awarded_at: string;
  }>;
}

export interface AthleteEventParticipation {
  sport_name: string;
  category: string;
  event_type: 'Solo' | 'Team' | string;
  position: string;
  points: number;
  role?: string;
  metric?: string;
}

export interface BestAthleteItem {
  rank: number;
  name: string;
  enrollment_no: string;
  team_name?: string;
  team_code?: string;
  team_color?: string;
  total_points: number;
  solo_points: number;
  team_points: number;
  gold_medals: number;
  silver_medals: number;
  bronze_medals: number;
  total_medals: number;
  events_count: number;
  events: AthleteEventParticipation[];
}

export interface BestAthletesLeaderboardResponse {
  edition_label: string;
  year?: number;
  is_live: boolean;
  available_years: number[];
  top_athletes: BestAthleteItem[];
}

export interface FormItem {
  id: number;
  title: string;
  description?: string;
  form_url: string;
  google_form_url?: string;
  sport_id?: number;
  event_id?: number;
  category: string;
  gender?: GenderCategory;
  banner_url?: string;
  opening_date?: string;
  closing_date?: string;
  status: FormStatus;
  published_state: PublishedState;
  version: number;
  created_at: string;
  updated_at: string;
  event_title?: string;
  sport_name?: string;
}

export interface AnnouncementItem {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: AnnouncementPriority;
  image_url?: string;
  published_state: PublishedState;
  published_at: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface WebsiteSettings {
  id: number;
  university_name: string;
  university_short_name: string;
  logo_url?: string;
  location: string;
  contact_email: string;
  contact_phone: string;
  fest_name: string;
  fest_tagline: string;
  fest_start_date?: string;
  fest_end_date?: string;
  hero_image_url?: string;
  points_first_place: number;
  points_second_place: number;
  points_third_place: number;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  website_url: string;
  instagram_url?: string;
  facebook_url?: string;
  linkedin_url?: string;
  youtube_url?: string;
  footer_text?: string;
  copyright_text: string;
  version: number;
  updated_at: string;
}

export interface AuditLogItem {
  id: number;
  admin_username: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  old_values?: string;
  new_values?: string;
  ip_address?: string;
  created_at: string;
}

export interface StatsSummary {
  total_sports: number;
  total_events: number;
  live_events: number;
  upcoming_events: number;
  completed_events: number;
  open_forms: number;
  teams_count: number;
  current_leader?: LeaderboardItem;
}

export interface YearlyHouseStanding {
  id: number;
  edition_id: number;
  team_id?: number;
  team_name: string;
  team_code: string;
  color: string;
  total_points: number;
  rank: number;
  gold_medals: number;
  silver_medals: number;
  bronze_medals: number;
}

export interface HistoricalSportRecord {
  id: number;
  edition_id: number;
  sport_name: string;
  category: string;
  gender: string;
  winner_team_id?: number;
  winner_team_name?: string;
  winner_participant?: string;
  winner_enrollment_no?: string;
  winner_players?: string;
  winner_metric?: string;
  runner_up_team_id?: number;
  runner_up_team_name?: string;
  runner_up_participant?: string;
  runner_up_enrollment_no?: string;
  runner_up_players?: string;
  remarks?: string;
}

export interface HistoricalEdition {
  id: number;
  year: number;
  edition_title: string;
  theme?: string;
  start_date?: string;
  end_date?: string;
  chief_guest?: string;
  total_athletes: number;
  summary?: string;
  banner_url?: string;
  champion_team_id?: number;
  runner_up_team_id?: number;
  third_place_team_id?: number;
  best_athlete_boys?: string;
  best_athlete_girls?: string;
  fair_play_house?: string;
  march_past_winner?: string;
  is_published: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  champion_team?: TeamItem;
  runner_up_team?: TeamItem;
  third_place_team?: TeamItem;
  standings: YearlyHouseStanding[];
  sports_records: HistoricalSportRecord[];
}

export interface HouseTrophyTally {
  id: number;
  name: string;
  code: string;
  color: string;
  championships: number;
  runners_up: number;
  third_places: number;
  total_historical_points: number;
}

export interface ArchivesStats {
  total_editions: number;
  years: number[];
  house_trophy_tally: HouseTrophyTally[];
}

export interface LeadershipMember {
  id: number;
  name: string;
  designation: string;
  category: 'executive' | 'sports' | string;
  bio?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  contact_email?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadershipSectionResponse {
  title: string;
  subtitle: string;
  executive_members: LeadershipMember[];
  sports_incharges: LeadershipMember[];
  all_members: LeadershipMember[];
}

export interface LeadershipMemberPayload {
  name: string;
  designation: string;
  category: string;
  bio?: string;
  image_url?: string;
  display_order?: number;
  is_active?: boolean;
  contact_email?: string;
}

