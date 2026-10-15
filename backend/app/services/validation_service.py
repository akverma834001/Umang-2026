import re
from urllib.parse import urlparse
from fastapi import HTTPException, status


def validate_google_form_url(url: str) -> str:
    """Validate that URL is secure, HTTPS, and safe for Google Forms."""
    if not url:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Registration form URL cannot be empty."
        )

    clean_url = url.strip()

    # Block dangerous protocols
    lower_url = clean_url.lower()
    if lower_url.startswith("javascript:") or lower_url.startswith("data:") or lower_url.startswith("vbscript:"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Security violation: Dangerous URL scheme detected."
        )

    parsed = urlparse(clean_url)
    if parsed.scheme != "https":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Google Form URL must use secure HTTPS protocol."
        )

    if not parsed.netloc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid URL structure."
        )

    return clean_url


def validate_map_url(url: str) -> str:
    """Validate that Google Maps URL is a valid HTTPS web address."""
    if not url:
        return ""
    clean_url = url.strip()
    parsed = urlparse(clean_url)
    if parsed.scheme != "https":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Venue map URL must use secure HTTPS protocol."
        )
    return clean_url


def verify_optimistic_lock(client_version: int, current_db_version: int, entity_name: str = "content"):
    """Prevent concurrent edit overwrites using version counter."""
    if client_version != current_db_version:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"This {entity_name} has been updated by another session (v{current_db_version} vs submitted v{client_version}). Refresh before saving to avoid overwriting newer data."
        )


def validate_event_status_transition(current_status: str, new_status: str, allow_override: bool = False):
    """
    Validate event lifecycle transitions.
    Blocks transitions such as COMPLETED -> UPCOMING without explicit admin override.
    """
    if current_status == new_status:
        return

    # Once completed or cancelled, reverting to UPCOMING or LIVE requires confirmation
    if current_status in ["COMPLETED", "CANCELLED"] and new_status in ["UPCOMING", "LIVE"]:
        if not allow_override:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot change event from '{current_status}' back to '{new_status}' without explicit admin confirmation override."
            )
