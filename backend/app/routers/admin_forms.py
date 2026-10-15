import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.registration_form import RegistrationForm
from backend.app.schemas import FormCreate, FormUpdate, FormOut
from backend.app.services.auth_service import get_current_admin
from backend.app.services.validation_service import validate_google_form_url, verify_optimistic_lock
from backend.app.services.audit_service import log_audit

router = APIRouter(prefix="/api/admin/forms", tags=["Admin Google Forms"])


@router.get("", response_model=List[FormOut])
def list_admin_forms(
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all registration forms."""
    forms = db.query(RegistrationForm).order_by(RegistrationForm.created_at.desc()).all()
    out = []
    for f in forms:
        f_dict = FormOut.model_validate(f)
        f_dict.form_url = f.google_form_url
        if f.event:
            f_dict.event_title = f.event.title
        if f.sport:
            f_dict.sport_name = f.sport.name
        out.append(f_dict)
    return out


@router.post("", response_model=FormOut, status_code=status.HTTP_201_CREATED)
def create_form(
    payload: FormCreate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new Google Form registration link with security validation."""
    raw_url = payload.google_form_url or payload.form_url
    clean_url = validate_google_form_url(raw_url)

    now = datetime.datetime.utcnow()
    opening = payload.opening_date or now
    closing = payload.closing_date or (now + datetime.timedelta(days=14))

    form = RegistrationForm(
        title=payload.title,
        description=payload.description,
        google_form_url=clean_url,
        sport_id=payload.sport_id,
        event_id=payload.event_id,
        category=payload.category,
        gender=payload.gender,
        banner_url=payload.banner_url,
        opening_date=opening,
        closing_date=closing,
        status=payload.status.upper(),
        published_state=payload.published_state.upper(),
        version=1
    )
    db.add(form)
    db.commit()
    db.refresh(form)

    admin_user = current_admin["username"] if "username" in current_admin else current_admin.get("sub", "admin")
    log_audit(
        db=db,
        admin_username=admin_user,
        action="FORM_CREATED",
        entity_type="FORM",
        entity_id=form.id,
        new_values={"title": form.title, "google_form_url": form.google_form_url, "published_state": form.published_state}
    )

    out = FormOut.model_validate(form)
    out.form_url = form.google_form_url
    if form.event:
        out.event_title = form.event.title
    if form.sport:
        out.sport_name = form.sport.name
    return out


@router.put("/{id}", response_model=FormOut)
def update_form(
    id: int,
    payload: FormUpdate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update registration form details."""
    form = db.query(RegistrationForm).filter(RegistrationForm.id == id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found.")

    verify_optimistic_lock(payload.version, form.version, f"Form '{form.title}'")

    raw_url = payload.google_form_url or payload.form_url
    if raw_url:
        form.google_form_url = validate_google_form_url(raw_url)

    if payload.title is not None:
        form.title = payload.title
    if payload.description is not None:
        form.description = payload.description
    if payload.sport_id is not None:
        form.sport_id = payload.sport_id
    if payload.event_id is not None:
        form.event_id = payload.event_id
    if payload.category is not None:
        form.category = payload.category
    if payload.gender is not None:
        form.gender = payload.gender
    if payload.banner_url is not None:
        form.banner_url = payload.banner_url
    if payload.opening_date is not None:
        form.opening_date = payload.opening_date
    if payload.closing_date is not None:
        form.closing_date = payload.closing_date
    if payload.status is not None:
        form.status = payload.status.upper()
    if payload.published_state is not None:
        form.published_state = payload.published_state.upper()

    form.version += 1
    form.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(form)

    admin_user = current_admin["username"] if "username" in current_admin else current_admin.get("sub", "admin")
    log_audit(
        db=db,
        admin_username=admin_user,
        action="FORM_UPDATED",
        entity_type="FORM",
        entity_id=form.id,
        new_values={"title": form.title, "published_state": form.published_state}
    )

    out = FormOut.model_validate(form)
    out.form_url = form.google_form_url
    if form.event:
        out.event_title = form.event.title
    if form.sport:
        out.sport_name = form.sport.name
    return out


@router.delete("/{id}")
def delete_form(
    id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a registration form link."""
    form = db.query(RegistrationForm).filter(RegistrationForm.id == id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found.")

    admin_user = current_admin["username"] if "username" in current_admin else current_admin.get("sub", "admin")
    old_title = form.title
    db.delete(form)
    db.commit()

    log_audit(
        db=db,
        admin_username=admin_user,
        action="FORM_DELETED",
        entity_type="FORM",
        entity_id=id,
        old_values={"title": old_title}
    )

    return {"detail": "Registration form link deleted."}
