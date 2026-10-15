from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.audit_log import AuditLog
from backend.app.schemas import AuditLogOut
from backend.app.services.auth_service import get_current_admin

router = APIRouter(prefix="/api/admin/audit", tags=["Admin Audit Logs"])


@router.get("", response_model=List[AuditLogOut])
def list_audit_logs(
    action: Optional[str] = None,
    entity_type: Optional[str] = None,
    limit: int = Query(50, ge=1, le=500),
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Retrieve chronologically ordered audit logs of administrative actions."""
    query = db.query(AuditLog)
    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type.upper())

    return query.order_by(AuditLog.created_at.desc()).limit(limit).all()
