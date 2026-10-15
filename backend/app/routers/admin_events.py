import re
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.event import Event
from backend.app.models.result import Result
from backend.app.models.registration_form import RegistrationForm
from backend.app.schemas import EventCreate, EventUpdate, EventOut, EventLiveScoreUpdate
from backend.app.services.auth_service import get_current_admin
from backend.app.services.conflict_service import check_schedule_conflicts
from backend.app.services.validation_service import (
    verify_optimistic_lock,
    validate_event_status_transition
)
from backend.app.services.audit_service import log_audit

router = APIRouter(prefix="/api/admin/events", tags=["Admin Matches & Events"])


def generate_slug(title: str, date_val: datetime.date) -> str:
    clean = re.sub(r"[^a-zA-Z0-9\s-]", "", title).strip().lower()
    clean = re.sub(r"[\s-]+", "-", clean)
    return f"{clean}-{date_val.strftime('%Y%m%d')}"


@router.get("", response_model=List[EventOut])
def list_admin_events(
    state: Optional[str] = None,
    sport_id: Optional[int] = None,
    status_filter: Optional[str] = None,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all sports matches/events including DRAFT, PUBLISHED, and ARCHIVED."""
    query = db.query(Event)
    if state:
        query = query.filter(Event.published_state == state.upper())
    if sport_id:
        query = query.filter(Event.sport_id == sport_id)
    if status_filter:
        query = query.filter(Event.status == status_filter.upper())
    return query.order_by(Event.event_date.desc(), Event.start_time.asc()).all()


@router.get("/{id}", response_model=EventOut)
def get_admin_event(
    id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retrieve full sports match/event detail including draft preview."""
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Sports match/event not found.")
    return event


@router.post("/check-conflict")
def check_conflicts(
    venue_id: Optional[int],
    event_date: datetime.date,
    start_time: str,
    end_time: str,
    exclude_event_id: Optional[int] = None,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Preview potential venue-time conflicts before saving."""
    conflicts = check_schedule_conflicts(
        db=db,
        venue_id=venue_id,
        event_date=event_date,
        start_time=start_time,
        end_time=end_time,
        exclude_event_id=exclude_event_id
    )
    return {"has_conflict": len(conflicts) > 0, "conflicts": conflicts}


@router.post("", response_model=EventOut, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: EventCreate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new sports match/event in DRAFT or PUBLISHED state with conflict checking."""
    # Check venue conflicts if being published or scheduled
    conflicts = check_schedule_conflicts(
        db=db,
        venue_id=payload.venue_id,
        event_date=payload.event_date,
        start_time=payload.start_time,
        end_time=payload.end_time
    )
    if conflicts and payload.published_state == "PUBLISHED":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Scheduling conflict detected: Venue is already booked for '{conflicts[0]['title']}' during this time window. Resolve conflict before publishing."
        )

    base_slug = generate_slug(payload.title, payload.event_date)
    slug = base_slug
    counter = 1
    while db.query(Event).filter(Event.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    event = Event(
        title=payload.title,
        slug=slug,
        description=payload.description,
        category=payload.category,
        sport_id=payload.sport_id,
        gender=payload.gender,
        event_type=payload.event_type,
        round=payload.round,
        stage=payload.stage,
        team_a_id=payload.team_a_id,
        team_b_id=payload.team_b_id,
        score_a=payload.score_a,
        score_b=payload.score_b,
        winner_team_id=payload.winner_team_id,
        venue_id=payload.venue_id,
        event_date=payload.event_date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        banner_url=payload.banner_url,
        rules=payload.rules,
        status=payload.status.upper(),
        published_state=payload.published_state.upper(),
        version=1
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    log_audit(
        db=db,
        admin_username=current_admin["username"] if "username" in current_admin else current_admin.get("sub", "admin"),
        action="MATCH_CREATED",
        entity_type="EVENT",
        entity_id=event.id,
        new_values={"title": event.title, "slug": event.slug, "published_state": event.published_state}
    )

    return event


@router.put("/{id}", response_model=EventOut)
def update_event(
    id: int,
    payload: EventUpdate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update match/event with optimistic concurrency control and lifecycle checks."""
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Sports match/event not found.")

    # Optimistic locking check
    verify_optimistic_lock(payload.version, event.version, f"Match '{event.title}'")

    # Lifecycle transition check
    if payload.status:
        validate_event_status_transition(
            current_status=event.status,
            new_status=payload.status.upper(),
            allow_override=payload.override_status_check
        )

    # Schedule conflict check if venue/time/date or state is changed
    target_venue = payload.venue_id if payload.venue_id is not None else event.venue_id
    target_date = payload.event_date if payload.event_date is not None else event.event_date
    target_start = payload.start_time if payload.start_time is not None else event.start_time
    target_end = payload.end_time if payload.end_time is not None else event.end_time
    target_published = payload.published_state.upper() if payload.published_state else event.published_state

    if target_published == "PUBLISHED":
        conflicts = check_schedule_conflicts(
            db=db,
            venue_id=target_venue,
            event_date=target_date,
            start_time=target_start,
            end_time=target_end,
            exclude_event_id=event.id
        )
        if conflicts:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Scheduling conflict detected with '{conflicts[0]['title']}'. Resolve conflict before publishing."
            )

    old_snapshot = {
        "title": event.title,
        "status": event.status,
        "published_state": event.published_state,
        "start_time": event.start_time,
        "end_time": event.end_time,
        "version": event.version
    }

    # Apply updates
    if payload.title is not None:
        event.title = payload.title
    if payload.description is not None:
        event.description = payload.description
    if payload.category is not None:
        event.category = payload.category
    if payload.sport_id is not None:
        event.sport_id = payload.sport_id
    if payload.gender is not None:
        event.gender = payload.gender
    if payload.event_type is not None:
        event.event_type = payload.event_type
    if payload.round is not None:
        event.round = payload.round
    if payload.stage is not None:
        event.stage = payload.stage
    if payload.team_a_id is not None:
        event.team_a_id = payload.team_a_id
    if payload.team_b_id is not None:
        event.team_b_id = payload.team_b_id
    if payload.score_a is not None:
        event.score_a = payload.score_a
    if payload.score_b is not None:
        event.score_b = payload.score_b
    if payload.winner_team_id is not None:
        event.winner_team_id = payload.winner_team_id
    if payload.venue_id is not None:
        event.venue_id = payload.venue_id
    if payload.event_date is not None:
        event.event_date = payload.event_date
    if payload.start_time is not None:
        event.start_time = payload.start_time
    if payload.end_time is not None:
        event.end_time = payload.end_time
    if payload.banner_url is not None:
        event.banner_url = payload.banner_url
    if payload.rules is not None:
        event.rules = payload.rules
    if payload.status is not None:
        event.status = payload.status.upper()
    if payload.published_state is not None:
        event.published_state = payload.published_state.upper()

    event.version += 1
    event.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(event)

    log_audit(
        db=db,
        admin_username=current_admin["username"] if "username" in current_admin else current_admin.get("sub", "admin"),
        action="MATCH_UPDATED",
        entity_type="EVENT",
        entity_id=event.id,
        old_values=old_snapshot,
        new_values={"title": event.title, "status": event.status, "published_state": event.published_state, "version": event.version}
    )

    return event


@router.put("/{id}/live-score", response_model=EventOut)
def update_live_score(
    id: int,
    payload: EventLiveScoreUpdate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Quick update for live scores, quarters, and real-time commentary notes."""
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Sports match not found.")

    if payload.status:
        validate_event_status_transition(
            current_status=event.status,
            new_status=payload.status.upper()
        )
        event.status = payload.status.upper()

    if payload.score_a is not None:
        event.score_a = payload.score_a
    if payload.score_b is not None:
        event.score_b = payload.score_b

    # Composite live_score string
    if payload.live_score is not None:
        event.live_score = payload.live_score
    elif payload.score_a is not None and payload.score_b is not None:
        event.live_score = f"{payload.score_a} — {payload.score_b}"

    if payload.live_round is not None:
        event.live_round = payload.live_round
    if payload.live_stage is not None:
        event.live_stage = payload.live_stage
    if payload.live_status_detail is not None:
        event.live_status_detail = payload.live_status_detail
    if payload.live_notes is not None:
        event.live_notes = payload.live_notes

    event.version += 1
    event.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(event)

    log_audit(
        db=db,
        admin_username=current_admin["username"] if "username" in current_admin else current_admin.get("sub", "admin"),
        action="MATCH_SCORE_UPDATED",
        entity_type="EVENT",
        entity_id=event.id,
        new_values={
            "live_score": event.live_score,
            "status": event.status,
            "live_status_detail": event.live_status_detail
        }
    )

    return event


@router.delete("/{id}")
def delete_or_archive_event(
    id: int,
    hard_delete: bool = False,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Archive event for audit integrity.
    Blocks hard delete if results or registrations exist.
    """
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Sports match not found.")

    # Referential integrity check
    results_count = db.query(Result).filter(Result.event_id == id).count()
    forms_count = db.query(RegistrationForm).filter(RegistrationForm.event_id == id).count()

    if hard_delete:
        if results_count > 0 or forms_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot permanently delete this match because it has {results_count} published result(s) and {forms_count} registration form(s). Use Archive instead to preserve historical integrity."
            )
        db.delete(event)
        db.commit()

        log_audit(
            db=db,
            admin_username=current_admin["username"] if "username" in current_admin else current_admin.get("sub", "admin"),
            action="MATCH_DELETED_PERMANENTLY",
            entity_type="EVENT",
            entity_id=id,
            old_values={"title": event.title}
        )
        return {"detail": "Match record permanently deleted."}

    # Default: Soft Archive
    event.published_state = "ARCHIVED"
    event.version += 1
    event.updated_at = datetime.datetime.utcnow()
    db.commit()

    log_audit(
        db=db,
        admin_username=current_admin["username"] if "username" in current_admin else current_admin.get("sub", "admin"),
        action="MATCH_ARCHIVED",
        entity_type="EVENT",
        entity_id=id,
        new_values={"published_state": "ARCHIVED"}
    )

    return {"detail": "Match archived successfully. Hidden from public view but preserved for audit."}


@router.post("/{id}/archive", response_model=EventOut)
def archive_event(
    id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Explicitly archive a sports match, removing it from public view while preserving history."""
    event = db.query(Event).filter(Event.id == id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Sports match not found.")

    event.published_state = "ARCHIVED"
    event.version += 1
    event.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(event)

    log_audit(
        db=db,
        admin_username=current_admin["username"] if "username" in current_admin else current_admin.get("sub", "admin"),
        action="MATCH_ARCHIVED",
        entity_type="EVENT",
        entity_id=id,
        new_values={"published_state": "ARCHIVED"}
    )

    return event

