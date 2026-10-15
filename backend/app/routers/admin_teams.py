from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.team import Team
from backend.app.schemas import TeamCreate, TeamUpdate, TeamOut
from backend.app.services.auth_service import get_current_admin
from backend.app.services.audit_service import log_audit

router = APIRouter(prefix="/api/admin/teams", tags=["Admin Teams / Houses"])


OFFICIAL_HOUSES = {"VISH", "CHAN", "PATA", "RAMA"}


@router.get("", response_model=List[TeamOut])
def list_teams(current_admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    return db.query(Team).filter(Team.code.in_(OFFICIAL_HOUSES)).order_by(Team.id.asc()).all()


@router.post("", response_model=TeamOut, status_code=status.HTTP_201_CREATED)
def create_team(payload: TeamCreate, current_admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    raise HTTPException(
        status_code=400,
        detail="There are strictly only 4 official UMANG houses (Vishvesvaraya, Chanakya, Patanjali, Ramanujan). Additional houses cannot be created."
    )


@router.put("/{id}", response_model=TeamOut)
def update_team(id: int, payload: TeamUpdate, current_admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == id, Team.code.in_(OFFICIAL_HOUSES)).first()
    if not team:
        raise HTTPException(status_code=404, detail="Official house not found.")

    if payload.code and payload.code.upper() not in OFFICIAL_HOUSES:
        raise HTTPException(status_code=400, detail="Cannot alter official house code.")

    if payload.name:
        team.name = payload.name
    if payload.color:
        team.color = payload.color
    if payload.logo_url is not None:
        team.logo_url = payload.logo_url
    if payload.is_active is not None:
        team.is_active = True  # Always active

    db.commit()
    db.refresh(team)
    log_audit(db, current_admin["sub"], "TEAM_UPDATED", "TEAM", team.id, None, {"name": team.name, "color": team.color})
    return team


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(id: int, current_admin: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    raise HTTPException(
        status_code=400,
        detail="Cannot delete official house. The 4 UMANG houses (Vishvesvaraya, Chanakya, Patanjali, Ramanujan) are permanently protected."
    )


