import sys
from backend.app.database.session import SessionLocal
from backend.app.models.point_ledger import PointLedger
from backend.app.models.result import Result
from backend.app.models.event import Event
from backend.app.models.announcement import Announcement
from backend.app.models.registration_form import RegistrationForm
from backend.app.models.team import Team

db = SessionLocal()
try:
    print("--- Starting Database Reset ---")
    
    # 1. Unlink events from registration forms
    updated_forms = db.query(RegistrationForm).filter(RegistrationForm.event_id.isnot(None)).update({RegistrationForm.event_id: None})
    db.commit()
    print(f"[Reset] Unlinked {updated_forms} registration forms from events.")

    # 2. Delete PointLedgers
    deleted_ledgers = db.query(PointLedger).delete()
    db.commit()
    print(f"[Reset] Deleted {deleted_ledgers} PointLedger records (Points reset to 0).")

    # 3. Delete Results
    deleted_results = db.query(Result).delete()
    db.commit()
    print(f"[Reset] Deleted {deleted_results} Result records.")

    # 4. Delete Events (Schedule & Matches)
    deleted_events = db.query(Event).delete()
    db.commit()
    print(f"[Reset] Deleted {deleted_events} Event records (Schedule reset).")

    # 5. Delete Announcements
    deleted_announcements = db.query(Announcement).delete()
    db.commit()
    print(f"[Reset] Deleted {deleted_announcements} Announcement records.")

    # Verification: check counts
    count_ledgers = db.query(PointLedger).count()
    count_results = db.query(Result).count()
    count_events = db.query(Event).count()
    count_announcements = db.query(Announcement).count()
    count_teams = db.query(Team).count()

    print("\n--- Verification Summary ---")
    print(f"PointLedgers remaining: {count_ledgers}")
    print(f"Results remaining:      {count_results}")
    print(f"Events remaining:       {count_events}")
    print(f"Announcements remaining:{count_announcements}")
    print(f"Active Houses preserved:{count_teams}")
    print("----------------------------")
    print("Reset successfully completed.")

except Exception as e:
    db.rollback()
    print(f"ERROR during reset: {e}", file=sys.stderr)
    raise
finally:
    db.close()
