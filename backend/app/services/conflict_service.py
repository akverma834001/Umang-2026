import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.event import Event


def check_schedule_conflicts(
    db: Session,
    venue_id: Optional[int],
    event_date: datetime.date,
    start_time: str,
    end_time: str,
    exclude_event_id: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    Check if an event at venue_id on event_date with [start_time, end_time]
    conflicts with any existing published or active event.
    Returns a list of conflicting events with details.
    """
    if not venue_id:
        return []

    # Query events at the same venue and date that are not cancelled
    query = db.query(Event).filter(
        Event.venue_id == venue_id,
        Event.event_date == event_date,
        Event.status != "CANCELLED",
        Event.published_state != "ARCHIVED"
    )
    if exclude_event_id:
        query = query.filter(Event.id != exclude_event_id)

    events_at_venue = query.all()
    conflicts = []

    # Standard time interval overlap check:
    # Overlaps if (event.start_time < new_end_time) and (new_start_time < event.end_time)
    for ev in events_at_venue:
        if ev.start_time < end_time and start_time < ev.end_time:
            conflicts.append({
                "event_id": ev.id,
                "title": ev.title,
                "start_time": ev.start_time,
                "end_time": ev.end_time,
                "status": ev.status,
                "published_state": ev.published_state,
                "conflict_reason": f"Overlaps with '{ev.title}' ({ev.start_time} - {ev.end_time})"
            })

    return conflicts
