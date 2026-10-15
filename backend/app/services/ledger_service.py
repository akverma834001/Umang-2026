import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi import HTTPException, status
from backend.app.models.event import Event
from backend.app.models.team import Team
from backend.app.models.result import Result
from backend.app.models.point_ledger import PointLedger
from backend.app.models.settings import WebsiteSettings
from backend.app.services.audit_service import log_audit


OFFICIAL_HOUSES = {"VISH", "CHAN", "PATA", "RAMA"}


def calculate_leaderboard(db: Session) -> List[Dict[str, Any]]:
    """
    Dynamically calculate the inter-house/team leaderboard based strictly
    on valid point ledger entries tied to PUBLISHED results for the 4 official houses.
    """
    # Query strictly the 4 official houses
    teams = db.query(Team).filter(Team.is_active == True, Team.code.in_(OFFICIAL_HOUSES)).all()
    team_dict = {
        t.id: {
            "id": t.id,
            "name": t.name,
            "code": t.code,
            "color": t.color,
            "logo_url": t.logo_url,
            "total_points": 0,
            "first_places": 0,
            "second_places": 0,
            "third_places": 0,
            "event_count": 0
        } for t in teams
    }

    # Aggregate valid points from published results
    ledger_entries = (
        db.query(PointLedger, Result)
        .join(Result, Result.id == PointLedger.result_id)
        .filter(
            PointLedger.is_valid == True,
            Result.published_state == "PUBLISHED"
        )
        .all()
    )

    for entry, res in ledger_entries:
        if entry.team_id in team_dict:
            team_dict[entry.team_id]["total_points"] += entry.points
            team_dict[entry.team_id]["event_count"] += 1
            if "1st" in entry.position:
                team_dict[entry.team_id]["first_places"] += 1
            elif "2nd" in entry.position:
                team_dict[entry.team_id]["second_places"] += 1
            elif "3rd" in entry.position:
                team_dict[entry.team_id]["third_places"] += 1

    # Sort descending by total_points, then first_places
    sorted_leaderboard = sorted(
        team_dict.values(),
        key=lambda x: (x["total_points"], x["first_places"], x["second_places"]),
        reverse=True
    )

    # Assign rank
    for idx, item in enumerate(sorted_leaderboard, start=1):
        item["rank"] = idx

    return sorted_leaderboard


def get_team_points_breakdown(db: Session, team_id: int) -> Dict[str, Any]:
    """Retrieve full audit breakdown of how a house/team earned its sports leaderboard points."""
    team = db.query(Team).filter(Team.id == team_id, Team.code.in_(OFFICIAL_HOUSES)).first()
    if not team:
        raise HTTPException(status_code=404, detail="Official house not found.")

    entries = (
        db.query(PointLedger, Event, Result)
        .join(Result, Result.id == PointLedger.result_id)
        .join(Event, Event.id == PointLedger.event_id)
        .filter(
            PointLedger.team_id == team_id,
            PointLedger.is_valid == True,
            Result.published_state == "PUBLISHED"
        )
        .order_by(PointLedger.created_at.desc())
        .all()
    )

    breakdown = []
    total = 0
    for ledger, event, result in entries:
        breakdown.append({
            "event_id": event.id,
            "event_title": event.title,
            "category": result.category,
            "position": ledger.position,
            "points": ledger.points,
            "awarded_at": ledger.created_at.isoformat()
        })
        total += ledger.points

    return {
        "team_id": team.id,
        "team_name": team.name,
        "team_code": team.code,
        "team_color": team.color,
        "total_points": total,
        "breakdown": breakdown
    }


