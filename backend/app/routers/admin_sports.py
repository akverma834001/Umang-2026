import datetime
import re
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.app.database.session import get_db
from backend.app.models.sport import Sport
from backend.app.models.event import Event
from backend.app.models.venue import Venue
from backend.app.schemas import SportCreate, SportUpdate, SportOut
from backend.app.services.auth_service import get_current_admin
from backend.app.services.audit_service import log_audit
from backend.app.services.validation_service import verify_optimistic_lock

router = APIRouter(prefix="/api/admin/sports", tags=["Admin Sports Management"])


def generate_slug(name: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9\s-]", "", name).strip().lower()
    return re.sub(r"[\s-]+", "-", cleaned)


@router.get("", response_model=List[SportOut])
def list_sports(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    gender: Optional[str] = Query(None),
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Sport)
    if search:
        query = query.filter(or_(Sport.name.ilike(f"%{search}%"), Sport.description.ilike(f"%{search}%")))
    if category:
        query = query.filter(Sport.category == category)
    if gender:
        query = query.filter(Sport.gender == gender)
    return query.order_by(Sport.name.asc()).all()


@router.post("", response_model=SportOut, status_code=status.HTTP_201_CREATED)
def create_sport(
    payload: SportCreate,
    request: Request,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    slug = generate_slug(payload.name)
    existing_sport = db.query(Sport).filter(or_(Sport.name == payload.name, Sport.slug == slug)).first()
    if existing_sport:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A sport with name '{payload.name}' already exists."
        )

    if payload.venue_id:
        venue = db.query(Venue).filter(Venue.id == payload.venue_id).first()
        if not venue:
            raise HTTPException(status_code=404, detail="Selected venue not found.")

    sport = Sport(
        name=payload.name,
        slug=slug,
        category=payload.category,
        gender=payload.gender,
        sport_type=payload.sport_type,
        venue_id=payload.venue_id,
        status=payload.status,
        description=payload.description,
        banner_url=payload.banner_url,
        rules=payload.rules,
        scoring_format=payload.scoring_format,
        registration_form_url=payload.registration_form_url,
        version=1
    )
    db.add(sport)
    db.commit()
    db.refresh(sport)

    log_audit(
        db=db,
        admin_username=current_admin["username"],
        action="SPORT_CREATED",
        entity_type="SPORT",
        entity_id=sport.id,
        new_values={"name": sport.name, "category": sport.category, "gender": sport.gender},
        ip_address=request.client.host if request.client else None
    )

    return sport


@router.get("/{sport_id}", response_model=SportOut)
def get_sport(
    sport_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    sport = db.query(Sport).filter(Sport.id == sport_id).first()
    if not sport:
        raise HTTPException(status_code=404, detail="Sport not found.")
    return sport


@router.put("/{sport_id}", response_model=SportOut)
def update_sport(
    sport_id: int,
    payload: SportUpdate,
    request: Request,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    sport = db.query(Sport).filter(Sport.id == sport_id).first()
    if not sport:
        raise HTTPException(status_code=404, detail="Sport not found.")

    verify_optimistic_lock(payload.version, sport.version, "Sport")

    old_snapshot = {
        "name": sport.name,
        "category": sport.category,
        "gender": sport.gender,
        "status": sport.status,
        "scoring_format": sport.scoring_format
    }

    if payload.name and payload.name != sport.name:
        existing = db.query(Sport).filter(Sport.name == payload.name, Sport.id != sport_id).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"A sport named '{payload.name}' already exists.")
        sport.name = payload.name
        sport.slug = generate_slug(payload.name)

    if payload.category is not None:
        sport.category = payload.category
    if payload.gender is not None:
        sport.gender = payload.gender
    if payload.sport_type is not None:
        sport.sport_type = payload.sport_type
    if payload.venue_id is not None:
        sport.venue_id = payload.venue_id
    if payload.status is not None:
        sport.status = payload.status
    if payload.description is not None:
        sport.description = payload.description
    if payload.banner_url is not None:
        sport.banner_url = payload.banner_url
    if payload.rules is not None:
        sport.rules = payload.rules
    if payload.scoring_format is not None:
        sport.scoring_format = payload.scoring_format
    if payload.registration_form_url is not None:
        sport.registration_form_url = payload.registration_form_url

    sport.version += 1
    sport.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(sport)

    log_audit(
        db=db,
        admin_username=current_admin["username"],
        action="SPORT_UPDATED",
        entity_type="SPORT",
        entity_id=sport.id,
        old_values=old_snapshot,
        new_values={"name": sport.name, "category": sport.category, "status": sport.status},
        ip_address=request.client.host if request.client else None
    )

    return sport


@router.delete("/{sport_id}")
def delete_or_archive_sport(
    sport_id: int,
    request: Request,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    sport = db.query(Sport).filter(Sport.id == sport_id).first()
    if not sport:
        raise HTTPException(status_code=404, detail="Sport not found.")

    # Check if matches exist
    matches_count = db.query(Event).filter(Event.sport_id == sport_id).count()
    if matches_count > 0:
        # Cannot hard delete sport with matches; archive it
        sport.status = "Completed"
        sport.version += 1
        sport.updated_at = datetime.datetime.utcnow()
        db.commit()
        return {"detail": f"Sport has {matches_count} scheduled matches. Status set to 'Completed' for historical integrity."}

    db.delete(sport)
    db.commit()

    log_audit(
        db=db,
        admin_username=current_admin["username"],
        action="SPORT_DELETED",
        entity_type="SPORT",
        entity_id=sport_id,
        old_values={"name": sport.name},
        ip_address=request.client.host if request.client else None
    )

    return {"detail": "Sport deleted successfully."}
