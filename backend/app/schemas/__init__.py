from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Any
import datetime


# --- Auth Schemas ---
class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    role: str


class AdminOut(BaseModel):
    username: str
    email: Optional[str]
    role: str

    class Config:
        from_attributes = True


# --- Venue Schemas ---
class VenueBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: str
    capacity: int = 100
    image_url: Optional[str] = None
    map_url: Optional[str] = None
    is_active: bool = True


class VenueCreate(VenueBase):
    pass


class VenueUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    capacity: Optional[int] = None
    image_url: Optional[str] = None
    map_url: Optional[str] = None
    is_active: Optional[bool] = None


class VenueOut(VenueBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


# --- Team / House Schemas ---
class TeamBase(BaseModel):
    name: str
    code: str
    color: str = "#800000"
    logo_url: Optional[str] = None
    is_active: bool = True


class TeamCreate(TeamBase):
    pass


class TeamUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    color: Optional[str] = None
    logo_url: Optional[str] = None
    is_active: Optional[bool] = None


class TeamOut(TeamBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


# --- Sport Schemas ---
class SportBase(BaseModel):
    name: str
    category: str = "Outdoor Team"  # Outdoor Team, Indoor Racket, Athletics & Track, Traditional, Combat
    gender: str = "Boys"            # Boys, Girls, Mixed
    sport_type: str = "Match-based" # Match-based, Individual, Time-based, Distance-based, Position-based
    venue_id: Optional[int] = None
    status: str = "Upcoming"        # Upcoming, Ongoing, Completed
    description: Optional[str] = None
    banner_url: Optional[str] = None
    rules: Optional[str] = None
    scoring_format: str = "Points"  # Points, Goals, Runs/Wickets, Time (s), Distance (m), Sets
    registration_form_url: Optional[str] = None


class SportCreate(SportBase):
    pass


class SportUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    gender: Optional[str] = None
    sport_type: Optional[str] = None
    venue_id: Optional[int] = None
    status: Optional[str] = None
    description: Optional[str] = None
    banner_url: Optional[str] = None
    rules: Optional[str] = None
    scoring_format: Optional[str] = None
    registration_form_url: Optional[str] = None
    version: int


class SportOut(SportBase):
    id: int
    slug: str
    version: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    venue: Optional[VenueOut] = None

    class Config:
        from_attributes = True


# --- Match / Event Schemas ---
class EventBase(BaseModel):
    title: str
    description: str
    category: str = "Outdoor Team"
    sport_id: Optional[int] = None
    gender: str = "Boys"
    event_type: str = "Match-based"
    round: Optional[str] = None
    stage: Optional[str] = None
    team_a_id: Optional[int] = None
    team_b_id: Optional[int] = None
    score_a: Optional[str] = None
    score_b: Optional[str] = None
    winner_team_id: Optional[int] = None
    venue_id: Optional[int] = None
    event_date: datetime.date
    start_time: str
    end_time: str
    banner_url: Optional[str] = None
    rules: Optional[str] = None
    status: str = "UPCOMING"
    published_state: str = "DRAFT"


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    sport_id: Optional[int] = None
    gender: Optional[str] = None
    event_type: Optional[str] = None
    round: Optional[str] = None
    stage: Optional[str] = None
    team_a_id: Optional[int] = None
    team_b_id: Optional[int] = None
    score_a: Optional[str] = None
    score_b: Optional[str] = None
    winner_team_id: Optional[int] = None
    venue_id: Optional[int] = None
    event_date: Optional[datetime.date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    banner_url: Optional[str] = None
    rules: Optional[str] = None
    status: Optional[str] = None
    published_state: Optional[str] = None
    version: int
    override_status_check: bool = False


class EventLiveScoreUpdate(BaseModel):
    live_score: Optional[str] = None
    score_a: Optional[str] = None
    score_b: Optional[str] = None
    live_round: Optional[str] = None
    live_stage: Optional[str] = None
    live_status_detail: Optional[str] = None  # Quarter 3, 2nd Half, Final Over
    live_notes: Optional[str] = None
    status: Optional[str] = None  # UPCOMING, LIVE, COMPLETED, CANCELLED


class EventOut(EventBase):
    id: int
    slug: str
    live_score: Optional[str] = None
    live_round: Optional[str] = None
    live_stage: Optional[str] = None
    live_status_detail: Optional[str] = None
    live_notes: Optional[str] = None
    version: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    venue: Optional[VenueOut] = None
    sport: Optional[SportOut] = None
    team_a: Optional[TeamOut] = None
    team_b: Optional[TeamOut] = None
    winner_team: Optional[TeamOut] = None

    class Config:
        from_attributes = True


# --- Result & Leaderboard Schemas ---
class ResultCreate(BaseModel):
    event_id: int
    category: str = "Main"
    winner_team_id: int
    winner_points: int = 10
    winner_participant: Optional[str] = None
    winner_enrollment_no: Optional[str] = None
    winner_players: Optional[str] = None
    winner_metric: Optional[str] = None
    runner_up_team_id: Optional[int] = None
    runner_up_points: int = 7
    runner_up_participant: Optional[str] = None
    runner_up_enrollment_no: Optional[str] = None
    runner_up_players: Optional[str] = None
    runner_up_metric: Optional[str] = None
    third_place_team_id: Optional[int] = None
    third_place_points: int = 5
    third_place_participant: Optional[str] = None
    third_place_enrollment_no: Optional[str] = None
    third_place_players: Optional[str] = None
    third_place_metric: Optional[str] = None
    remarks: Optional[str] = None
    published_state: str = "PUBLISHED"


class ResultUpdate(BaseModel):
    winner_team_id: int
    winner_points: int
    winner_participant: Optional[str] = None
    winner_enrollment_no: Optional[str] = None
    winner_players: Optional[str] = None
    winner_metric: Optional[str] = None
    runner_up_team_id: Optional[int] = None
    runner_up_points: int = 0
    runner_up_participant: Optional[str] = None
    runner_up_enrollment_no: Optional[str] = None
    runner_up_players: Optional[str] = None
    runner_up_metric: Optional[str] = None
    third_place_team_id: Optional[int] = None
    third_place_points: int = 0
    third_place_participant: Optional[str] = None
    third_place_enrollment_no: Optional[str] = None
    third_place_players: Optional[str] = None
    third_place_metric: Optional[str] = None
    remarks: Optional[str] = None
    published_state: str = "PUBLISHED"
    version: int
    confirmation: bool = False


class ResultOut(BaseModel):
    id: int
    event_id: int
    category: str
    winner_team_id: int
    winner_points: int
    winner_participant: Optional[str] = None
    winner_enrollment_no: Optional[str] = None
    winner_players: Optional[str] = None
    winner_metric: Optional[str] = None
    runner_up_team_id: Optional[int] = None
    runner_up_points: int
    runner_up_participant: Optional[str] = None
    runner_up_enrollment_no: Optional[str] = None
    runner_up_players: Optional[str] = None
    runner_up_metric: Optional[str] = None
    third_place_team_id: Optional[int] = None
    third_place_points: int
    third_place_participant: Optional[str] = None
    third_place_enrollment_no: Optional[str] = None
    third_place_players: Optional[str] = None
    third_place_metric: Optional[str] = None
    remarks: Optional[str] = None
    published_state: str
    version: int
    created_at: datetime.datetime
    event_title: Optional[str] = None
    winner_team_name: Optional[str] = None
    runner_up_team_name: Optional[str] = None
    third_place_team_name: Optional[str] = None

    class Config:
        from_attributes = True


class LeaderboardItem(BaseModel):
    rank: int
    id: int
    name: str
    code: str
    color: str
    logo_url: Optional[str]
    total_points: int
    first_places: int
    second_places: int
    third_places: int
    event_count: int


# --- Registration Form Schemas ---
class FormBase(BaseModel):
    title: str
    description: Optional[str] = None
    google_form_url: Optional[str] = None
    form_url: Optional[str] = None
    sport_id: Optional[int] = None
    event_id: Optional[int] = None
    category: str = "Outdoor Team"
    gender: str = "Boys"
    banner_url: Optional[str] = None
    opening_date: Optional[datetime.datetime] = None
    closing_date: Optional[datetime.datetime] = None
    status: str = "OPEN"
    published_state: str = "DRAFT"


class FormCreate(FormBase):
    pass



class FormUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    google_form_url: Optional[str] = None
    sport_id: Optional[int] = None
    event_id: Optional[int] = None
    category: Optional[str] = None
    gender: Optional[str] = None
    banner_url: Optional[str] = None
    opening_date: Optional[datetime.datetime] = None
    closing_date: Optional[datetime.datetime] = None
    status: Optional[str] = None
    published_state: Optional[str] = None
    version: int


class FormOut(FormBase):
    id: int
    version: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    event_title: Optional[str] = None
    sport_name: Optional[str] = None

    class Config:
        from_attributes = True


# --- Announcement Schemas ---
class AnnouncementBase(BaseModel):
    title: str
    description: str
    category: str = "GENERAL"  # IMPORTANT, GENERAL, SCHEDULE_UPDATE, RESULT, NOTICE
    priority: str = "MEDIUM"   # HIGH, MEDIUM, LOW
    image_url: Optional[str] = None
    published_state: str = "DRAFT"


class AnnouncementCreate(AnnouncementBase):
    pass


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    image_url: Optional[str] = None
    published_state: Optional[str] = None
    version: int


class AnnouncementOut(AnnouncementBase):
    id: int
    published_at: datetime.datetime
    version: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


# --- Settings Schemas ---
class SettingsBase(BaseModel):
    university_name: str = "Sarala Birla University, Ranchi"
    university_short_name: str = "SBU Ranchi"
    logo_url: Optional[str] = None
    location: str = "Birla Knowledge City, PO Mahilong, Purulia Road, Ranchi, Jharkhand - 835103"
    contact_email: str = "sports@sbu.ac.in"
    contact_phone: str = "+91-9525110012"
    fest_name: str = "SBU UMANG — Annual Sports Meet"
    fest_tagline: str = "Annual Inter-House Sports Championship | Sarala Birla University, Ranchi"
    fest_start_date: Optional[datetime.date] = None
    fest_end_date: Optional[datetime.date] = None
    hero_image_url: Optional[str] = None
    
    # Leaderboard Points Config
    points_first_place: int = 10
    points_second_place: int = 7
    points_third_place: int = 5
    
    primary_color: str = "#800000"
    secondary_color: str = "#1B2A4A"
    accent_color: str = "#E2A93B"
    website_url: str = "https://sbu.ac.in"
    instagram_url: Optional[str] = None
    facebook_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    youtube_url: Optional[str] = None
    footer_text: Optional[str] = None
    copyright_text: str = "© 2026 Sarala Birla University, Ranchi. All rights reserved."


class SettingsUpdate(SettingsBase):
    version: int


class SettingsOut(SettingsBase):
    id: int
    version: int
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


# --- Audit Log Schemas ---
class AuditLogOut(BaseModel):
    id: int
    admin_username: str
    action: str
    entity_type: str
    entity_id: Optional[str]
    old_values: Optional[str]
    new_values: Optional[str]
    ip_address: Optional[str]
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# --- Historical Edition & Archive Schemas ---
class YearlyHouseStandingBase(BaseModel):
    team_id: Optional[int] = None
    team_name: str
    team_code: str
    color: str = "#800000"
    total_points: int = 0
    rank: int = 1
    gold_medals: int = 0
    silver_medals: int = 0
    bronze_medals: int = 0


class YearlyHouseStandingCreate(YearlyHouseStandingBase):
    pass


class YearlyHouseStandingOut(YearlyHouseStandingBase):
    id: int
    edition_id: int

    class Config:
        from_attributes = True


class HistoricalSportRecordBase(BaseModel):
    sport_name: str
    category: str = "Outdoor Team"
    gender: str = "Boys"
    winner_team_id: Optional[int] = None
    winner_team_name: Optional[str] = None
    winner_participant: Optional[str] = None
    winner_enrollment_no: Optional[str] = None
    winner_players: Optional[str] = None
    winner_metric: Optional[str] = None
    runner_up_team_id: Optional[int] = None
    runner_up_team_name: Optional[str] = None
    runner_up_participant: Optional[str] = None
    runner_up_enrollment_no: Optional[str] = None
    runner_up_players: Optional[str] = None
    remarks: Optional[str] = None


class HistoricalSportRecordCreate(HistoricalSportRecordBase):
    pass


class HistoricalSportRecordOut(HistoricalSportRecordBase):
    id: int
    edition_id: int

    class Config:
        from_attributes = True


class HistoricalEditionBase(BaseModel):
    year: int
    edition_title: str
    theme: Optional[str] = None
    start_date: Optional[datetime.date] = None
    end_date: Optional[datetime.date] = None
    chief_guest: Optional[str] = None
    total_athletes: int = 0
    summary: Optional[str] = None
    banner_url: Optional[str] = None
    champion_team_id: Optional[int] = None
    runner_up_team_id: Optional[int] = None
    third_place_team_id: Optional[int] = None
    best_athlete_boys: Optional[str] = None
    best_athlete_girls: Optional[str] = None
    fair_play_house: Optional[str] = None
    march_past_winner: Optional[str] = None
    is_published: bool = True


class HistoricalEditionCreate(HistoricalEditionBase):
    standings: Optional[List[YearlyHouseStandingCreate]] = None
    sports_records: Optional[List[HistoricalSportRecordCreate]] = None


class HistoricalEditionUpdate(BaseModel):
    edition_title: Optional[str] = None
    theme: Optional[str] = None
    start_date: Optional[datetime.date] = None
    end_date: Optional[datetime.date] = None
    chief_guest: Optional[str] = None
    total_athletes: Optional[int] = None
    summary: Optional[str] = None
    banner_url: Optional[str] = None
    champion_team_id: Optional[int] = None
    runner_up_team_id: Optional[int] = None
    third_place_team_id: Optional[int] = None
    best_athlete_boys: Optional[str] = None
    best_athlete_girls: Optional[str] = None
    fair_play_house: Optional[str] = None
    march_past_winner: Optional[str] = None
    is_published: Optional[bool] = None
    standings: Optional[List[YearlyHouseStandingCreate]] = None
    sports_records: Optional[List[HistoricalSportRecordCreate]] = None
    version: Optional[int] = None


class HistoricalEditionOut(HistoricalEditionBase):
    id: int
    version: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    champion_team: Optional[TeamOut] = None
    runner_up_team: Optional[TeamOut] = None
    third_place_team: Optional[TeamOut] = None

    class Config:
        from_attributes = True


class HistoricalEditionDetailOut(HistoricalEditionOut):
    standings: List[YearlyHouseStandingOut] = []
    sports_records: List[HistoricalSportRecordOut] = []

    class Config:
        from_attributes = True


# --- Best Athletes Individual Leaderboard Schemas ---
class AthleteEventParticipation(BaseModel):
    sport_name: str
    category: str
    event_type: str  # "Solo" or "Team"
    position: str    # "1st (Gold)", "2nd (Silver)", "3rd (Bronze)"
    points: int
    role: Optional[str] = None
    metric: Optional[str] = None


class BestAthleteOut(BaseModel):
    rank: int
    name: str
    enrollment_no: str
    team_name: Optional[str] = None
    team_code: Optional[str] = None
    team_color: Optional[str] = None
    total_points: int
    solo_points: int
    team_points: int
    gold_medals: int
    silver_medals: int
    bronze_medals: int
    total_medals: int
    events_count: int
    events: List[AthleteEventParticipation] = []


class BestAthletesLeaderboardResponse(BaseModel):
    edition_label: str
    year: Optional[int] = None
    is_live: bool
    available_years: List[int]
    top_athletes: List[BestAthleteOut]  # Reflects top 5 individual athletes


# --- Leadership & Sports Incharge Schemas ---
class LeadershipMemberBase(BaseModel):
    name: str
    designation: str
    category: str = "executive"  # 'executive' or 'sports'
    bio: Optional[str] = None
    image_url: Optional[str] = None
    display_order: int = 0
    is_active: bool = True
    contact_email: Optional[str] = None


class LeadershipMemberCreate(LeadershipMemberBase):
    pass


class LeadershipMemberUpdate(BaseModel):
    name: Optional[str] = None
    designation: Optional[str] = None
    category: Optional[str] = None
    bio: Optional[str] = None
    image_url: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None
    contact_email: Optional[str] = None


class LeadershipMemberOut(LeadershipMemberBase):
    id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True


class LeadershipSectionResponse(BaseModel):
    title: str = "University Patrons & Sports Directorate"
    subtitle: str = "Guiding Sarala Birla University toward world-class academic and athletic achievements."
    executive_members: List[LeadershipMemberOut] = []
    sports_incharges: List[LeadershipMemberOut] = []
    all_members: List[LeadershipMemberOut] = []

