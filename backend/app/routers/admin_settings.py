import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.settings import WebsiteSettings
from backend.app.schemas import SettingsUpdate, SettingsOut
from backend.app.services.auth_service import get_current_admin
from backend.app.services.validation_service import verify_optimistic_lock
from backend.app.services.audit_service import log_audit

router = APIRouter(prefix="/api/admin/settings", tags=["Admin Settings & Scoring"])


@router.get("", response_model=SettingsOut)
def get_settings(current_admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    settings = db.query(WebsiteSettings).first()
    if not settings:
        settings = WebsiteSettings(id=1)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.put("", response_model=SettingsOut)
def update_settings(payload: SettingsUpdate, current_admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    settings = db.query(WebsiteSettings).first()
    if not settings:
        settings = WebsiteSettings(id=1)
        db.add(settings)
        db.commit()
        db.refresh(settings)

    verify_optimistic_lock(payload.version, settings.version, "Website Settings")

    old_values = {
        "university_name": settings.university_name,
        "fest_name": settings.fest_name,
        "points_first_place": settings.points_first_place,
        "points_second_place": settings.points_second_place,
        "points_third_place": settings.points_third_place,
        "primary_color": settings.primary_color,
        "secondary_color": settings.secondary_color,
        "accent_color": settings.accent_color
    }

    settings.university_name = payload.university_name
    settings.university_short_name = payload.university_short_name
    settings.logo_url = payload.logo_url
    settings.location = payload.location
    settings.contact_email = payload.contact_email
    settings.contact_phone = payload.contact_phone
    settings.fest_name = payload.fest_name
    settings.fest_tagline = payload.fest_tagline
    settings.fest_start_date = payload.fest_start_date
    settings.fest_end_date = payload.fest_end_date
    settings.hero_image_url = payload.hero_image_url
    
    # Leaderboard point settings
    if payload.points_first_place is not None:
        settings.points_first_place = payload.points_first_place
    if payload.points_second_place is not None:
        settings.points_second_place = payload.points_second_place
    if payload.points_third_place is not None:
        settings.points_third_place = payload.points_third_place

    settings.primary_color = payload.primary_color
    settings.secondary_color = payload.secondary_color
    settings.accent_color = payload.accent_color
    settings.website_url = payload.website_url
    settings.instagram_url = payload.instagram_url
    settings.facebook_url = payload.facebook_url
    settings.linkedin_url = payload.linkedin_url
    settings.youtube_url = payload.youtube_url
    settings.footer_text = payload.footer_text
    settings.copyright_text = payload.copyright_text
    settings.version += 1
    settings.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(settings)

    admin_user = current_admin["username"] if "username" in current_admin else current_admin.get("sub", "admin")
    log_audit(
        db=db,
        admin_username=admin_user,
        action="SETTINGS_UPDATED",
        entity_type="SETTINGS",
        entity_id=settings.id,
        old_values=old_values,
        new_values={
            "university_name": settings.university_name,
            "fest_name": settings.fest_name,
            "points_first_place": settings.points_first_place,
            "points_second_place": settings.points_second_place,
            "points_third_place": settings.points_third_place
        }
    )

    return settings