def create_or_update_result_with_ledger(
    db: Session,
    admin_username: str,
    event_id: int,
    category: str,
    winner_team_id: int,
    winner_points: int,
    runner_up_team_id: Optional[int] = None,
    runner_up_points: int = 0,
    third_place_team_id: Optional[int] = None,
    third_place_points: int = 0,
    winner_participant: Optional[str] = None,
    winner_enrollment_no: Optional[str] = None,
    winner_players: Optional[str] = None,
    winner_metric: Optional[str] = None,
    runner_up_participant: Optional[str] = None,
    runner_up_enrollment_no: Optional[str] = None,
    runner_up_players: Optional[str] = None,
    runner_up_metric: Optional[str] = None,
    third_place_participant: Optional[str] = None,
    third_place_enrollment_no: Optional[str] = None,
    third_place_players: Optional[str] = None,
    third_place_metric: Optional[str] = None,
    remarks: Optional[str] = None,
    published_state: str = "PUBLISHED",
    client_version: Optional[int] = None,
    is_correction: bool = False,
    confirmation: bool = False
) -> Result:
    """
    Transactionally creates or updates a match or competition result and synchronizes the
    associated PointLedger records. Prevents duplicates and maintains an immutable audit log.
    """
    # 1. Validate event/match existence
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Sports event or match not found.")

    # 2. Validate winner house/team
    winner_team = db.query(Team).filter(Team.id == winner_team_id).first()
    if not winner_team:
        raise HTTPException(status_code=404, detail="Winner house/team not found.")

    # 3. If points not specified, check WebsiteSettings defaults
    if winner_points <= 0 or (runner_up_team_id and runner_up_points <= 0) or (third_place_team_id and third_place_points <= 0):
        settings = db.query(WebsiteSettings).first()
        if settings:
            if winner_points <= 0:
                winner_points = settings.points_first_place or 10
            if runner_up_team_id and runner_up_points <= 0:
                runner_up_points = settings.points_second_place or 7
            if third_place_team_id and third_place_points <= 0:
                third_place_points = settings.points_third_place or 5

    # 4. Check for existing result for this event and category
    existing_result = db.query(Result).filter(
        Result.event_id == event_id,
        Result.category == category
    ).first()

    try:
        if existing_result:
            if not is_correction:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"A result already exists for event '{event.title}' under category '{category}'. Edit the existing result instead of creating a duplicate."
                )
            
            # If already published, editing requires explicit confirmation
            if existing_result.published_state == "PUBLISHED" and not confirmation:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Modifying an already published result requires explicit confirmation to protect leaderboard integrity."
                )

            # Optimistic lock check
            if client_version is not None and existing_result.version != client_version:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="This result was updated by another session. Please refresh."
                )

            old_snapshot = {
                "winner_team_id": existing_result.winner_team_id,
                "winner_points": existing_result.winner_points,
                "winner_participant": existing_result.winner_participant,
                "winner_metric": existing_result.winner_metric,
                "runner_up_team_id": existing_result.runner_up_team_id,
                "runner_up_points": existing_result.runner_up_points,
                "third_place_team_id": existing_result.third_place_team_id,
                "third_place_points": existing_result.third_place_points,
                "published_state": existing_result.published_state
            }

            # Update existing result
            existing_result.winner_team_id = winner_team_id
            existing_result.winner_points = winner_points
            existing_result.winner_participant = winner_participant
            existing_result.winner_enrollment_no = winner_enrollment_no
            existing_result.winner_players = winner_players
            existing_result.winner_metric = winner_metric
            
            existing_result.runner_up_team_id = runner_up_team_id
            existing_result.runner_up_points = runner_up_points
            existing_result.runner_up_participant = runner_up_participant
            existing_result.runner_up_enrollment_no = runner_up_enrollment_no
            existing_result.runner_up_players = runner_up_players
            existing_result.runner_up_metric = runner_up_metric
            
            existing_result.third_place_team_id = third_place_team_id
            existing_result.third_place_points = third_place_points
            existing_result.third_place_participant = third_place_participant
            existing_result.third_place_enrollment_no = third_place_enrollment_no
            existing_result.third_place_players = third_place_players
            existing_result.third_place_metric = third_place_metric
            
            existing_result.remarks = remarks
            existing_result.published_state = published_state
            existing_result.version += 1
            existing_result.updated_at = datetime.datetime.utcnow()

            # Remove previous ledger entries for this result to rebuild cleanly
            db.query(PointLedger).filter(PointLedger.result_id == existing_result.id).delete()
            target_result = existing_result

            # Log audit
            log_audit(
                db=db,
                admin_username=admin_username,
                action="RESULT_CORRECTED",
                entity_type="RESULT",
                entity_id=target_result.id,
                old_values=old_snapshot,
                new_values={
                    "winner_team_id": winner_team_id,
                    "winner_points": winner_points,
                    "runner_up_team_id": runner_up_team_id,
                    "runner_up_points": runner_up_points,
                    "third_place_team_id": third_place_team_id,
                    "third_place_points": third_place_points,
                    "published_state": published_state
                }
            )

        else:
            # Create new result
            target_result = Result(
                event_id=event_id,
                category=category,
                winner_team_id=winner_team_id,
                winner_points=winner_points,
                winner_participant=winner_participant,
                winner_enrollment_no=winner_enrollment_no,
                winner_players=winner_players,
                winner_metric=winner_metric,
                runner_up_team_id=runner_up_team_id,
                runner_up_points=runner_up_points,
                runner_up_participant=runner_up_participant,
                runner_up_enrollment_no=runner_up_enrollment_no,
                runner_up_players=runner_up_players,
                runner_up_metric=runner_up_metric,
                third_place_team_id=third_place_team_id,
                third_place_points=third_place_points,
                third_place_participant=third_place_participant,
                third_place_enrollment_no=third_place_enrollment_no,
                third_place_players=third_place_players,
                third_place_metric=third_place_metric,
                remarks=remarks,
                published_state=published_state,
                version=1
            )
            db.add(target_result)
            db.flush()

            log_audit(
                db=db,
                admin_username=admin_username,
                action="RESULT_CREATED",
                entity_type="RESULT",
                entity_id=target_result.id,
                new_values={
                    "event_id": event_id,
                    "category": category,
                    "winner_team_id": winner_team_id,
                    "winner_points": winner_points
                }
            )

        # 5. Generate PointLedger entries
        # 1st Place Ledger Row
        ledger_winner = PointLedger(
            result_id=target_result.id,
            event_id=event_id,
            team_id=winner_team_id,
            points=winner_points,
            position="1st Place (Winner)",
            is_valid=True
        )
        db.add(ledger_winner)

        # 2nd Place Ledger Row
        if runner_up_team_id and runner_up_points > 0:
            ledger_runner_up = PointLedger(
                result_id=target_result.id,
                event_id=event_id,
                team_id=runner_up_team_id,
                points=runner_up_points,
                position="2nd Place (Runner-up)",
                is_valid=True
            )
            db.add(ledger_runner_up)

        # 3rd Place Ledger Row
        if third_place_team_id and third_place_points > 0:
            ledger_third = PointLedger(
                result_id=target_result.id,
                event_id=event_id,
                team_id=third_place_team_id,
                points=third_place_points,
                position="3rd Place",
                is_valid=True
            )
            db.add(ledger_third)

        # Also update event's winner_team_id if matching
        if event.winner_team_id != winner_team_id:
            event.winner_team_id = winner_team_id
            event.status = "COMPLETED"

        db.commit()
        db.refresh(target_result)
        return target_result

    except Exception as e:
        db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database transaction error while recording result and ledger: {str(e)}"
        )
