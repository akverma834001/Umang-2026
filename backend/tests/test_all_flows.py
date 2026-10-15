import pytest
import time
import random
import datetime
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_01_admin_login_success():
    """Test Flow 1: Admin authentication and JWT token issuance."""
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "admin@SBU2026"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["username"] == "admin"
    assert data["token_type"] == "bearer"


def test_02_unauthorized_admin_api_access():
    """Test Flow 17 & 25: Unauthorized access to Admin API must return 401."""
    response = client.get("/api/admin/events")
    assert response.status_code == 401
    assert "detail" in response.json()


def test_03_create_draft_event_and_check_public_invisibility():
    """Test Flows 2, 3, 4: Create draft event, verify invisible publicly, preview in admin."""
    login_res = client.post("/api/auth/login", json={"username": "admin", "password": "admin@SBU2026"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    venues_res = client.get("/api/venues")
    venue_id = venues_res.json()[0]["id"]
    ts = int(time.time() * 1000) % 100000

    payload = {
        "title": f"Secret Robotics Challenge {ts} (Draft)",
        "description": "Exclusive autonomous navigation workshop",
        "category": "Technical",
        "venue_id": venue_id,
        "event_date": "2026-11-20",
        "start_time": "14:00",
        "end_time": "16:00",
        "banner_url": "https://example.com/banner.jpg",
        "rules": "Confidential draft rules",
        "status": "UPCOMING",
        "published_state": "DRAFT"
    }
    create_res = client.post("/api/admin/events", json=payload, headers=headers)
    assert create_res.status_code == 201
    event_data = create_res.json()
    event_id = event_data["id"]
    assert event_data["published_state"] == "DRAFT"

    # Verify NOT visible in public events
    public_res = client.get("/api/events")
    public_ids = [ev["id"] for ev in public_res.json()]
    assert event_id not in public_ids, "Draft event must NOT be visible on public portal"

    # Verify preview works in admin API
    admin_get_res = client.get(f"/api/admin/events/{event_id}", headers=headers)
    assert admin_get_res.status_code == 200
    assert admin_get_res.json()["title"] == payload["title"]


def test_04_publish_event_and_confirm_public_visibility():
    """Test Flows 5 & 6: Create draft, publish it, and verify public visibility."""
    login_res = client.post("/api/auth/login", json={"username": "admin", "password": "admin@SBU2026"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    venues_res = client.get("/api/venues")
    venue_id = venues_res.json()[0]["id"]
    ts = int(time.time() * 1000) % 100000
    salt = random.randint(1, 28)

    test_date = f"2029-{(ts % 12) + 1:02d}-{salt:02d}"

    # 1. Create a dedicated draft event
    create_res = client.post(
        "/api/admin/events",
        json={
            "title": f"Publish Verification Fest {ts}",
            "description": "Testing publish transition",
            "category": "Cultural",
            "venue_id": venue_id,
            "event_date": test_date,
            "start_time": "10:00",
            "end_time": "12:00",
            "status": "UPCOMING",
            "published_state": "DRAFT"
        },
        headers=headers
    )
    assert create_res.status_code == 201
    draft_event = create_res.json()
    event_id = draft_event["id"]
    current_version = draft_event["version"]

    # 2. Publish it
    update_res = client.put(
        f"/api/admin/events/{event_id}",
        json={
            "published_state": "PUBLISHED",
            "version": current_version
        },
        headers=headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["published_state"] == "PUBLISHED"
    assert update_res.json()["version"] == current_version + 1

    # 3. Verify visible publicly
    public_res = client.get("/api/events")
    public_ids = [ev["id"] for ev in public_res.json()]
    assert event_id in public_ids, "Published event MUST be visible on public portal"


def test_05_archive_event_visibility():
    """Test Flows 7 & 8: Archive event and verify it disappears from public catalog."""
    login_res = client.post("/api/auth/login", json={"username": "admin", "password": "admin@SBU2026"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    venues_res = client.get("/api/venues")
    venue_id = venues_res.json()[0]["id"]
    ts = int(time.time() * 1000) % 100000
    salt = random.randint(1, 28)

    ev_res = client.post(
        "/api/admin/events",
        json={
            "title": f"Symposium To Archive {ts}",
            "description": "Historical symposium",
            "category": "Workshop",
            "venue_id": venue_id,
            "event_date": f"2030-{(ts % 12) + 1:02d}-{salt:02d}",
            "start_time": "10:00",
            "end_time": "12:00",
            "status": "COMPLETED",
            "published_state": "PUBLISHED"
        },
        headers=headers
    )
    assert ev_res.status_code == 201
    ev_id = ev_res.json()["id"]

    # Confirm visible
    pub_res1 = client.get("/api/events")
    assert ev_id in [e["id"] for e in pub_res1.json()]

    # Archive it
    arch_res = client.post(f"/api/admin/events/{ev_id}/archive", headers=headers)
    assert arch_res.status_code == 200
    assert arch_res.json()["published_state"] == "ARCHIVED"

    # Confirm NOT in default public events
    pub_res2 = client.get("/api/events")
    assert ev_id not in [e["id"] for e in pub_res2.json()], "Archived events must not appear in public catalog"


def test_06_google_form_validation_and_publishing():
    """Test Flows 9, 10, 11 & 18: Google Form URL validation, draft/publish lifecycle."""
    login_res = client.post("/api/auth/login", json={"username": "admin", "password": "admin@SBU2026"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Invalid non-https URL should fail with 422
    bad_res1 = client.post(
        "/api/admin/forms",
        json={
            "title": "Bad Insecure Form",
            "form_url": "http://forms.gle/insecure",
            "published_state": "PUBLISHED"
        },
        headers=headers
    )
    assert bad_res1.status_code == 422

    # 2. Dangerous javascript: protocol should fail with 422
    bad_res2 = client.post(
        "/api/admin/forms",
        json={
            "title": "XSS Exploit Form",
            "form_url": "javascript:alert('xss')",
            "published_state": "PUBLISHED"
        },
        headers=headers
    )
    assert bad_res2.status_code == 422

    # 3. Valid secure Google Form URL
    ts = int(time.time() * 1000) % 100000
    good_res = client.post(
        "/api/admin/forms",
        json={
            "title": f"AI Innovation Challenge Entry {ts}",
            "description": "Submit your AI project repository link and abstract.",
            "form_url": f"https://forms.gle/SBUAIChallenge{ts}",
            "category": "Technical",
            "status": "OPEN",
            "published_state": "PUBLISHED"
        },
        headers=headers
    )
    assert good_res.status_code == 201
    form_id = good_res.json()["id"]

    # 4. Verify visible in public registrations
    forms_res = client.get("/api/forms")
    assert forms_res.status_code == 200
    form_ids = [f["id"] for f in forms_res.json()]
    assert form_id in form_ids


def test_07_team_creation_result_entry_and_leaderboard_calculation():
    """Test Flows 12, 13, 14, 15: Prohibit extra house creation, verify 4 houses, test result & ledger."""
    login_res = client.post("/api/auth/login", json={"username": "admin", "password": "admin@SBU2026"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    ts = int(time.time() * 1000) % 100000

    # 1. Prohibit extra house creation beyond the 4 official houses
    team_name = f"Extra House {ts}"
    team_code = f"X{ts % 1000}"
    team_res = client.post(
        "/api/admin/teams",
        json={
            "name": team_name,
            "code": team_code,
            "color": "#7C3AED",
            "is_active": True
        },
        headers=headers
    )
    assert team_res.status_code == 400, "Must reject creating additional houses beyond the 4 official ones"

    # 2. Verify exactly the 4 official houses exist
    teams_res = client.get("/api/admin/teams", headers=headers)
    assert teams_res.status_code == 200
    official_teams = teams_res.json()
    assert len(official_teams) == 4, "There must be strictly 4 official houses"
    winner_team_id = official_teams[0]["id"]
    runner_up_id = official_teams[1]["id"]

    # 3. Create a unique event with fresh date
    venues_res = client.get("/api/venues")
    venue_id = venues_res.json()[0]["id"]
    ev_res = client.post(
        "/api/admin/events",
        json={
            "title": f"Championship Chess Match {ts}",
            "description": "Grandmaster blitz chess match",
            "category": "Sports",
            "venue_id": venue_id,
            "event_date": f"2027-03-{(ts % 25) + 1:02d}",
            "start_time": "15:00",
            "end_time": "17:00",
            "status": "COMPLETED",
            "published_state": "PUBLISHED"
        },
        headers=headers
    )
    assert ev_res.status_code == 201
    test_event_id = ev_res.json()["id"]

    # 4. Check initial leaderboard points for winner team
    lb_initial = client.get("/api/leaderboard").json()
    initial_points = next((item["total_points"] for item in lb_initial if item["id"] == winner_team_id), 0)

    # 5. Create Result (Winner gets 20 points)
    res_entry = client.post(
        "/api/admin/results",
        json={
            "event_id": test_event_id,
            "category": f"Blitz Finals {ts}",
            "winner_team_id": winner_team_id,
            "winner_points": 20,
            "runner_up_team_id": runner_up_id,
            "runner_up_points": 10,
            "remarks": "Decisive victory in checkmate.",
            "published_state": "PUBLISHED"
        },
        headers=headers
    )
    assert res_entry.status_code == 201
    created_res_id = res_entry.json()["id"]

    # 6. Verify Dynamic Leaderboard Calculation from Point Ledger
    lb_after = client.get("/api/leaderboard").json()
    updated_points = next(item["total_points"] for item in lb_after if item["id"] == winner_team_id)
    assert updated_points == initial_points + 20, "Leaderboard must dynamically calculate points from the ledger"

    # 7. Verify Points Breakdown endpoint
    breakdown_res = client.get(f"/api/leaderboard/breakdown/{winner_team_id}")
    assert breakdown_res.status_code == 200
    b_data = breakdown_res.json()
    assert b_data["total_points"] == updated_points
    assert len(b_data["breakdown"]) >= 1

    # Cleanup test event and result so test runs don't pollute data
    client.delete(f"/api/admin/results/{created_res_id}", headers=headers)
    client.delete(f"/api/admin/events/{test_event_id}?hard_delete=true", headers=headers)



def test_08_duplicate_result_prevention():
    """Test Flow 19: An event cannot have duplicate published results for the same category."""
    login_res = client.post("/api/auth/login", json={"username": "admin", "password": "admin@SBU2026"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    results = client.get("/api/admin/results", headers=headers).json()
    assert len(results) > 0
    target_result = results[0]

    dup_res = client.post(
        "/api/admin/results",
        json={
            "event_id": target_result["event_id"],
            "category": target_result["category"],
            "winner_team_id": target_result["winner_team_id"],
            "winner_points": 10,
            "published_state": "PUBLISHED"
        },
        headers=headers
    )
    assert dup_res.status_code == 400
    assert "already exists" in dup_res.json()["detail"].lower()


def test_09_result_correction_and_leaderboard_recalculation():
    """Test Flows 16 & 17: Result correction requires confirmation and recalculates leaderboard."""
    login_res = client.post("/api/auth/login", json={"username": "admin", "password": "admin@SBU2026"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    results = client.get("/api/admin/results", headers=headers).json()
    target_result = results[0]
    res_id = target_result["id"]
    team_id = target_result["winner_team_id"]
    current_version = target_result["version"]

    # 1. Update without confirmation must be blocked
    unconfirmed_res = client.put(
        f"/api/admin/results/{res_id}",
        json={
            "winner_team_id": team_id,
            "winner_points": 50,
            "runner_up_team_id": target_result["runner_up_team_id"],
            "runner_up_points": 5,
            "published_state": "PUBLISHED",
            "version": current_version,
            "confirmation": False
        },
        headers=headers
    )
    assert unconfirmed_res.status_code == 400
    assert "confirmation" in unconfirmed_res.json()["detail"].lower()

    # 2. Update with confirmation
    confirmed_res = client.put(
        f"/api/admin/results/{res_id}",
        json={
            "winner_team_id": team_id,
            "winner_points": 50,
            "runner_up_team_id": target_result["runner_up_team_id"],
            "runner_up_points": 5,
            "published_state": "PUBLISHED",
            "version": current_version,
            "confirmation": True
        },
        headers=headers
    )
    assert confirmed_res.status_code == 200
    assert confirmed_res.json()["winner_points"] == 50

    # 3. Check Audit Log records RESULT_CORRECTED
    audit_res = client.get("/api/admin/audit?action=RESULT_CORRECTED", headers=headers)
    assert audit_res.status_code == 200
    assert len(audit_res.json()) >= 1


def test_10_schedule_conflict_detection():
    """Test Flow 18: Backend must detect and block when two events share venue and time."""
    login_res = client.post("/api/auth/login", json={"username": "admin", "password": "admin@SBU2026"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    venues_res = client.get("/api/venues")
    venue_id = venues_res.json()[0]["id"]
    ts = int(time.time() * 1000) % 100000
    salt = random.randint(1, 28)
    test_date = f"2031-{(ts % 12) + 1:02d}-{salt:02d}"

    # Event 1: 10:00 to 12:00
    ev1_res = client.post(
        "/api/admin/events",
        json={
            "title": f"Primary Morning Keynote {ts}",
            "description": "Auditorium keynote session",
            "category": "Technical",
            "venue_id": venue_id,
            "event_date": test_date,
            "start_time": "10:00",
            "end_time": "12:00",
            "status": "UPCOMING",
            "published_state": "PUBLISHED"
        },
        headers=headers
    )
    assert ev1_res.status_code == 201

    # Conflict preview check via API
    check_res = client.post(
        f"/api/admin/events/check-conflict?venue_id={venue_id}&event_date={test_date}&start_time=11:00&end_time=13:00",
        headers=headers
    )
    assert check_res.status_code == 200
    assert check_res.json()["has_conflict"] is True

    # Event 2: Overlapping time (11:00 to 13:00) at same venue published should be blocked
    ev2_res = client.post(
        "/api/admin/events",
        json={
            "title": f"Conflicting Competing Session {ts}",
            "description": "Should fail to publish due to conflict",
            "category": "Cultural",
            "venue_id": venue_id,
            "event_date": test_date,
            "start_time": "11:00",
            "end_time": "13:00",
            "status": "UPCOMING",
            "published_state": "PUBLISHED"
        },
        headers=headers
    )
    assert ev2_res.status_code in [400, 409]
    assert "conflict" in ev2_res.json()["detail"].lower()


def test_11_concurrent_editing_optimistic_locking():
    """Test Flow 28: Stale version submission must return 409 Conflict."""
    login_res = client.post("/api/auth/login", json={"username": "admin", "password": "admin@SBU2026"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Read current version of settings
    current_settings = client.get("/api/settings").json()
    current_version = current_settings["version"]

    # 2. Update session A succeeds and increments version
    res_a = client.put(
        "/api/admin/settings",
        json={
            "university_name": "Sarala Birla University, Ranchi",
            "university_short_name": "SBU Ranchi",
            "location": "Birla Knowledge City, Ranchi",
            "contact_email": "fest@sbu.ac.in",
            "contact_phone": "+91-9525110012",
            "fest_name": "UMANG 2026",
            "fest_tagline": "Elevating Potential",
            "primary_color": "#800000",
            "secondary_color": "#1B2A4A",
            "accent_color": "#D4AF37",
            "website_url": "https://sbu.ac.in",
            "copyright_text": "© 2026 SBU",
            "version": current_version
        },
        headers=headers
    )
    assert res_a.status_code == 200
    stale_version = current_version  # Now stale!

    # 3. Session B attempts update with stale version -> Must receive 409 Conflict
    res_b = client.put(
        "/api/admin/settings",
        json={
            "university_name": "Sarala Birla University, Ranchi",
            "university_short_name": "SBU Ranchi",
            "location": "Birla Knowledge City, Ranchi",
            "contact_email": "fest@sbu.ac.in",
            "contact_phone": "+91-9525110012",
            "fest_name": "UMANG Concurrent Test",
            "fest_tagline": "Stale Attempt",
            "primary_color": "#800000",
            "secondary_color": "#1B2A4A",
            "accent_color": "#D4AF37",
            "website_url": "https://sbu.ac.in",
            "copyright_text": "© 2026 SBU",
            "version": stale_version  # STALE VERSION!
        },
        headers=headers
    )
    assert res_b.status_code == 409
    assert "updated by another session" in res_b.json()["detail"].lower()


def test_12_event_deletion_protection():
    """Test Flow 29: Event with results cannot be hard deleted."""
    login_res = client.post("/api/auth/login", json={"username": "admin", "password": "admin@SBU2026"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    results = client.get("/api/admin/results", headers=headers).json()
    event_with_results_id = results[0]["event_id"]

    del_res = client.delete(f"/api/admin/events/{event_with_results_id}?hard_delete=true", headers=headers)
    assert del_res.status_code == 400
    assert "cannot" in del_res.json()["detail"].lower() or "permanently" in del_res.json()["detail"].lower()
