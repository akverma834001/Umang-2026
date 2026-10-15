import json
import datetime
from typing import Optional, Any
from sqlalchemy.orm import Session
from backend.app.models.audit_log import AuditLog


def log_audit(
    db: Session,
    admin_username: str,
    action: str,
    entity_type: str,
    entity_id: Optional[Any] = None,
    old_values: Optional[Any] = None,
    new_values: Optional[Any] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    """Record an action in the immutable administrative audit log."""
    old_str = json.dumps(old_values, default=str) if old_values is not None else None
    new_str = json.dumps(new_values, default=str) if new_values is not None else None

    log_entry = AuditLog(
        admin_username=admin_username,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id is not None else None,
        old_values=old_str,
        new_values=new_str,
        ip_address=ip_address,
        created_at=datetime.datetime.utcnow()
    )
    db.add(log_entry)
    db.flush()
    return log_entry
