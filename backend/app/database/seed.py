import os
import datetime
from sqlalchemy.orm import Session
from backend.app.database.session import SessionLocal, Base, engine
from backend.app.models.admin import Admin
from backend.app.models.venue import Venue
from backend.app.models.team import Team
from backend.app.models.sport import Sport
from backend.app.models.event import Event
from backend.app.models.settings import WebsiteSettings
from backend.app.models.announcement import Announcement
from backend.app.models.registration_form import RegistrationForm
from backend.app.models.leadership import LeadershipMember
from backend.app.services.auth_service import hash_password
from backend.app.services.ledger_service import create_or_update_result_with_ledger
from backend.app.database.seed_archives import seed_historical_archives


def seed_database(seed_fixtures: bool = False):
    """Initializes tables and seeds initial administrative credentials and SBU UMANG Sports data."""
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. Seed Admin
        admin_username = os.getenv("ADMIN_USERNAME", "Admin_Sports_office")
        admin_password = os.getenv("ADMIN_PASSWORD", "SBUSO@12345")
        
        existing_admin = db.query(Admin).filter(Admin.username.ilike(admin_username)).first()
        if not existing_admin:
            # Also check if legacy admin exists to migrate
            legacy_admin = db.query(Admin).first()
            if legacy_admin:
                legacy_admin.username = admin_username
                legacy_admin.password_hash = hash_password(admin_password)
                legacy_admin.email = "sports.office@sbu.ac.in"
                legacy_admin.is_active = True
                legacy_admin.failed_login_attempts = 0
                legacy_admin.locked_until = None
                db.commit()
                print(f"[Seed] Admin user migrated to '{admin_username}'.")
            else:
                admin = Admin(
                    username=admin_username,
                    password_hash=hash_password(admin_password),
                    email="sports.office@sbu.ac.in",
                    role="admin",
                    is_active=True
                )
                db.add(admin)
                db.commit()
                print(f"[Seed] Admin user '{admin_username}' provisioned.")
        else:
            existing_admin.password_hash = hash_password(admin_password)
            existing_admin.is_active = True
            existing_admin.failed_login_attempts = 0
            existing_admin.locked_until = None
            db.commit()

        # Also provision standard 'admin' user for automated tests & fallback
        if admin_username.lower() != "admin":
            standard_admin = db.query(Admin).filter(Admin.username == "admin").first()
            if not standard_admin:
                standard_admin = Admin(
                    username="admin",
                    password_hash=hash_password("admin@SBU2026"),
                    email="admin@sbu.ac.in",
                    role="admin",
                    is_active=True
                )
                db.add(standard_admin)
                db.commit()
            else:
                standard_admin.password_hash = hash_password("admin@SBU2026")
                standard_admin.is_active = True
                standard_admin.failed_login_attempts = 0
                standard_admin.locked_until = None
                db.commit()

        # 2. Seed WebsiteSettings
        settings = db.query(WebsiteSettings).first()
        if not settings:
            settings = WebsiteSettings(
                id=1,
                university_name="Sarala Birla University, Ranchi",
                university_short_name="SBU Ranchi",
                location="Birla Campus, Vill.- Ara, P.O.- Mahilong, Ranchi-Purulia Highway, Ranchi - 835103",
                contact_email="info@sburanchi.ac.in",
                contact_phone="1800 120 1020 / +91-9508003108",
                fest_name="SBU UMANG — Annual Sports Meet",
                fest_tagline="Annual Inter-House Sports Championship | Sarala Birla University, Ranchi",
                fest_start_date=datetime.date(2026, 10, 15),
                fest_end_date=datetime.date(2026, 10, 18),
                logo_url="/sbu-emblem.png",
                hero_image_url="/SBU-LOGO.png",
                points_first_place=10,
                points_second_place=7,
                points_third_place=5,
                primary_color="#800000",    # SBU Crimson / Maroon
                secondary_color="#1B2A4A",  # Deep Academic Navy
                accent_color="#D4AF37",     # Heritage Gold
                website_url="https://sbu.ac.in",
                instagram_url="https://instagram.com/sburanchi",
                facebook_url="https://facebook.com/sburanchi",
                linkedin_url="https://linkedin.com/school/sarala-birla-university",
                youtube_url="https://youtube.com/@sburanchi",
                footer_text="Sarala Birla University is established under The Sarala Birla University Act, 2017 (Jharkhand Act. No. 13, 2017) by Bharat Arogya & Gyan Mandir.",
                copyright_text="© 2026 Sarala Birla University, Ranchi. All rights reserved."
            )
            db.add(settings)
            db.commit()
            print("[Seed] SBU Sports Meet Website Settings initialized.")
        else:
            settings.fest_name = "SBU UMANG — Annual Sports Meet"
            settings.fest_tagline = "Annual Inter-House Sports Championship | Sarala Birla University, Ranchi"
            settings.contact_email = "info@sburanchi.ac.in"
            settings.contact_phone = "1800 120 1020 / +91-9508003108"
            settings.location = "Birla Campus, Vill.- Ara, P.O.- Mahilong, Ranchi-Purulia Highway, Ranchi - 835103"
            settings.logo_url = "/sbu-emblem.png"
            settings.hero_image_url = "/SBU-LOGO.png"
            settings.footer_text = "Sarala Birla University is established under The Sarala Birla University Act, 2017 (Jharkhand Act. No. 13, 2017) by Bharat Arogya & Gyan Mandir."
            settings.copyright_text = "© 2026 Sarala Birla University, Ranchi. All rights reserved."
            db.commit()

        # Seed University Leadership & Sports Incharges
        seed_leadership_members(db)

        # 3. Seed Venues
        if db.query(Venue).count() == 0:
            venues_data = [
                Venue(
                    name="SBU Athletics Stadium & Track",
                    description="Standard 400m 8-lane running track with synthetic field arena for shot put, long jump, and track events.",
                    location="Campus Athletics Complex, North Wing",
                    capacity=1800,
                    image_url="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
                    map_url="https://maps.google.com/?q=Sarala+Birla+University+Ranchi",
                    is_active=True
                ),
                Venue(
                    name="University Cricket Arena",
                    description="Full-sized natural turf pitch with floodlight towers, digital scorebox, and boundary pavilion.",
                    location="Birla Knowledge City Sports Ground",
                    capacity=2500,
                    image_url="https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=800&q=80",
                    map_url="https://maps.google.com/?q=Sarala+Birla+University+Ranchi",
                    is_active=True
                ),
                Venue(
                    name="Football Turf Ground",
                    description="FIFA-regulation natural grass soccer pitch with automated sprinkler systems and spectator stands.",
                    location="Campus Athletics Complex, South Ground",
                    capacity=1500,
                    image_url="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
                    map_url="https://maps.google.com/?q=Sarala+Birla+University+Ranchi",
                    is_active=True
                ),
                Venue(
                    name="Indoor Sports Complex (Badminton & TT)",
                    description="Wooden sprung-floor courts with Yonex tournament mats, LED anti-glare illumination, and gallery.",
                    location="Indoor Sports Pavilion, 1st Floor",
                    capacity=400,
                    image_url="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80",
                    map_url="https://maps.google.com/?q=Sarala+Birla+University+Ranchi",
                    is_active=True
                ),
                Venue(
                    name="Main Basketball Court",
                    description="High-traction acrylic coated floodlit basketball court with hydraulic tempered-glass backboards.",
                    location="Outdoor Sports Courts Block",
                    capacity=600,
                    image_url="https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80",
                    map_url="https://maps.google.com/?q=Sarala+Birla+University+Ranchi",
                    is_active=True
                ),
                Venue(
                    name="University Volleyball Ground",
                    description="Outdoor clay and sand volleyball arena equipped with official FIVB regulation net posts.",
                    location="Central Sports Complex, Court 2",
                    capacity=350,
                    image_url="https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80",
                    map_url="https://maps.google.com/?q=Sarala+Birla+University+Ranchi",
                    is_active=True
                ),
                Venue(
                    name="Kabaddi Arena",
                    description="Professional indoor EVA foam mat kabaddi court with electronic referee scoring console.",
                    location="Student Recreation Hall A",
                    capacity=500,
                    image_url="https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80",
                    map_url="https://maps.google.com/?q=Sarala+Birla+University+Ranchi",
                    is_active=True
                ),
                Venue(
                    name="Student Recreation Hall (Chess & Carrom)",
                    description="Quiet, air-conditioned indoor mind-sports hall with international DGT electronic chess boards.",
                    location="Central Academic Block, Ground Floor",
                    capacity=200,
                    image_url="https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=80",
                    map_url="https://maps.google.com/?q=Sarala+Birla+University+Ranchi",
                    is_active=True
                )
            ]
            db.add_all(venues_data)
            db.commit()
            print(f"[Seed] {len(venues_data)} Sports Venues created.")

        # 4. Seed Houses (Vishvesvaraya, Chanakya, Patanjali, Ramanujan)
        expected_houses = [
            {"name": "Vishvesvaraya House", "code": "VISH", "color": "#1E40AF", "logo": "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=150&q=80"},
            {"name": "Chanakya House", "code": "CHAN", "color": "#800000", "logo": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=150&q=80"},
            {"name": "Patanjali House", "code": "PATA", "color": "#D97706", "logo": "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=150&q=80"},
            {"name": "Ramanujan House", "code": "RAMA", "color": "#059669", "logo": "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=150&q=80"},
        ]
        
        # Strictly enforce only the 4 official houses exist
        official_codes = {h["code"] for h in expected_houses}
        extra_teams = db.query(Team).filter(~Team.code.in_(official_codes)).all()
        if extra_teams:
            extra_ids = [t.id for t in extra_teams]
            from backend.app.models.point_ledger import PointLedger
            from backend.app.models.result import Result
            db.query(PointLedger).filter(PointLedger.team_id.in_(extra_ids)).delete(synchronize_session=False)
            db.query(Result).filter((Result.winner_team_id.in_(extra_ids)) | (Result.runner_up_team_id.in_(extra_ids))).delete(synchronize_session=False)
            db.query(Event).filter(Event.team_a_id.in_(extra_ids)).update({Event.team_a_id: None}, synchronize_session=False)
            db.query(Event).filter(Event.team_b_id.in_(extra_ids)).update({Event.team_b_id: None}, synchronize_session=False)
            for t in extra_teams:
                db.delete(t)
            db.commit()

        for h in expected_houses:
            existing_team = db.query(Team).filter(Team.code == h["code"]).first()
            if not existing_team:
                t = Team(name=h["name"], code=h["code"], color=h["color"], logo_url=h["logo"], is_active=True)
                db.add(t)
            else:
                existing_team.name = h["name"]
                existing_team.color = h["color"]
                existing_team.logo_url = h["logo"]
                existing_team.is_active = True
        db.commit()
        print("[Seed] 4 Official UMANG Houses strictly maintained (Vishvesvaraya, Chanakya, Patanjali, Ramanujan).")

        # 5. Seed Sports Disciplines
        v_basketball = db.query(Venue).filter(Venue.name.ilike("%Basketball%")).first()
        v_cricket = db.query(Venue).filter(Venue.name.ilike("%Cricket%")).first()
        v_football = db.query(Venue).filter(Venue.name.ilike("%Football%")).first()
        v_track = db.query(Venue).filter(Venue.name.ilike("%Athletics%")).first()
        v_indoor = db.query(Venue).filter(Venue.name.ilike("%Indoor%")).first()
        v_volleyball = db.query(Venue).filter(Venue.name.ilike("%Volleyball%")).first()
        v_kabaddi = db.query(Venue).filter(Venue.name.ilike("%Kabaddi%")).first()
        v_recreation = db.query(Venue).filter(Venue.name.ilike("%Recreation%")).first()

        sports_catalog = [
            {"name": "Basketball (Boys)", "slug": "basketball-boys", "category": "Outdoor Team", "gender": "Boys", "type": "Match-based", "venue": v_basketball, "scoring": "Points", "desc": "Inter-house 5v5 basketball tournament following FIBA 4-quarter regulation format."},
            {"name": "Basketball (Girls)", "slug": "basketball-girls", "category": "Outdoor Team", "gender": "Girls", "type": "Match-based", "venue": v_basketball, "scoring": "Points", "desc": "Women's inter-house 5v5 championship with fast-break transitions and knockout brackets."},
            {"name": "Cricket Tournament", "slug": "cricket-tournament", "category": "Outdoor Team", "gender": "Boys", "type": "Match-based", "venue": v_cricket, "scoring": "Runs/Wickets", "desc": "T20 inter-house leather ball tournament hosted at the University Cricket Arena with powerplays."},
            {"name": "Football Championship", "slug": "football-championship", "category": "Outdoor Team", "gender": "Boys", "type": "Match-based", "venue": v_football, "scoring": "Goals", "desc": "11-a-side full-pitch tournament with group stages leading into knockout semifinals."},
            {"name": "Volleyball (Boys)", "slug": "volleyball-boys", "category": "Outdoor Team", "gender": "Boys", "type": "Match-based", "venue": v_volleyball, "scoring": "Sets", "desc": "Best of 3 sets outdoor volleyball competition with rally point scoring system."},
            {"name": "Badminton Singles (Boys)", "slug": "badminton-singles-boys", "category": "Indoor Racket", "gender": "Boys", "type": "Match-based", "venue": v_indoor, "scoring": "Points/Sets", "desc": "Knockout badminton tournament on sprung wooden courts with 21-point rally scoring."},
            {"name": "Badminton Singles (Girls)", "slug": "badminton-singles-girls", "category": "Indoor Racket", "gender": "Girls", "type": "Match-based", "venue": v_indoor, "scoring": "Points/Sets", "desc": "Fast-paced women's singles tournament under tournament LED lighting."},
            {"name": "Kabaddi Championship", "slug": "kabaddi-championship", "category": "Traditional", "gender": "Boys", "type": "Match-based", "venue": v_kabaddi, "scoring": "Points", "desc": "High-intensity pro-style kabaddi on official foam mats with super raids and bonus points."},
            {"name": "100m Sprint (Boys)", "slug": "100m-sprint-boys", "category": "Athletics & Track", "gender": "Boys", "type": "Time-based", "venue": v_track, "scoring": "Time (Seconds)", "desc": "Premier track sprint event on the synthetic 8-lane track with electronic photo-finish timing."},
            {"name": "100m Sprint (Girls)", "slug": "100m-sprint-girls", "category": "Athletics & Track", "gender": "Girls", "type": "Time-based", "venue": v_track, "scoring": "Time (Seconds)", "desc": "Fastest women in Sarala Birla University compete for gold on the 100m straightaway."},
            {"name": "Shot Put (Boys)", "slug": "shot-put-boys", "category": "Athletics & Field", "gender": "Boys", "type": "Distance-based", "venue": v_track, "scoring": "Distance (Meters)", "desc": "7.26kg iron ball throw competition inside the official throwing circle and landing sector."},
            {"name": "Chess Championship", "slug": "chess-championship", "category": "Indoor Mind Sports", "gender": "Mixed", "type": "Match-based", "venue": v_recreation, "scoring": "Points", "desc": "Swiss-league classical chess championship with 45min + 15sec increment time controls."},
            {"name": "Tug of War", "slug": "tug-of-war", "category": "Traditional", "gender": "Boys", "type": "Match-based", "venue": v_track, "scoring": "Sets", "desc": "The ultimate test of inter-house collective strength and teamwork across 8-member squads."}
        ]

        for sp in sports_catalog:
            existing_sp = db.query(Sport).filter(Sport.slug == sp["slug"]).first()
            if not existing_sp:
                new_sp = Sport(
                    name=sp["name"],
                    slug=sp["slug"],
                    category=sp["category"],
                    gender=sp["gender"],
                    sport_type=sp["type"],
                    venue_id=sp["venue"].id if sp["venue"] else None,
                    status="Ongoing" if "Basketball" in sp["name"] else "Upcoming",
                    description=sp["desc"],
                    banner_url="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80",
                    rules="Standard collegiate tournament regulations apply. Proper athletic uniform required. ID cards mandatory.",
                    scoring_format=sp["scoring"],
                    registration_form_url="https://forms.gle/SBUUmang2026SportsReg"
                )
                db.add(new_sp)
        db.commit()
        print("[Seed] Sports disciplines created.")

        # 6. Seed Matches & Events (Optional Demo Fixtures)
        if seed_fixtures:
            seed_demo_fixtures(db, admin_username)


        # 7. Seed Google Form Registrations for Sports Disciplines
        sp_cricket = db.query(Sport).filter(Sport.slug == "cricket-tournament").first()
        sp_football = db.query(Sport).filter(Sport.slug == "football-championship").first()
        sp_basketball = db.query(Sport).filter(Sport.slug == "basketball-boys").first()
        sp_volleyball = db.query(Sport).filter(Sport.slug == "volleyball-boys").first()
        sp_sprint = db.query(Sport).filter(Sport.slug == "100m-sprint-boys").first()
        sp_shotput = db.query(Sport).filter(Sport.slug == "shot-put-boys").first()
        sp_badmin = db.query(Sport).filter(Sport.slug == "badminton-singles-boys").first()
        sp_kabaddi = db.query(Sport).filter(Sport.slug == "kabaddi-championship").first()
        sp_chess = db.query(Sport).filter(Sport.slug == "chess-championship").first()
        sp_tug = db.query(Sport).filter(Sport.slug == "tug-of-war").first()

        if db.query(RegistrationForm).count() == 0:
            forms_data = [
                RegistrationForm(
                    title="Cricket Championship 2026 — Official House Squad Entry",
                    description="House Captains & Managers must submit their 15-player squad roster with university enrollment numbers.",
                    category="Outdoor Team",
                    gender="Boys",
                    sport_id=sp_cricket.id if sp_cricket else None,
                    google_form_url="https://forms.gle/SBUUmangCricketSquad2026",
                    opening_date=datetime.datetime.utcnow() - datetime.timedelta(days=7),
                    closing_date=datetime.datetime.utcnow() + datetime.timedelta(days=5),
                    status="OPEN",
                    published_state="PUBLISHED",
                    version=1
                ),
                RegistrationForm(
                    title="Football 11v11 Tournament — House Team Lineup Entry",
                    description="Official 16-member team submission for the Inter-House Football Championship at Campus South Ground.",
                    category="Outdoor Team",
                    gender="Boys",
                    sport_id=sp_football.id if sp_football else None,
                    google_form_url="https://forms.gle/SBUUmangFootball2026",
                    opening_date=datetime.datetime.utcnow() - datetime.timedelta(days=7),
                    closing_date=datetime.datetime.utcnow() + datetime.timedelta(days=5),
                    status="OPEN",
                    published_state="PUBLISHED",
                    version=1
                ),
                RegistrationForm(
                    title="Basketball 5v5 Championship (Boys & Girls) Entry",
                    description="Inter-House basketball team roster registration for standard 5v5 tournament at Outdoor Courts Block.",
                    category="Outdoor Team",
                    gender="Mixed",
                    sport_id=sp_basketball.id if sp_basketball else None,
                    google_form_url="https://forms.gle/SBUUmangBasketball2026",
                    opening_date=datetime.datetime.utcnow() - datetime.timedelta(days=6),
                    closing_date=datetime.datetime.utcnow() + datetime.timedelta(days=4),
                    status="OPEN",
                    published_state="PUBLISHED",
                    version=1
                ),
                RegistrationForm(
                    title="Volleyball Championship — Official Team Registration",
                    description="6-player squad and substitutions entry for outdoor clay court matches with official FIVB rules.",
                    category="Outdoor Team",
                    gender="Boys",
                    sport_id=sp_volleyball.id if sp_volleyball else None,
                    google_form_url="https://forms.gle/SBUUmangVolleyball2026",
                    opening_date=datetime.datetime.utcnow() - datetime.timedelta(days=5),
                    closing_date=datetime.datetime.utcnow() + datetime.timedelta(days=6),
                    status="OPEN",
                    published_state="PUBLISHED",
                    version=1
                ),
                RegistrationForm(
                    title="Athletics Track Sprints (100m, 200m & 400m) Entry",
                    description="Individual participant registrations for track sprints across Boys and Girls divisions at the 8-lane track.",
                    category="Athletics & Track",
                    gender="Mixed",
                    sport_id=sp_sprint.id if sp_sprint else None,
                    google_form_url="https://forms.gle/SBUUmangAthletics2026",
                    opening_date=datetime.datetime.utcnow() - datetime.timedelta(days=7),
                    closing_date=datetime.datetime.utcnow() + datetime.timedelta(days=4),
                    status="OPEN",
                    published_state="PUBLISHED",
                    version=1
                ),
                RegistrationForm(
                    title="Field Athletics (Shot Put & Long Jump) Championship",
                    description="Individual field events registration. Competitors throw 7.26kg shot put or compete in long jump pit.",
                    category="Athletics & Field",
                    gender="Boys",
                    sport_id=sp_shotput.id if sp_shotput else None,
                    google_form_url="https://forms.gle/SBUUmangFieldAthletics2026",
                    opening_date=datetime.datetime.utcnow() - datetime.timedelta(days=8),
                    closing_date=datetime.datetime.utcnow() + datetime.timedelta(days=3),
                    status="OPEN",
                    published_state="PUBLISHED",
                    version=1
                ),
                RegistrationForm(
                    title="Inter-House Badminton Championship (Singles & Doubles)",
                    description="Singles and Doubles participant entries for Boys and Girls divisions on sprung wooden courts.",
                    category="Indoor Racket",
                    gender="Mixed",
                    sport_id=sp_badmin.id if sp_badmin else None,
                    google_form_url="https://forms.gle/SBUUmangBadminton2026",
                    opening_date=datetime.datetime.utcnow() - datetime.timedelta(days=10),
                    closing_date=datetime.datetime.utcnow() + datetime.timedelta(days=2),
                    status="CLOSING_SOON",
                    published_state="PUBLISHED",
                    version=1
                ),
                RegistrationForm(
                    title="Kabaddi Championship — Official Mat Squad Entry",
                    description="Official 7-player active + 5 substitutes squad registration for mat kabaddi tournament.",
                    category="Traditional",
                    gender="Boys",
                    sport_id=sp_kabaddi.id if sp_kabaddi else None,
                    google_form_url="https://forms.gle/SBUUmangKabaddi2026",
                    opening_date=datetime.datetime.utcnow() - datetime.timedelta(days=5),
                    closing_date=datetime.datetime.utcnow() + datetime.timedelta(days=5),
                    status="OPEN",
                    published_state="PUBLISHED",
                    version=1
                ),
                RegistrationForm(
                    title="Tug of War Championship — 8-Member Squad Entry",
                    description="Inter-House heavyweight strength tie. Captains must submit 8 starting pullers and 2 reserves.",
                    category="Traditional",
                    gender="Boys",
                    sport_id=sp_tug.id if sp_tug else None,
                    google_form_url="https://forms.gle/SBUUmangTugOfWar2026",
                    opening_date=datetime.datetime.utcnow() - datetime.timedelta(days=4),
                    closing_date=datetime.datetime.utcnow() + datetime.timedelta(days=6),
                    status="OPEN",
                    published_state="PUBLISHED",
                    version=1
                ),
                RegistrationForm(
                    title="Chess Championship — Swiss League Registration",
                    description="Classical chess competition with 45min + 15sec increment clocks hosted at Central Academic Block.",
                    category="Indoor Mind Sports",
                    gender="Mixed",
                    sport_id=sp_chess.id if sp_chess else None,
                    google_form_url="https://forms.gle/SBUUmangChess2026",
                    opening_date=datetime.datetime.utcnow() - datetime.timedelta(days=6),
                    closing_date=datetime.datetime.utcnow() + datetime.timedelta(days=3),
                    status="OPEN",
                    published_state="PUBLISHED",
                    version=1
                )
            ]
            db.add_all(forms_data)
            db.commit()
            print(f"[Seed] {len(forms_data)} Sports Registration Forms published.")

        # 8. Seed Announcements
        if seed_fixtures and db.query(Announcement).count() == 0:
            announcements_data = [
                Announcement(
                    title="🔴 Live Match Alert: Basketball Semi-Final in Progress",
                    description="Vishvesvaraya and Chanakya are locked in a tense 3rd quarter battle at the Main Basketball Court. Catch live scores now!",
                    category="SCHEDULE_UPDATE",
                    priority="HIGH",
                    published_state="PUBLISHED",
                    version=1
                ),
                Announcement(
                    title="Cricket Semi-Finals Moved to 09:30 AM Tomorrow",
                    description="Due to evening light conditions, tomorrow's Cricket Semi-Final between Patanjali and Ramanujan will commence early at 09:30 AM at the University Cricket Arena.",
                    category="SCHEDULE_UPDATE",
                    priority="MEDIUM",
                    published_state="PUBLISHED",
                    version=1
                ),
                Announcement(
                    title="Official House Standings Updated After Day 1 Athletics",
                    description="Vishvesvaraya leads the Inter-House Championship tally with 15 points, followed closely by Chanakya (17) and Ramanujan (17). Check the official leaderboard for full point breakdowns.",
                    category="RESULT",
                    priority="HIGH",
                    published_state="PUBLISHED",
                    version=1
                )
            ]
            db.add_all(announcements_data)
            db.commit()
            print(f"[Seed] {len(announcements_data)} Sports Announcements posted.")

        # 9. Seed Historical Archives (Past 5 Years)
        seed_historical_archives(db)

    finally:
        db.close()


def seed_demo_fixtures(db: Session, admin_username: str):
    """Optional seeding of sample live, upcoming, and completed matches with points ledger."""
    v_basketball = db.query(Venue).filter(Venue.name.ilike("%Basketball%")).first()
    v_cricket = db.query(Venue).filter(Venue.name.ilike("%Cricket%")).first()
    v_football = db.query(Venue).filter(Venue.name.ilike("%Football%")).first()
    v_track = db.query(Venue).filter(Venue.name.ilike("%Athletics%")).first()
    v_indoor = db.query(Venue).filter(Venue.name.ilike("%Indoor%")).first()
    v_volleyball = db.query(Venue).filter(Venue.name.ilike("%Volleyball%")).first()
    v_kabaddi = db.query(Venue).filter(Venue.name.ilike("%Kabaddi%")).first()

    vish = db.query(Team).filter(Team.code == "VISH").first()
    chan = db.query(Team).filter(Team.code == "CHAN").first()
    pata = db.query(Team).filter(Team.code == "PATA").first()
    rama = db.query(Team).filter(Team.code == "RAMA").first()

    sp_bball_boys = db.query(Sport).filter(Sport.slug == "basketball-boys").first()
    sp_cricket = db.query(Sport).filter(Sport.slug == "cricket-tournament").first()
    sp_football = db.query(Sport).filter(Sport.slug == "football-championship").first()
    sp_volleyball = db.query(Sport).filter(Sport.slug == "volleyball-boys").first()
    sp_badmin = db.query(Sport).filter(Sport.slug == "badminton-singles-boys").first()
    sp_shotput = db.query(Sport).filter(Sport.slug == "shot-put-boys").first()
    sp_kabaddi = db.query(Sport).filter(Sport.slug == "kabaddi-championship").first()
    sp_sprint = db.query(Sport).filter(Sport.slug == "100m-sprint-boys").first()

    today = datetime.date.today()
    tomorrow = today + datetime.timedelta(days=1)
    day_after = today + datetime.timedelta(days=2)
    yesterday = today - datetime.timedelta(days=1)

    # A. LIVE MATCH: Basketball Semi-Final
    live_match = db.query(Event).filter(Event.slug == "basketball-boys-semi-final-1").first()
    if not live_match:
        live_match = Event(
            title="Basketball (Boys) — Semi-Final 1: Vishvesvaraya vs Chanakya",
            slug="basketball-boys-semi-final-1",
            description="High-octane semi-final clash between defending champions Vishvesvaraya House and Chanakya House.",
            category="Outdoor Team",
            sport_id=sp_bball_boys.id if sp_bball_boys else None,
            gender="Boys",
            event_type="Match-based",
            round="Semi-Final",
            stage="Knockout",
            team_a_id=vish.id if vish else None,
            team_b_id=chan.id if chan else None,
            score_a="32",
            score_b="28",
            venue_id=v_basketball.id if v_basketball else None,
            event_date=today,
            start_time="16:00",
            end_time="17:30",
            status="LIVE",
            published_state="PUBLISHED",
            live_score="32 — 28",
            live_round="Semi-Final",
            live_stage="Knockout",
            live_status_detail="Quarter 3 (6:42 left)",
            live_notes="Vishvesvaraya holding a 4-point lead after a clutch 3-pointer. High defensive pressure by Chanakya.",
            version=1
        )
        db.add(live_match)
        db.commit()
        print("[Seed] Live Basketball match created.")

    # B. UPCOMING MATCHES
    upcoming_data = [
        {
            "title": "Cricket (Boys) — Semi-Final 2: Patanjali vs Ramanujan",
            "slug": f"cricket-semi-2-{tomorrow.strftime('%Y%m%d')}",
            "desc": "T20 Semi-Final showdown between Patanjali Strikers and Ramanujan Knights.",
            "category": "Outdoor Team",
            "sport": sp_cricket,
            "venue": v_cricket,
            "team_a": pata,
            "team_b": rama,
            "round": "Semi-Final",
            "stage": "Knockout",
            "date": tomorrow,
            "start": "09:30",
            "end": "13:00"
        },
        {
            "title": "Volleyball (Boys) — Group Stage: Vishvesvaraya vs Patanjali",
            "slug": f"volleyball-group-1-{tomorrow.strftime('%Y%m%d')}",
            "desc": "Day 2 opening volleyball tie in Court 2.",
            "category": "Outdoor Team",
            "sport": sp_volleyball,
            "venue": v_volleyball,
            "team_a": vish,
            "team_b": pata,
            "round": "Round 1",
            "stage": "Group Stage",
            "date": tomorrow,
            "start": "14:00",
            "end": "15:30"
        },
        {
            "title": "Football (Boys) — Quarter-Final: Chanakya vs Ramanujan",
            "slug": f"football-qf-1-{day_after.strftime('%Y%m%d')}",
            "desc": "Intense football quarterfinal knockout match at the natural turf arena.",
            "category": "Outdoor Team",
            "sport": sp_football,
            "venue": v_football,
            "team_a": chan,
            "team_b": rama,
            "round": "Quarter-Final",
            "stage": "Knockout",
            "date": day_after,
            "start": "15:00",
            "end": "17:00"
        },
        {
            "title": "100m Sprint (Boys) — Final Heats",
            "slug": f"100m-boys-heats-{day_after.strftime('%Y%m%d')}",
            "desc": "The 8 fastest qualifiers compete for sprint supremacy and house glory.",
            "category": "Athletics & Track",
            "sport": sp_sprint,
            "venue": v_track,
            "team_a": None,
            "team_b": None,
            "round": "Finals",
            "stage": "Finals",
            "date": day_after,
            "start": "17:30",
            "end": "18:30"
        }
    ]

    for u in upcoming_data:
        if not db.query(Event).filter(Event.slug == u["slug"]).first():
            e = Event(
                title=u["title"],
                slug=u["slug"],
                description=u["desc"],
                category=u["category"],
                sport_id=u["sport"].id if u["sport"] else None,
                gender="Boys",
                event_type="Match-based" if u["team_a"] else "Time-based",
                round=u["round"],
                stage=u["stage"],
                team_a_id=u["team_a"].id if u["team_a"] else None,
                team_b_id=u["team_b"].id if u["team_b"] else None,
                venue_id=u["venue"].id if u["venue"] else None,
                event_date=u["date"],
                start_time=u["start"],
                end_time=u["end"],
                status="UPCOMING",
                published_state="PUBLISHED",
                version=1
            )
            db.add(e)
    db.commit()

    # C. COMPLETED EVENTS & OFFICIALLY AWARDED RESULTS
    ev_badminton = db.query(Event).filter(Event.slug == "badminton-boys-singles-final").first()
    if not ev_badminton:
        ev_badminton = Event(
            title="Badminton (Boys) Singles — Final",
            slug="badminton-boys-singles-final",
            description="Final match of the UMANG inter-house badminton tournament.",
            category="Indoor Racket",
            sport_id=sp_badmin.id if sp_badmin else None,
            gender="Boys",
            event_type="Match-based",
            round="Final",
            stage="Knockout",
            team_a_id=vish.id if vish else None,
            team_b_id=pata.id if pata else None,
            score_a="2",
            score_b="1",
            winner_team_id=vish.id if vish else None,
            venue_id=v_indoor.id if v_indoor else None,
            event_date=yesterday,
            start_time="11:00",
            end_time="12:30",
            status="COMPLETED",
            published_state="PUBLISHED",
            live_score="21-18, 19-21, 21-16",
            version=1
        )
        db.add(ev_badminton)
        db.commit()
        db.refresh(ev_badminton)

        create_or_update_result_with_ledger(
            db=db,
            admin_username=admin_username,
            event_id=ev_badminton.id,
            category="Main",
            winner_team_id=vish.id,
            winner_points=10,
            winner_participant="Rohan Verma",
            winner_metric="2-1 Sets (21-16 final)",
            runner_up_team_id=pata.id,
            runner_up_points=7,
            runner_up_participant="Aakash Kumar",
            runner_up_metric="Runner-up",
            remarks="Spectacular 3-set thriller lasting 54 minutes.",
            published_state="PUBLISHED"
        )

    ev_shotput = db.query(Event).filter(Event.slug == "shot-put-boys-final").first()
    if not ev_shotput:
        ev_shotput = Event(
            title="Shot Put (Boys) — Championship Final",
            slug="shot-put-boys-final",
            description="Heavy athletics final with 7.26kg shot put throwing.",
            category="Athletics & Field",
            sport_id=sp_shotput.id if sp_shotput else None,
            gender="Boys",
            event_type="Distance-based",
            round="Final",
            stage="Finals",
            winner_team_id=chan.id if chan else None,
            venue_id=v_track.id if v_track else None,
            event_date=yesterday,
            start_time="15:00",
            end_time="16:30",
            status="COMPLETED",
            published_state="PUBLISHED",
            version=1
        )
        db.add(ev_shotput)
        db.commit()
        db.refresh(ev_shotput)

        create_or_update_result_with_ledger(
            db=db,
            admin_username=admin_username,
            event_id=ev_shotput.id,
            category="Main",
            winner_team_id=chan.id,
            winner_points=10,
            winner_participant="Vikram Singh",
            winner_metric="13.84 meters",
            runner_up_team_id=rama.id,
            runner_up_points=7,
            runner_up_participant="Manish Tiwari",
            runner_up_metric="13.12 meters",
            third_place_team_id=vish.id,
            third_place_points=5,
            third_place_participant="Saurabh Paul",
            third_place_metric="12.65 meters",
            remarks="New university meet record set by Vikram Singh (13.84m).",
            published_state="PUBLISHED"
        )

    ev_kabaddi = db.query(Event).filter(Event.slug == "kabaddi-opening-round-1").first()
    if not ev_kabaddi:
        ev_kabaddi = Event(
            title="Kabaddi (Boys) — Opening Tie: Ramanujan vs Chanakya",
            slug="kabaddi-opening-round-1",
            description="Electrifying mat kabaddi clash.",
            category="Traditional",
            sport_id=sp_kabaddi.id if sp_kabaddi else None,
            gender="Boys",
            event_type="Match-based",
            round="Round 1",
            stage="Group Stage",
            team_a_id=rama.id if rama else None,
            team_b_id=chan.id if chan else None,
            score_a="41",
            score_b="38",
            winner_team_id=rama.id if rama else None,
            venue_id=v_kabaddi.id if v_kabaddi else None,
            event_date=yesterday,
            start_time="17:00",
            end_time="18:00",
            status="COMPLETED",
            published_state="PUBLISHED",
            live_score="41 — 38",
            version=1
        )
        db.add(ev_kabaddi)
        db.commit()
        db.refresh(ev_kabaddi)

        create_or_update_result_with_ledger(
            db=db,
            admin_username=admin_username,
            event_id=ev_kabaddi.id,
            category="Main",
            winner_team_id=rama.id,
            winner_points=10,
            winner_participant="Ramanujan Raiders",
            winner_metric="41 — 38 (+3)",
            runner_up_team_id=chan.id,
            runner_up_points=7,
            runner_up_participant="Chanakya Warriors",
            runner_up_metric="38 points",
            remarks="Ramanujan sealed victory with a thrilling super-tackle in the final 30 seconds.",
            published_state="PUBLISHED"
        )

    print("[Seed] Completed matches and official house point ledgers generated.")


def seed_leadership_members(db: Session):
    """Seed university patrons, executive leadership (Director General, etc.), and sports incharges."""
    officials_data = [
        # Executive Leadership & Patrons
        {
            "name": "Smt. Jayashree Mohta",
            "designation": "Hon'ble Chancellor",
            "category": "executive",
            "bio": "Exemplifies the vision of holistic education with values, fostering a culture of athletic discipline, innovation, and national heritage as Chairperson of Bharat Arogya & Gyan Mandir.",
            "image_url": "/images/leadership/jayashree_mohta.jpg",
            "display_order": 1,
            "is_active": True,
            "contact_email": "chancellor@sbu.ac.in",
        },
        {
            "name": "CA Bijay Kumar Dalan",
            "designation": "Hon'ble Pro-Chancellor",
            "category": "executive",
            "bio": "Hon'ble Secretary of Bharat Arogya & Gyan Mandir, championing modern collegiate education blended with timeless Indian traditions, youth fitness, and student wellness.",
            "image_url": "/images/leadership/bk_dalan.png",
            "display_order": 2,
            "is_active": True,
            "contact_email": "prochancellor@sbu.ac.in",
        },
        {
            "name": "Prof. (Dr.) Gopal Pathak",
            "designation": "Hon'ble Director General",
            "category": "executive",
            "bio": "Former Vice-Chancellor of SBU and founding VC of JUT, guiding Sarala Birla University's institutional vision, academic-athletic balance, and university sports expansion.",
            "image_url": "/images/leadership/gopal_pathak.png",
            "display_order": 3,
            "is_active": True,
            "contact_email": "dg@sbu.ac.in",
        },
        {
            "name": "Prof. (Dr.) Jeganathan Chockalingam",
            "designation": "Hon'ble Vice-Chancellor",
            "category": "executive",
            "bio": "Drives the university toward competitive global excellence while maintaining ethical grounding, teamwork, sportsmanship, and student health.",
            "image_url": "/images/leadership/jeganathan.jpg",
            "display_order": 4,
            "is_active": True,
            "contact_email": "vc@sbu.ac.in",
        },
        {
            "name": "Prof. S. B. Dandin",
            "designation": "Registrar",
            "category": "executive",
            "bio": "Oversees university administration and institutional governance, ensuring transparent management of athletic championships, campus infrastructure, and student welfare.",
            "image_url": "/images/leadership/dandin.jpg",
            "display_order": 5,
            "is_active": True,
            "contact_email": "registrar@sbu.ac.in",
        },

        # All Three Sports Incharges & Oversight
        {
            "name": "Prof. (Dr.) Neelima Pathak",
            "designation": "Dean — Faculty of Arts, Culture & Sports",
            "category": "sports",
            "bio": "Leads the academic and administrative stewardship of university sports, culture, and yogic sciences, mentoring student athletes in discipline, mental fortitude, and tournament excellence.",
            "image_url": "/images/leadership/neelima_pathak.jpg",
            "display_order": 6,
            "is_active": True,
            "contact_email": "neelima.pathak@sbu.ac.in",
        },
        {
            "name": "Mr. Subhash Narayan Shahdeo",
            "designation": "Sports Officer / Chief Sports Incharge",
            "category": "sports",
            "bio": "Chief athletic administrator directing university inter-house sports tournaments, UMANG events, and external representation across state and national collegiate meets.",
            "image_url": "/images/leadership/shah_deo.jpg",
            "display_order": 7,
            "is_active": True,
            "contact_email": "sports.officer@sbu.ac.in",
        },
        {
            "name": "Mr. Rahul Ranjan",
            "designation": "Deputy Sports Officer / Sports Incharge",
            "category": "sports",
            "bio": "Key sports incharge managing athletic grounds, AstroTurf facilities, equipment logistics, team selections, and referee coordination for all 13 UMANG disciplines.",
            "image_url": None,
            "display_order": 8,
            "is_active": True,
            "contact_email": "rahul.ranjan@sbu.ac.in",
        },
        {
            "name": "Mr. Gaurav Kumar Das",
            "designation": "Assistant Sports Officer / Sports Incharge",
            "category": "sports",
            "bio": "Key sports incharge coordinating student athlete fitness routines, tactical coaching sessions, arena match scheduling, and inter-house team lineups.",
            "image_url": None,
            "display_order": 9,
            "is_active": True,
            "contact_email": "gaurav.das@sbu.ac.in",
        },
    ]

    for item in officials_data:
        existing = db.query(LeadershipMember).filter(LeadershipMember.name == item["name"]).first()
        if not existing:
            member = LeadershipMember(**item)
            db.add(member)
        else:
            for k, v in item.items():
                setattr(existing, k, v)
    db.commit()
    print(f"[Seed] Successfully seeded {len(officials_data)} University Leadership & Sports Incharge members.")


if __name__ == "__main__":
    import sys
    with_fixtures = "--with-fixtures" in sys.argv
    seed_database(seed_fixtures=with_fixtures)


