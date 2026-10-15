import os
import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.leadership import LeadershipMember
from backend.app.schemas import (
    LeadershipMemberCreate,
    LeadershipMemberUpdate,
    LeadershipMemberOut,
)
from backend.app.services.auth_service import get_current_admin
from backend.app.services.audit_service import log_audit

router = APIRouter(prefix="/api/admin/leadership", tags=["Admin Leadership & Sports Incharges"])

UPLOAD_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "frontend", "public", "images", "leadership")
)


@router.get("", response_model=List[LeadershipMemberOut])
def list_leadership_members(
    category: Optional[str] = Query(None),
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all leadership members and sports incharges for admin management."""
    query = db.query(LeadershipMember)
    if category and category.lower() != "all":
        query = query.filter(LeadershipMember.category == category.lower())
    return query.order_by(LeadershipMember.display_order.asc(), LeadershipMember.id.asc()).all()


@router.post("", response_model=LeadershipMemberOut, status_code=status.HTTP_201_CREATED)
def create_leadership_member(
    payload: LeadershipMemberCreate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Add a new leadership or sports incharge official."""
    member = LeadershipMember(
        name=payload.name.strip(),
        designation=payload.designation.strip(),
        category=payload.category.lower().strip(),
        bio=payload.bio.strip() if payload.bio else None,
        image_url=payload.image_url.strip() if payload.image_url else None,
        display_order=payload.display_order,
        is_active=payload.is_active,
        contact_email=payload.contact_email.strip() if payload.contact_email else None,
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow(),
    )
    db.add(member)
    db.commit()
    db.refresh(member)

    log_audit(
        db,
        current_admin["sub"],
        "LEADERSHIP_MEMBER_CREATED",
        "LEADERSHIP",
        member.id,
        None,
        {"name": member.name, "designation": member.designation, "category": member.category}
    )
    return member


@router.put("/{id}", response_model=LeadershipMemberOut)
def update_leadership_member(
    id: int,
    payload: LeadershipMemberUpdate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update leadership or sports incharge official details."""
    member = db.query(LeadershipMember).filter(LeadershipMember.id == id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Leadership member not found.")

    old_data = {
        "name": member.name,
        "designation": member.designation,
        "category": member.category,
        "image_url": member.image_url,
        "display_order": member.display_order,
        "is_active": member.is_active,
    }

    if payload.name is not None:
        member.name = payload.name.strip()
    if payload.designation is not None:
        member.designation = payload.designation.strip()
    if payload.category is not None:
        member.category = payload.category.lower().strip()
    if payload.bio is not None:
        member.bio = payload.bio.strip() if payload.bio else None
    if payload.image_url is not None:
        member.image_url = payload.image_url.strip() if payload.image_url else None
    if payload.display_order is not None:
        member.display_order = payload.display_order
    if payload.is_active is not None:
        member.is_active = payload.is_active
    if payload.contact_email is not None:
        member.contact_email = payload.contact_email.strip() if payload.contact_email else None

    member.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(member)

    log_audit(
        db,
        current_admin["sub"],
        "LEADERSHIP_MEMBER_UPDATED",
        "LEADERSHIP",
        member.id,
        old_data,
        {"name": member.name, "designation": member.designation, "category": member.category}
    )
    return member


@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_leadership_member(
    id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Remove a leadership or sports incharge official."""
    member = db.query(LeadershipMember).filter(LeadershipMember.id == id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Leadership member not found.")

    member_name = member.name
    db.delete(member)
    db.commit()

    log_audit(
        db,
        current_admin["sub"],
        "LEADERSHIP_MEMBER_DELETED",
        "LEADERSHIP",
        id,
        {"name": member_name},
        None
    )
    return {"message": f"Official '{member_name}' has been successfully deleted."}


@router.post("/upload-image")
async def upload_leadership_image(
    file: UploadFile = File(...),
    current_admin: dict = Depends(get_current_admin)
):
    """Upload a leadership portrait image and save to public assets."""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    extension = os.path.splitext(file.filename)[1].lower()
    if extension not in [".jpg", ".jpeg", ".png", ".webp", ".svg"]:
        raise HTTPException(status_code=400, detail="Invalid image file format. Allowed: JPG, PNG, WEBP, SVG.")

    unique_filename = f"leader_{uuid.uuid4().hex[:8]}{extension}"
    target_path = os.path.join(UPLOAD_DIR, unique_filename)

    with open(target_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    return {
        "success": True,
        "image_url": f"/images/leadership/{unique_filename}",
        "filename": unique_filename,
    }
