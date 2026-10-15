from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.result import Result
from backend.app.models.point_ledger import PointLedger
from backend.app.schemas import ResultCreate, ResultUpdate, ResultOut
from backend.app.services.auth_service import get_current_admin
from backend.app.services.ledger_service import create_or_update_result_with_ledger
from backend.app.services.audit_service import log_audit

router = APIRouter(prefix="/api/admin/results", tags=["Admin Results & Scoring"])


@router.get("", response_model=List[ResultOut])
def list_admin_results(
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all sports results including drafts and published states."""
    results = db.query(Result).order_by(Result.created_at.desc()).all()
    out = []
    for r in results:
        res_dict = ResultOut.model_validate(r)
        if r.event:
            res_dict.event_title = r.event.title
        if r.winner_team:
            res_dict.winner_team_name = r.winner_team.name
        if r.runner_up_team:
            res_dict.runner_up_team_name = r.runner_up_team.name
        if r.third_place_team:
            res_dict.third_place_team_name = r.third_place_team.name
        out.append(res_dict)
    return out


@router.post("", response_model=ResultOut, status_code=status.HTTP_201_CREATED)
def create_result(
    payload: ResultCreate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Publish or save event competition result.
    Enforces duplicate checking and transactionally generates point ledger records.
    """
    admin_user = current_admin["username"] if "username" in current_admin else current_admin.get("sub", "admin")
    res = create_or_update_result_with_ledger(
        db=db,
        admin_username=admin_user,
        event_id=payload.event_id,
        category=payload.category,
        winner_team_id=payload.winner_team_id,
        winner_points=payload.winner_points,
        runner_up_team_id=payload.runner_up_team_id,
        runner_up_points=payload.runner_up_points,
        third_place_team_id=payload.third_place_team_id,
        third_place_points=payload.third_place_points,
        winner_participant=payload.winner_participant,
        winner_enrollment_no=payload.winner_enrollment_no,
        winner_players=payload.winner_players,
        winner_metric=payload.winner_metric,
        runner_up_participant=payload.runner_up_participant,
        runner_up_enrollment_no=payload.runner_up_enrollment_no,
        runner_up_players=payload.runner_up_players,
        runner_up_metric=payload.runner_up_metric,
        third_place_participant=payload.third_place_participant,
        third_place_enrollment_no=payload.third_place_enrollment_no,
        third_place_players=payload.third_place_players,
        third_place_metric=payload.third_place_metric,
        remarks=payload.remarks,
        published_state=payload.published_state.upper(),
        is_correction=False
    )

    out = ResultOut.model_validate(res)
    if res.event:
        out.event_title = res.event.title
    if res.winner_team:
        out.winner_team_name = res.winner_team.name
    if res.runner_up_team:
        out.runner_up_team_name = res.runner_up_team.name
    if res.third_place_team:
        out.third_place_team_name = res.third_place_team.name
    return out


@router.put("/{id}", response_model=ResultOut)
def update_result(
    id: int,
    payload: ResultUpdate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Correct an existing result and dynamically rebalance point ledger entries.
    Requires explicit confirmation flag if modifying published result.
    """
    res = db.query(Result).filter(Result.id == id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Result not found.")

    admin_user = current_admin["username"] if "username" in current_admin else current_admin.get("sub", "admin")
    updated = create_or_update_result_with_ledger(
        db=db,
        admin_username=admin_user,
        event_id=res.event_id,
        category=res.category,
        winner_team_id=payload.winner_team_id,
        winner_points=payload.winner_points,
        runner_up_team_id=payload.runner_up_team_id,
        runner_up_points=payload.runner_up_points,
        third_place_team_id=payload.third_place_team_id,
        third_place_points=payload.third_place_points,
        winner_participant=payload.winner_participant,
        winner_enrollment_no=payload.winner_enrollment_no,
        winner_players=payload.winner_players,
        winner_metric=payload.winner_metric,
        runner_up_participant=payload.runner_up_participant,
        runner_up_enrollment_no=payload.runner_up_enrollment_no,
        runner_up_players=payload.runner_up_players,
        runner_up_metric=payload.runner_up_metric,
        third_place_participant=payload.third_place_participant,
        third_place_enrollment_no=payload.third_place_enrollment_no,
        third_place_players=payload.third_place_players,
        third_place_metric=payload.third_place_metric,
        remarks=payload.remarks,
        published_state=payload.published_state.upper(),
        client_version=payload.version,
        is_correction=True,
        confirmation=payload.confirmation
    )

    out = ResultOut.model_validate(updated)
    if updated.event:
        out.event_title = updated.event.title
    if updated.winner_team:
        out.winner_team_name = updated.winner_team.name
    if updated.runner_up_team:
        out.runner_up_team_name = updated.runner_up_team.name
    if updated.third_place_team:
        out.third_place_team_name = updated.third_place_team.name
    return out


@router.delete("/{id}")
def delete_result(
    id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete result and cleanup all associated point ledger entries."""
    res = db.query(Result).filter(Result.id == id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Result not found.")

    admin_user = current_admin["username"] if "username" in current_admin else current_admin.get("sub", "admin")
    old_info = {"event_id": res.event_id, "category": res.category, "winner_team_id": res.winner_team_id}
    
    # PointLedger records cascade deleted
    db.delete(res)
    db.commit()

    log_audit(
        db=db,
        admin_username=admin_user,
        action="RESULT_DELETED",
        entity_type="RESULT",
        entity_id=id,
        old_values=old_info
    )

    return {"detail": "Result and associated point ledger entries removed."}
