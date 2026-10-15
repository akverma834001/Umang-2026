import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.database.session import get_db
from backend.app.models.sport import Sport
from backend.app.models.event import Event
from backend.app.models.venue import Venue
from backend.app.models.team import Team
from backend.app.models.result import Result
from backend.app.models.registration_form import RegistrationForm
from backend.app.models.announcement import Announcement
from backend.app.models.settings import WebsiteSettings
from backend.app.models.historical_edition import HistoricalEdition, YearlyHouseStanding, HistoricalSportRecord
from backend.app.models.leadership import LeadershipMember
from backend.app.schemas import (
    SportOut, EventOut, VenueOut, TeamOut, ResultOut, FormOut,
    AnnouncementOut, SettingsOut, LeaderboardItem,
    HistoricalEditionOut, HistoricalEditionDetailOut,
    BestAthletesLeaderboardResponse,
    LeadershipSectionResponse, LeadershipMemberOut
)
from backend.app.services.ledger_service import calculate_leaderboard, get_team_points_breakdown
from backend.app.services.athlete_leaderboard_service import calculate_best_athletes_leaderboard

router = APIRouter(prefix="/api", tags=["Public Sports Portal"])


# --- Sports Catalog ---
@router.get("/sports", response_model=List[SportOut])
def get_public_sports(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve public sports disciplines offered at UMANG Sports Meet."""
    query = db.query(Sport)
    if search:
        pattern = f"%{search}%"
        query = query.filter(or_(Sport.name.ilike(pattern), Sport.description.ilike(pattern)))
    if category and category.lower() != "all":
        query = query.filter(Sport.category == category)
    if gender and gender.lower() != "all":
        query = query.filter(Sport.gender == gender)
    return query.order_by(Sport.name.asc()).all()


@router.get("/sports/{id_or_slug}", response_model=SportOut)
def get_public_sport_detail(id_or_slug: str, db: Session = Depends(get_db)):
    """Retrieve sport details and rules by ID or slug."""
    if id_or_slug.isdigit():
        sport = db.query(Sport).filter(or_(Sport.id == int(id_or_slug), Sport.slug == id_or_slug)).first()
    else:
        sport = db.query(Sport).filter(Sport.slug == id_or_slug).first()

    if not sport:
        raise HTTPException(status_code=404, detail="Sport not found.")
    return sport


# --- Live Matches Hub ---
@router.get("/live", response_model=List[EventOut])
def get_live_matches(db: Session = Depends(get_db)):
    """
    Retrieve real-time running sports matches and live scoreboards.
    Strictly filters for status == 'LIVE' and published_state == 'PUBLISHED'.
    """
    matches = (
        db.query(Event)
        .filter(Event.published_state == "PUBLISHED", Event.status == "LIVE")
        .order_by(Event.start_time.asc())
        .all()
    )
    return matches


# --- Matches / Events Schedule & Directory ---
@router.get("/events", response_model=List[EventOut])
@router.get("/matches", response_model=List[EventOut])
def get_public_events(
    search: Optional[str] = Query(None, description="Search match title or sport"),
    category: Optional[str] = Query(None, description="Filter by category"),
    sport_id: Optional[int] = Query(None, description="Filter by sport"),
    gender: Optional[str] = Query(None, description="Filter by gender (Boys, Girls, Mixed)"),
    status: Optional[str] = Query(None, description="Filter by match status (UPCOMING, LIVE, COMPLETED)"),
    event_date: Optional[datetime.date] = Query(None, description="Filter by date"),
    house_id: Optional[int] = Query(None, description="Filter by House participating"),
    db: Session = Depends(get_db)
):
    """
    Public matches & sports competition catalog.
    Strictly filters for published_state == 'PUBLISHED'.
    """
    query = db.query(Event).filter(Event.published_state == "PUBLISHED")

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Event.title.ilike(search_pattern),
                Event.description.ilike(search_pattern)
            )
        )

    if category and category.lower() != "all":
        query = query.filter(Event.category.ilike(category))

    if sport_id:
        query = query.filter(Event.sport_id == sport_id)

    if gender and gender.lower() != "all":
        query = query.filter(Event.gender == gender)

    if status and status.lower() != "all":
        query = query.filter(Event.status == status.upper())

    if event_date:
        query = query.filter(Event.event_date == event_date)

    if house_id:
        query = query.filter(or_(Event.team_a_id == house_id, Event.team_b_id == house_id))

    events = query.order_by(Event.event_date.asc(), Event.start_time.asc()).all()
    return events


@router.get("/events/{id_or_slug}", response_model=EventOut)
@router.get("/matches/{id_or_slug}", response_model=EventOut)
def get_public_event_detail(id_or_slug: str, db: Session = Depends(get_db)):
    """Retrieve detailed view of a published sports match by ID or slug."""
    query = db.query(Event).filter(Event.published_state == "PUBLISHED")
    if id_or_slug.isdigit():
        event = query.filter(or_(Event.id == int(id_or_slug), Event.slug == id_or_slug)).first()
    else:
        event = query.filter(Event.slug == id_or_slug).first()

    if not event:
        raise HTTPException(status_code=404, detail="Match not found or not currently published.")
    return event


@router.get("/schedule", response_model=List[EventOut])
def get_public_schedule(
    category: Optional[str] = None,
    sport_id: Optional[int] = None,
    venue_id: Optional[int] = None,
    date_val: Optional[datetime.date] = None,
    db: Session = Depends(get_db)
):
    """
    Public conflict-free chronological timetable.
    Strictly orders by date and time in Asia/Kolkata timezone.
    """
    query = db.query(Event).filter(Event.published_state == "PUBLISHED")
    if category and category.lower() != "all":
        query = query.filter(Event.category.ilike(category))
    if sport_id:
        query = query.filter(Event.sport_id == sport_id)
    if venue_id:
        query = query.filter(Event.venue_id == venue_id)
    if date_val:
        query = query.filter(Event.event_date == date_val)

    return query.order_by(Event.event_date.asc(), Event.start_time.asc()).all()


# --- Leaderboard & House Standings ---
OFFICIAL_HOUSES = {"VISH", "CHAN", "PATA", "RAMA"}


@router.get("/houses", response_model=List[TeamOut])
def get_public_houses(db: Session = Depends(get_db)):
    """Retrieve the official UMANG championship houses (Vishvesvaraya, Chanakya, Patanjali, Ramanujan)."""
    return db.query(Team).filter(Team.code.in_(OFFICIAL_HOUSES), Team.is_active == True).order_by(Team.id.asc()).all()


@router.get("/leaderboard", response_model=List[LeaderboardItem])
def get_public_leaderboard(db: Session = Depends(get_db)):
    """
    Official Inter-House Championship Standings.
    Dynamically calculated from validated PointLedger entries.
    """
    return calculate_leaderboard(db)


@router.get("/leaderboard/breakdown/{team_id}")
def get_public_team_points_breakdown(team_id: int, db: Session = Depends(get_db)):
    """Detailed sports point breakdown for a specific house."""
    return get_team_points_breakdown(db, team_id)


@router.get("/leaderboard/athletes", response_model=BestAthletesLeaderboardResponse)
def get_public_athletes_leaderboard(
    year: Optional[int] = Query(None, description="Tournament year e.g. 2026, 2025, 2024. Defaults to live/latest"),
    limit: int = Query(5, description="Number of top individual athletes to return (reflects top 5)"),
    db: Session = Depends(get_db)
):
    """
    Official Best Athletes Individual Leaderboard.
    Aggregates individual student athlete scores (solo events + team events) referenced by Student Enrollment Number.
    Returns exactly the top 5 individual athletes with podium highlighting.
    """
    return calculate_best_athletes_leaderboard(db, year=year, limit=limit)


# --- Results ---
@router.get("/results", response_model=List[ResultOut])
def get_public_results(
    category: Optional[str] = None,
    sport_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Published match and competition results."""
    query = (
        db.query(Result)
        .join(Event, Event.id == Result.event_id)
        .filter(Result.published_state == "PUBLISHED")
    )
    if category and category.lower() != "all":
        query = query.filter(Result.category.ilike(category))
    if sport_id:
        query = query.filter(Event.sport_id == sport_id)

    results = query.order_by(Result.created_at.desc()).all()
    out = []
    for r in results:
        res_dict = ResultOut.model_validate(r)
        if r.event:
            res_dict.event_title = r.event.title
        if r.winner_team:
            res_dict.winner_team_name = r.winner_team.name
        if r.runner_up_team:
            res_dict.runner_up_team_name = r.runner_up_team.name
        if r.third_place_team:
            res_dict.third_place_team_name = r.third_place_team.name
        out.append(res_dict)
    return out


# --- Registration Forms (Google Forms) ---
@router.get("/forms", response_model=List[FormOut])
def get_public_registration_forms(db: Session = Depends(get_db)):
    """
    Official sports registration links.
    External Google Forms only; no internal participant accounts.
    """
    forms = (
        db.query(RegistrationForm)
        .filter(RegistrationForm.published_state == "PUBLISHED")
        .order_by(RegistrationForm.closing_date.asc())
        .all()
    )
    out = []
    for f in forms:
        item = FormOut.model_validate(f)
        if f.event:
            item.event_title = f.event.title
        if f.sport:
            item.sport_name = f.sport.name
        out.append(item)
    return out


# --- Announcements ---
@router.get("/announcements", response_model=List[AnnouncementOut])
def get_public_announcements(
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Published sports meet notices, schedule changes, and alerts."""
    query = db.query(Announcement).filter(Announcement.published_state == "PUBLISHED")
    if priority and priority.lower() != "all":
        query = query.filter(Announcement.priority == priority.upper())

    return query.order_by(Announcement.published_at.desc()).all()


# --- Sports Venues ---
@router.get("/venues", response_model=List[VenueOut])
def get_public_venues(db: Session = Depends(get_db)):
    """SBU sports facilities, courts, and athletic tracks."""
    return db.query(Venue).filter(Venue.is_active == True).order_by(Venue.name.asc()).all()


# --- Settings & Institution Theming ---
@router.get("/settings", response_model=SettingsOut)
def get_public_settings(db: Session = Depends(get_db)):
    """Official university metadata, festival dates, and branding."""
    settings = db.query(WebsiteSettings).first()
    if not settings:
        settings = WebsiteSettings(id=1)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


# --- Past Years Archives & Hall of Fame ---
@router.get("/archives", response_model=List[HistoricalEditionDetailOut])
def get_public_archives(db: Session = Depends(get_db)):
    """Retrieve all published past years' sports meet editions and records."""
    return (
        db.query(HistoricalEdition)
        .filter(HistoricalEdition.is_published == True)
        .order_by(HistoricalEdition.year.desc())
        .all()
    )


@router.get("/archives/{year}", response_model=HistoricalEditionDetailOut)
def get_public_archive_detail(year: int, db: Session = Depends(get_db)):
    """Retrieve full details of a specific past year's championship edition."""
    edition = (
        db.query(HistoricalEdition)
        .filter(HistoricalEdition.year == year, HistoricalEdition.is_published == True)
        .first()
    )
    if not edition:
        raise HTTPException(status_code=404, detail=f"Sports meet records for year {year} not found.")
    return edition


@router.get("/archives-stats")
def get_public_archives_stats(db: Session = Depends(get_db)):
    """Summary statistics across all historical editions (trophy counts, records)."""
    editions = db.query(HistoricalEdition).filter(HistoricalEdition.is_published == True).all()
    teams = db.query(Team).filter(Team.is_active == True).all()

    # Trophies tally
    trophy_counts = {t.name: {"id": t.id, "name": t.name, "code": t.code, "color": t.color, "championships": 0, "runners_up": 0, "third_places": 0, "total_historical_points": 0} for t in teams}

    for ed in editions:
        if ed.champion_team and ed.champion_team.name in trophy_counts:
            trophy_counts[ed.champion_team.name]["championships"] += 1
        if ed.runner_up_team and ed.runner_up_team.name in trophy_counts:
            trophy_counts[ed.runner_up_team.name]["runners_up"] += 1
        if ed.third_place_team and ed.third_place_team.name in trophy_counts:
            trophy_counts[ed.third_place_team.name]["third_places"] += 1
        for s in ed.standings:
            if s.team_name in trophy_counts:
                trophy_counts[s.team_name]["total_historical_points"] += s.total_points

    years_available = sorted([ed.year for ed in editions], reverse=True)

    return {
        "total_editions": len(editions),
        "years": years_available,
        "house_trophy_tally": list(trophy_counts.values())
    }


# --- University Leadership & Sports Incharges ---
@router.get("/leadership", response_model=LeadershipSectionResponse)
def get_public_leadership(db: Session = Depends(get_db)):
    """
    Retrieve official university patrons, executive leadership, Director General,
    and all sports incharges for the public portal.
    """
    members = (
        db.query(LeadershipMember)
        .filter(LeadershipMember.is_active == True)
        .order_by(LeadershipMember.display_order.asc(), LeadershipMember.id.asc())
        .all()
    )
    exec_members = [m for m in members if m.category == "executive"]
    sports_members = [m for m in members if m.category == "sports"]

    return {
        "title": "University Patrons & Sports Directorate",
        "subtitle": "Guiding Sarala Birla University toward world-class academic and athletic achievements.",
        "executive_members": exec_members,
        "sports_incharges": sports_members,
        "all_members": members,
    }


