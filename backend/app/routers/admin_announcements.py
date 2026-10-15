import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.announcement import Announcement
from backend.app.schemas import AnnouncementCreate, AnnouncementUpdate, AnnouncementOut
from backend.app.services.auth_service import get_current_admin
from backend.app.services.validation_service import verify_optimistic_lock
from backend.app.services.audit_service import log_audit

router = APIRouter(prefix="/api/admin/announcements", tags=["Admin Announcements"])


@router.get("", response_model=List[AnnouncementOut])
def list_announcements(current_admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    return db.query(Announcement).order_by(Announcement.created_at.desc()).all()


@router.post("", response_model=AnnouncementOut, status_code=status.HTTP_201_CREATED)
def create_announcement(payload: AnnouncementCreate, current_admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    ann = Announcement(
        title=payload.title,
        description=payload.description,
        category=payload.category.upper(),
        priority=payload.priority.upper(),
        image_url=payload.image_url,
        published_state=payload.published_state.upper(),
        published_at=datetime.datetime.utcnow(),
        version=1
    )
    db.add(ann)
    db.commit()
    db.refresh(ann)

    log_audit(db, current_admin["sub"], "ANNOUNCEMENT_CREATED", "ANNOUNCEMENT", ann.id, None, {"title": ann.title, "priority": ann.priority})
    return ann


@router.put("/{id}", response_model=AnnouncementOut)
def update_announcement(id: int, payload: AnnouncementUpdate, current_admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    ann = db.query(Announcement).filter(Announcement.id == id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found.")

    verify_optimistic_lock(payload.version, ann.version, "Announcement")

    if payload.title is not None:
        ann.title = payload.title
    if payload.description is not None:
        ann.description = payload.description
    if payload.category is not None:
        ann.category = payload.category.upper()
    if payload.priority is not None:
        ann.priority = payload.priority.upper()
    if payload.image_url is not None:
        ann.image_url = payload.image_url
    if payload.published_state is not None:
        ann.published_state = payload.published_state.upper()

    ann.version += 1
    ann.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(ann)

    log_audit(db, current_admin["sub"], "ANNOUNCEMENT_UPDATED", "ANNOUNCEMENT", ann.id, None, {"title": ann.title})
    return ann


@router.delete("/{id}")
def delete_announcement(id: int, current_admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    ann = db.query(Announcement).filter(Announcement.id == id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found.")

    title = ann.title
    db.delete(ann)
    db.commit()
    log_audit(db, current_admin["sub"], "ANNOUNCEMENT_DELETED", "ANNOUNCEMENT", id, {"title": title}, None)
    return {"message": "Announcement deleted successfully."}
