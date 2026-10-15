from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.venue import Venue
from backend.app.schemas import VenueCreate, VenueUpdate, VenueOut
from backend.app.services.auth_service import get_current_admin
from backend.app.services.validation_service import validate_map_url
from backend.app.services.audit_service import log_audit

router = APIRouter(prefix="/api/admin/venues", tags=["Admin Venues"])


@router.get("", response_model=List[VenueOut])
def list_venues(current_admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    return db.query(Venue).order_by(Venue.name.asc()).all()


@router.post("", response_model=VenueOut, status_code=status.HTTP_201_CREATED)
def create_venue(payload: VenueCreate, current_admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    if db.query(Venue).filter(Venue.name.ilike(payload.name)).first():
        raise HTTPException(status_code=400, detail=f"Venue '{payload.name}' already exists.")

    clean_map = validate_map_url(payload.map_url) if payload.map_url else None

    venue = Venue(
        name=payload.name,
        description=payload.description,
        location=payload.location,
        capacity=payload.capacity,
        image_url=payload.image_url,
        map_url=clean_map,
        is_active=payload.is_active
    )
    db.add(venue)
    db.commit()
    db.refresh(venue)

    log_audit(db, current_admin["sub"], "VENUE_CREATED", "VENUE", venue.id, None, {"name": venue.name, "location": venue.location})
    return venue


@router.put("/{id}", response_model=VenueOut)
def update_venue(id: int, payload: VenueUpdate, current_admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    venue = db.query(Venue).filter(Venue.id == id).first()
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found.")

    if payload.name:
        venue.name = payload.name
    if payload.description is not None:
        venue.description = payload.description
    if payload.location:
        venue.location = payload.location
    if payload.capacity is not None:
        venue.capacity = payload.capacity
    if payload.image_url is not None:
        venue.image_url = payload.image_url
    if payload.map_url is not None:
        venue.map_url = validate_map_url(payload.map_url)
    if payload.is_active is not None:
        venue.is_active = payload.is_active

    db.commit()
    db.refresh(venue)
    log_audit(db, current_admin["sub"], "VENUE_UPDATED", "VENUE", venue.id, None, {"name": venue.name})
    return venue
