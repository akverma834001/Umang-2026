import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.admin import Admin
from backend.app.schemas import LoginRequest, TokenResponse, AdminOut
from backend.app.services.auth_service import (
    verify_password,
    create_access_token,
    get_current_admin,
    MAX_FAILED_ATTEMPTS,
    LOCKOUT_MINUTES
)
from backend.app.services.audit_service import log_audit

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "unknown"
    clean_username = login_data.username.strip()
    admin = db.query(Admin).filter(Admin.username.ilike(clean_username)).first()

    if not admin or not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid administrative credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Check lockout
    now = datetime.datetime.utcnow()
    if admin.locked_until and admin.locked_until > now:
        remaining_seconds = int((admin.locked_until - now).total_seconds())
        remaining_minutes = max(1, remaining_seconds // 60)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Account locked due to excessive failed attempts. Try again in {remaining_minutes} minutes."
        )

    if not verify_password(login_data.password, admin.password_hash):
        admin.failed_login_attempts += 1
        if admin.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
            admin.locked_until = now + datetime.timedelta(minutes=LOCKOUT_MINUTES)
            db.commit()
            log_audit(db, admin.username, "ADMIN_LOCKOUT", "AUTH", admin.id, None, {"reason": "5 failed attempts"}, ip)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Security threshold exceeded. Account locked for {LOCKOUT_MINUTES} minutes."
            )
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid administrative credentials. ({MAX_FAILED_ATTEMPTS - admin.failed_login_attempts} attempts remaining)",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Successful login: reset failed attempts & lockout
    admin.failed_login_attempts = 0
    admin.locked_until = None
    db.commit()

    token = create_access_token(data={"sub": admin.username, "username": admin.username, "role": admin.role, "id": admin.id})
    log_audit(db, admin.username, "LOGIN", "AUTH", admin.id, None, {"ip": ip}, ip)

    return {
        "access_token": token,
        "token_type": "bearer",
        "username": admin.username,
        "role": admin.role
    }


@router.get("/me", response_model=AdminOut)
def get_me(current_user: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(Admin.username == current_user["sub"]).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin user not found")
    return admin


@router.post("/logout")
def logout(current_user: dict = Depends(get_current_admin), db: Session = Depends(get_db)):
    log_audit(db, current_user["sub"], "LOGOUT", "AUTH", None, None, None)
    return {"message": "Session logged out successfully"}
