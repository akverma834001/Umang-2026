import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.app.database.session import get_db
from backend.app.models.historical_edition import HistoricalEdition, YearlyHouseStanding, HistoricalSportRecord
from backend.app.models.team import Team
from backend.app.models.admin import Admin
from backend.app.schemas import (
    HistoricalEditionOut,
    HistoricalEditionDetailOut,
    HistoricalEditionCreate,
    HistoricalEditionUpdate,
    YearlyHouseStandingCreate,
    YearlyHouseStandingOut,
    HistoricalSportRecordCreate,
    HistoricalSportRecordOut
)
from backend.app.services.auth_service import get_current_admin
from backend.app.services.audit_service import log_audit

router = APIRouter(prefix="/api/admin/archives", tags=["Admin Archives & Past Records"])


def extract_admin_username(admin_info) -> str:
    if isinstance(admin_info, dict):
        return admin_info.get("username") or admin_info.get("sub") or "admin"
    return getattr(admin_info, "username", "admin")


@router.get("", response_model=List[HistoricalEditionDetailOut])
def list_admin_archives(
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    """List all yearly sports meet archive editions."""
    return db.query(HistoricalEdition).order_by(HistoricalEdition.year.desc()).all()


@router.get("/{id_or_year}", response_model=HistoricalEditionDetailOut)
def get_admin_archive(
    id_or_year: str,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    """Retrieve full details of an edition by ID or Year."""
    if id_or_year.isdigit() and len(id_or_year) != 4:
        edition = db.query(HistoricalEdition).filter(HistoricalEdition.id == int(id_or_year)).first()
    else:
        try:
            year_val = int(id_or_year)
            edition = db.query(HistoricalEdition).filter(HistoricalEdition.year == year_val).first()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid year or ID parameter.")

    if not edition:
        raise HTTPException(status_code=404, detail="Edition archive not found.")
    return edition


@router.post("", response_model=HistoricalEditionDetailOut, status_code=status.HTTP_201_CREATED)
def create_admin_archive(
    data: HistoricalEditionCreate,
    request: Request,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    """Create a new yearly sports archive edition with house standings and sport records."""
    existing = db.query(HistoricalEdition).filter(HistoricalEdition.year == data.year).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An archive record for year {data.year} already exists."
        )

    edition = HistoricalEdition(
        year=data.year,
        edition_title=data.edition_title,
        theme=data.theme,
        start_date=data.start_date,
        end_date=data.end_date,
        chief_guest=data.chief_guest,
        total_athletes=data.total_athletes,
        summary=data.summary,
        banner_url=data.banner_url,
        champion_team_id=data.champion_team_id,
        runner_up_team_id=data.runner_up_team_id,
        third_place_team_id=data.third_place_team_id,
        best_athlete_boys=data.best_athlete_boys,
        best_athlete_girls=data.best_athlete_girls,
        fair_play_house=data.fair_play_house,
        march_past_winner=data.march_past_winner,
        is_published=data.is_published,
        version=1
    )
    db.add(edition)
    db.commit()
    db.refresh(edition)

    # Add standings if provided
    if data.standings:
        for s in data.standings:
            standing = YearlyHouseStanding(
                edition_id=edition.id,
                team_id=s.team_id,
                team_name=s.team_name,
                team_code=s.team_code,
                color=s.color,
                total_points=s.total_points,
                rank=s.rank,
                gold_medals=s.gold_medals,
                silver_medals=s.silver_medals,
                bronze_medals=s.bronze_medals
            )
            db.add(standing)

    # Add sports records if provided
    if data.sports_records:
        for r in data.sports_records:
            rec = HistoricalSportRecord(
                edition_id=edition.id,
                sport_name=r.sport_name,
                category=r.category,
                gender=r.gender,
                winner_team_id=r.winner_team_id,
                winner_team_name=r.winner_team_name,
                winner_participant=r.winner_participant,
                winner_enrollment_no=r.winner_enrollment_no,
                winner_players=r.winner_players,
                winner_metric=r.winner_metric,
                runner_up_team_id=r.runner_up_team_id,
                runner_up_team_name=r.runner_up_team_name,
                runner_up_participant=r.runner_up_participant,
                runner_up_enrollment_no=r.runner_up_enrollment_no,
                runner_up_players=r.runner_up_players,
                remarks=r.remarks
            )
            db.add(rec)

    db.commit()
    db.refresh(edition)

    log_audit(
        db=db,
        admin_username=extract_admin_username(admin),
        action="CREATE_ARCHIVE_EDITION",
        entity_type="HistoricalEdition",
        entity_id=str(edition.id),
        new_values=f"Year: {edition.year}, Title: {edition.edition_title}",
        ip_address=request.client.host if request.client else "unknown"
    )

    return edition


@router.put("/{id_or_year}", response_model=HistoricalEditionDetailOut)
def update_admin_archive(
    id_or_year: str,
    data: HistoricalEditionUpdate,
    request: Request,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    """Update an existing yearly edition's metadata, house standings, or sport records."""
    if id_or_year.isdigit() and len(id_or_year) != 4:
        edition = db.query(HistoricalEdition).filter(HistoricalEdition.id == int(id_or_year)).first()
    else:
        edition = db.query(HistoricalEdition).filter(HistoricalEdition.year == int(id_or_year)).first()

    if not edition:
        raise HTTPException(status_code=404, detail="Edition archive not found.")

    if data.version is not None and edition.version != data.version:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Conflict: This edition was modified concurrently by another session. Please refresh."
        )

    old_summary = f"Year: {edition.year}, Title: {edition.edition_title}, Published: {edition.is_published}"

    if data.edition_title is not None:
        edition.edition_title = data.edition_title
    if data.theme is not None:
        edition.theme = data.theme
    if data.start_date is not None:
        edition.start_date = data.start_date
    if data.end_date is not None:
        edition.end_date = data.end_date
    if data.chief_guest is not None:
        edition.chief_guest = data.chief_guest
    if data.total_athletes is not None:
        edition.total_athletes = data.total_athletes
    if data.summary is not None:
        edition.summary = data.summary
    if data.banner_url is not None:
        edition.banner_url = data.banner_url
    if data.champion_team_id is not None:
        edition.champion_team_id = data.champion_team_id
    if data.runner_up_team_id is not None:
        edition.runner_up_team_id = data.runner_up_team_id
    if data.third_place_team_id is not None:
        edition.third_place_team_id = data.third_place_team_id
    if data.best_athlete_boys is not None:
        edition.best_athlete_boys = data.best_athlete_boys
    if data.best_athlete_girls is not None:
        edition.best_athlete_girls = data.best_athlete_girls
    if data.fair_play_house is not None:
        edition.fair_play_house = data.fair_play_house
    if data.march_past_winner is not None:
        edition.march_past_winner = data.march_past_winner
    if data.is_published is not None:
        edition.is_published = data.is_published

    # Replace standings if explicitly supplied
    if data.standings is not None:
        db.query(YearlyHouseStanding).filter(YearlyHouseStanding.edition_id == edition.id).delete()
        for s in data.standings:
            standing = YearlyHouseStanding(
                edition_id=edition.id,
                team_id=s.team_id,
                team_name=s.team_name,
                team_code=s.team_code,
                color=s.color,
                total_points=s.total_points,
                rank=s.rank,
                gold_medals=s.gold_medals,
                silver_medals=s.silver_medals,
                bronze_medals=s.bronze_medals
            )
            db.add(standing)

    # Replace sports records if explicitly supplied
    if data.sports_records is not None:
        db.query(HistoricalSportRecord).filter(HistoricalSportRecord.edition_id == edition.id).delete()
        for r in data.sports_records:
            rec = HistoricalSportRecord(
                edition_id=edition.id,
                sport_name=r.sport_name,
                category=r.category,
                gender=r.gender,
                winner_team_id=r.winner_team_id,
                winner_team_name=r.winner_team_name,
                winner_participant=r.winner_participant,
                winner_enrollment_no=r.winner_enrollment_no,
                winner_players=r.winner_players,
                winner_metric=r.winner_metric,
                runner_up_team_id=r.runner_up_team_id,
                runner_up_team_name=r.runner_up_team_name,
                runner_up_participant=r.runner_up_participant,
                runner_up_enrollment_no=r.runner_up_enrollment_no,
                runner_up_players=r.runner_up_players,
                remarks=r.remarks
            )
            db.add(rec)

    edition.version += 1
    edition.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(edition)

    log_audit(
        db=db,
        admin_username=extract_admin_username(admin),
        action="UPDATE_ARCHIVE_EDITION",
        entity_type="HistoricalEdition",
        entity_id=str(edition.id),
        old_values=old_summary,
        new_values=f"Year: {edition.year}, Title: {edition.edition_title}, Version: {edition.version}",
        ip_address=request.client.host if request.client else "unknown"
    )

    return edition


@router.delete("/{id_or_year}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_archive(
    id_or_year: str,
    request: Request,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin)
):
    """Delete an archive edition and its associated standings and sport records."""
    if id_or_year.isdigit() and len(id_or_year) != 4:
        edition = db.query(HistoricalEdition).filter(HistoricalEdition.id == int(id_or_year)).first()
    else:
        edition = db.query(HistoricalEdition).filter(HistoricalEdition.year == int(id_or_year)).first()

    if not edition:
        raise HTTPException(status_code=404, detail="Edition archive not found.")

    edition_id = edition.id
    year_val = edition.year

    db.delete(edition)
    db.commit()

    log_audit(
        db=db,
        admin_username=extract_admin_username(admin),
        action="DELETE_ARCHIVE_EDITION",
        entity_type="HistoricalEdition",
        entity_id=str(edition_id),
        old_values=f"Year: {year_val}",
        ip_address=request.client.host if request.client else "unknown"
    )
    return None
