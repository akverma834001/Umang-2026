import datetime
from sqlalchemy.orm import Session
from backend.app.database.session import SessionLocal, Base, engine
from backend.app.models.team import Team
from backend.app.models.historical_edition import HistoricalEdition, YearlyHouseStanding, HistoricalSportRecord


def seed_historical_archives(db: Session = None, force: bool = False):
    """Seed past 5 years (2021-2025) of SBU UMANG sports championships with student enrollment numbers & team squads."""
    Base.metadata.create_all(bind=engine)
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        # Check if already seeded and not force
        existing_count = db.query(HistoricalEdition).count()
        if existing_count >= 5 and not force:
            # Check if winner_enrollment_no is already populated
            sample_rec = db.query(HistoricalSportRecord).filter(HistoricalSportRecord.winner_enrollment_no != None).first()
            if sample_rec:
                print("[Seed Archives] Historical editions already populated with enrollment numbers.")
                return

        # Fetch teams
        teams_by_code = {t.code: t for t in db.query(Team).all()}
        vish = teams_by_code.get("VISH")
        chan = teams_by_code.get("CHAN")
        pata = teams_by_code.get("PATA")
        rama = teams_by_code.get("RAMA")

        if not vish or not chan or not pata or not rama:
            print("[Seed Archives] Notice: Teams not yet provisioned. Skipping archives seed.")
            return

        # Clear existing historical records if updating
        db.query(HistoricalSportRecord).delete()
        db.query(YearlyHouseStanding).delete()
        db.query(HistoricalEdition).delete()
        db.commit()

        editions_payload = [
            # =========================================================================
            # --- 2021 ---
            # =========================================================================
            {
                "year": 2021,
                "edition_title": "SBU UMANG 2021 — Phased Campus Reopening Games",
                "theme": "Overcoming Boundaries — SBU Reunited",
                "start_date": datetime.date(2021, 11, 18),
                "end_date": datetime.date(2021, 11, 20),
                "chief_guest": "Dr. Gopal Pathak, Vice Chancellor, SBU Ranchi",
                "total_athletes": 280,
                "summary": "The 2021 edition marked the spirited return of inter-house athletic competition at Sarala Birla University following pandemic lockdowns. Ramanujan House took home the overall championship trophy with clean sweeps in track sprints, table tennis, and mind sports.",
                "banner_url": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
                "champion": rama,
                "runner_up": chan,
                "third": vish,
                "best_boy": "Rahul Mishra (Enrollment No: SBU2123045)",
                "best_girl": "Sneha Tigga (Enrollment No: SBU2115028)",
                "fair_play": "Patanjali House",
                "march_past": "Chanakya House",
                "standings": [
                    {"team": rama, "points": 125, "rank": 1, "gold": 6, "silver": 4, "bronze": 3},
                    {"team": chan, "points": 118, "rank": 2, "gold": 5, "silver": 5, "bronze": 4},
                    {"team": vish, "points": 95, "rank": 3, "gold": 3, "silver": 4, "bronze": 5},
                    {"team": pata, "points": 82, "rank": 4, "gold": 2, "silver": 3, "bronze": 4},
                ],
                "sports": [
                    {
                        "sport": "100m Sprint (Boys)",
                        "category": "Athletics & Track",
                        "gender": "Boys",
                        "win_team": rama,
                        "winner": "Rahul Mishra",
                        "winner_enrollment": "SBU2123045",
                        "winner_players": None,
                        "metric": "11.24s",
                        "run_team": chan,
                        "run_part": "Suraj Singh",
                        "run_enrollment": "SBU2112082",
                        "run_players": None,
                        "remarks": "Photo finish thriller on natural turf."
                    },
                    {
                        "sport": "100m Sprint (Girls)",
                        "category": "Athletics & Track",
                        "gender": "Girls",
                        "win_team": chan,
                        "winner": "Sneha Tigga",
                        "winner_enrollment": "SBU2115028",
                        "winner_players": None,
                        "metric": "13.12s",
                        "run_team": vish,
                        "run_part": "Pooja Verma",
                        "run_enrollment": "SBU2118014",
                        "run_players": None,
                        "remarks": "Comfortable 3m lead at the finish line."
                    },
                    {
                        "sport": "Cricket Tournament",
                        "category": "Outdoor Team",
                        "gender": "Boys",
                        "win_team": rama,
                        "winner": "Ramanujan XI (Capt. Alok Roy)",
                        "winner_enrollment": "SBU2123014",
                        "winner_players": "Alok Roy (SBU2123014) [C], Rohit Shaw (SBU2112033), Karan Mehta (SBU2115019), Manish Kumar (SBU2131008), Sunny Tirkey (SBU2123052), Deepak Soren (SBU2112041), Ravi Shankar (SBU2151012), Abhishek Sinha (SBU2123089), Vikash Yadav (SBU2115045), Sandeep Oraon (SBU2118022), Amit Topno (SBU2123104)",
                        "metric": "142/4 vs 138/8 (Won by 6 wkts)",
                        "run_team": chan,
                        "run_part": "Chanakya XI (Capt. Vishal Pandey)",
                        "run_enrollment": "SBU2123071",
                        "run_players": "Vishal Pandey (SBU2123071) [C], Shubham Raj (SBU2112015), Aniket Kumar (SBU2115038), Harshvardhan (SBU2123022), Nikhil Singh (SBU2118007), Rahul Sen (SBU2141011), Ayush Tiwary (SBU2123093), Gaurav Jha (SBU2115062), Pranay Das (SBU2123110), Saurav Roy (SBU2112077), Kunal Beck (SBU2131031)",
                        "remarks": "Captain's knock of 64* by Alok Roy."
                    },
                    {
                        "sport": "Football Championship",
                        "category": "Outdoor Team",
                        "gender": "Boys",
                        "win_team": chan,
                        "winner": "Chanakya FC (Capt. Samuel Murmu)",
                        "winner_enrollment": "SBU2112026",
                        "winner_players": "Samuel Murmu (SBU2112026) [C], John Kerketta (SBU2123039), David Barla (SBU2115017), Rohit Soren (SBU2118031), Akash Minz (SBU2123078), Sunil Hembrom (SBU2112054), Aman Ekka (SBU2131019), Manish Bhengra (SBU2123101), Pritam Topno (SBU2115044), Joseph Kujur (SBU2151006), Roshan Gari (SBU2123065)",
                        "metric": "2 — 1",
                        "run_team": vish,
                        "run_part": "Vishvesvaraya United (Capt. Ashish Lakra)",
                        "run_enrollment": "SBU2123058",
                        "run_players": "Ashish Lakra (SBU2123058) [C], Rahul Tirkey (SBU2112042), Sanjay Mahto (SBU2115029), Deepak Kumar (SBU2118018), Rohit Verma (SBU2123084), Sunny Munda (SBU2112061), Vinod Sahu (SBU2131024), Amit Khess (SBU2123095), Suraj Gope (SBU2115051), Pawan Yadav (SBU2151015), Alok Bara (SBU2123073)",
                        "remarks": "Decisive 84th minute header by Samuel Murmu."
                    },
                    {
                        "sport": "Badminton Singles (Boys)",
                        "category": "Indoor Racket",
                        "gender": "Boys",
                        "win_team": vish,
                        "winner": "Amit Kumar",
                        "winner_enrollment": "SBU2123034",
                        "winner_players": None,
                        "metric": "21-18, 22-20",
                        "run_team": pata,
                        "run_part": "Vikas Sahu",
                        "run_enrollment": "SBU2112019",
                        "run_players": None,
                        "remarks": "Defensive counter-attacking masterclass."
                    },
                    {
                        "sport": "Shot Put (Boys)",
                        "category": "Athletics & Field",
                        "gender": "Boys",
                        "win_team": pata,
                        "winner": "Vikash Mahto",
                        "winner_enrollment": "SBU2131012",
                        "winner_players": None,
                        "metric": "12.85 meters",
                        "run_team": chan,
                        "run_part": "Rohit Kumar",
                        "run_enrollment": "SBU2123099",
                        "run_players": None,
                        "remarks": "Consistent throws above 12.5m mark."
                    },
                    {
                        "sport": "Chess Championship",
                        "category": "Indoor Mind Sports",
                        "gender": "Mixed",
                        "win_team": rama,
                        "winner": "Deepak Tirkey",
                        "winner_enrollment": "SBU2123008",
                        "winner_players": None,
                        "metric": "5.5 / 6.0 Points",
                        "run_team": pata,
                        "run_part": "Nikhil Pandey",
                        "run_enrollment": "SBU2115041",
                        "run_players": None,
                        "remarks": "Flawless endgame strategy in round 5."
                    },
                    {
                        "sport": "Tug of War",
                        "category": "Traditional",
                        "gender": "Boys",
                        "win_team": chan,
                        "winner": "Chanakya Pullers (Capt. Arjun Singh)",
                        "winner_enrollment": "SBU2123062",
                        "winner_players": "Arjun Singh (SBU2123062) [C], Kuldeep Mahto (SBU2112037), Ranjeet Yadav (SBU2115021), Manoj Verma (SBU2118040), Dheeraj Kumar (SBU2131016), Pradeep Soren (SBU2123087), Vicky Pandey (SBU2112059), Alok Munda (SBU2151024)",
                        "metric": "2 — 0 Sets",
                        "run_team": pata,
                        "run_part": "Patanjali Squad (Capt. Hemant Kumar)",
                        "run_enrollment": "SBU2123043",
                        "run_players": "Hemant Kumar (SBU2123043) [C], Rajesh Sahu (SBU2112028), Pankaj Sen (SBU2115014), Sandeep Tirkey (SBU2118033), Ramesh Gope (SBU2131021), Santosh Oraon (SBU2123076), Vinay Singh (SBU2112064), Mahesh Verma (SBU2151018)",
                        "remarks": "Unbeaten squad through the preliminary rounds."
                    },
                    {
                        "sport": "Volleyball (Boys)",
                        "category": "Outdoor Team",
                        "gender": "Boys",
                        "win_team": vish,
                        "winner": "Vishvesvaraya Spikers (Capt. Gaurav Mishra)",
                        "winner_enrollment": "SBU2123027",
                        "winner_players": "Gaurav Mishra (SBU2123027) [C], Ayush Sharma (SBU2112046), Roshan Mahto (SBU2115033), Kunal Sen (SBU2118019), Manish Topno (SBU2123091), Saurabh Singh (SBU2131009)",
                        "metric": "2 — 1 Sets",
                        "run_team": rama,
                        "run_part": "Ramanujan Strikers (Capt. Nikhil Roy)",
                        "run_enrollment": "SBU2123083",
                        "run_players": "Nikhil Roy (SBU2123083) [C], Rahul Gope (SBU2112035), Sunny Mahto (SBU2115026), Ankit Yadav (SBU2118024), Deepak Soren (SBU2123067), Vikash Tirkey (SBU2131014)",
                        "remarks": "Clutch block on match point."
                    },
                ]
            },

            # =========================================================================
            # --- 2022 ---
            # =========================================================================
            {
                "year": 2022,
                "edition_title": "SBU UMANG 2022 — Wings of Valor Sports Meet",
                "theme": "Wings of Valor — Campus Reconnected",
                "start_date": datetime.date(2022, 10, 14),
                "end_date": datetime.date(2022, 10, 16),
                "chief_guest": "Shri C. P. Singh, Former Cabinet Minister, Jharkhand",
                "total_athletes": 420,
                "summary": "With full campus reactivation, UMANG 2022 welcomed over 400 student competitors. Chanakya House rose to the pinnacle with dominant performances in cricket, basketball, and team martial disciplines.",
                "banner_url": "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80",
                "champion": chan,
                "runner_up": vish,
                "third": pata,
                "best_boy": "Aman Toppo (Enrollment No: SBU2212019)",
                "best_girl": "Priyanka Kumari (Enrollment No: SBU2223088)",
                "fair_play": "Ramanujan House",
                "march_past": "Vishvesvaraya House",
                "standings": [
                    {"team": chan, "points": 142, "rank": 1, "gold": 7, "silver": 4, "bronze": 4},
                    {"team": vish, "points": 135, "rank": 2, "gold": 6, "silver": 5, "bronze": 3},
                    {"team": pata, "points": 110, "rank": 3, "gold": 4, "silver": 4, "bronze": 5},
                    {"team": rama, "points": 98, "rank": 4, "gold": 3, "silver": 5, "bronze": 4},
                ],
                "sports": [
                    {
                        "sport": "100m Sprint (Boys)",
                        "category": "Athletics & Track",
                        "gender": "Boys",
                        "win_team": chan,
                        "winner": "Aman Toppo",
                        "winner_enrollment": "SBU2212019",
                        "winner_players": None,
                        "metric": "10.98s",
                        "run_team": vish,
                        "run_part": "Vivek Munda",
                        "run_enrollment": "SBU2223056",
                        "run_players": None,
                        "remarks": "First sub-11s time recorded at Birla Campus."
                    },
                    {
                        "sport": "100m Sprint (Girls)",
                        "category": "Athletics & Track",
                        "gender": "Girls",
                        "win_team": vish,
                        "winner": "Priyanka Kumari",
                        "winner_enrollment": "SBU2223088",
                        "winner_players": None,
                        "metric": "12.86s",
                        "run_team": pata,
                        "run_part": "Divya Rani",
                        "run_enrollment": "SBU2215034",
                        "run_players": None,
                        "remarks": "Stunning acceleration from the 40m mark."
                    },
                    {
                        "sport": "Cricket Tournament",
                        "category": "Outdoor Team",
                        "gender": "Boys",
                        "win_team": chan,
                        "winner": "Chanakya Warriors (Capt. Harshvardhan)",
                        "winner_enrollment": "SBU2223022",
                        "winner_players": "Harshvardhan (SBU2223022) [C], Vishal Pandey (SBU2223071), Aman Toppo (SBU2212019), Shubham Raj (SBU2212015), Aniket Kumar (SBU2215038), Nikhil Singh (SBU2218007), Rahul Sen (SBU2241011), Ayush Tiwary (SBU2223093), Gaurav Jha (SBU2215062), Pranay Das (SBU2223110), Kunal Beck (SBU2231031)",
                        "metric": "165/6 vs 159/9",
                        "run_team": pata,
                        "run_part": "Patanjali XI (Capt. Ritesh Pandey)",
                        "run_enrollment": "SBU2215017",
                        "run_players": "Ritesh Pandey (SBU2215017) [C], Sumit Kumar (SBU2212044), Manish Sahu (SBU2223081), Vikash Mahto (SBU2231012), Rajesh Sen (SBU2218029), Abhishek Oraon (SBU2223063), Sandeep Roy (SBU2215058), Pankaj Verma (SBU2241019), Rohit Topno (SBU2223102), Hemant Tirkey (SBU2212068), Deepak Mahto (SBU2231027)",
                        "remarks": "Thrilling 6-run victory in the 20th over."
                    },
                    {
                        "sport": "Football Championship",
                        "category": "Outdoor Team",
                        "gender": "Boys",
                        "win_team": vish,
                        "winner": "Vishvesvaraya XI (Capt. Vivek Munda)",
                        "winner_enrollment": "SBU2223056",
                        "winner_players": "Vivek Munda (SBU2223056) [C], Ashish Lakra (SBU2223058), Rahul Tirkey (SBU2212042), Sanjay Mahto (SBU2215029), Deepak Kumar (SBU2218018), Rohit Verma (SBU2223084), Sunny Munda (SBU2212061), Vinod Sahu (SBU2231024), Amit Khess (SBU2223095), Suraj Gope (SBU2215051), Alok Bara (SBU2223073)",
                        "metric": "1 — 1 (3 — 2 Penalties)",
                        "run_team": chan,
                        "run_part": "Chanakya XI (Capt. Samuel Murmu)",
                        "run_enrollment": "SBU2212026",
                        "run_players": "Samuel Murmu (SBU2212026) [C], John Kerketta (SBU2223039), David Barla (SBU2215017), Rohit Soren (SBU2218031), Akash Minz (SBU2223078), Sunil Hembrom (SBU2212054), Aman Ekka (SBU2231019), Manish Bhengra (SBU2223101), Pritam Topno (SBU2215044), Joseph Kujur (SBU2251006), Roshan Gari (SBU2223065)",
                        "remarks": "Keeper saved two penalty kicks."
                    },
                    {
                        "sport": "Basketball (Boys)",
                        "category": "Outdoor Team",
                        "gender": "Boys",
                        "win_team": chan,
                        "winner": "Chanakya Cagers (Capt. Gaurav Jha)",
                        "winner_enrollment": "SBU2215062",
                        "winner_players": "Gaurav Jha (SBU2215062) [C], Aman Toppo (SBU2212019), Shubham Raj (SBU2212015), Pranay Das (SBU2223110), Ayush Tiwary (SBU2223093)",
                        "metric": "48 — 42",
                        "run_team": vish,
                        "run_part": "Vishvesvaraya Cagers (Capt. Amit Kumar)",
                        "run_enrollment": "SBU2223034",
                        "run_players": "Amit Kumar (SBU2223034) [C], Gaurav Mishra (SBU2223027), Ayush Sharma (SBU2212046), Roshan Mahto (SBU2215033), Saurabh Singh (SBU2231009)",
                        "remarks": "Fast-break domination in 4th quarter."
                    },
                    {
                        "sport": "Kabaddi Championship",
                        "category": "Traditional",
                        "gender": "Boys",
                        "win_team": chan,
                        "winner": "Chanakya Lions (Capt. Kuldeep Mahto)",
                        "winner_enrollment": "SBU2212037",
                        "winner_players": "Kuldeep Mahto (SBU2212037) [C], Arjun Singh (SBU2223062), Ranjeet Yadav (SBU2215021), Manoj Verma (SBU2218040), Dheeraj Kumar (SBU2231016), Pradeep Soren (SBU2223087), Vicky Pandey (SBU2212059)",
                        "metric": "38 — 31",
                        "run_team": rama,
                        "run_part": "Ramanujan Warriors (Capt. Sunny Tirkey)",
                        "run_enrollment": "SBU2223052",
                        "run_players": "Sunny Tirkey (SBU2223052) [C], Alok Roy (SBU2223014), Rohit Shaw (SBU2212033), Karan Mehta (SBU2215019), Manish Kumar (SBU2231008), Deepak Soren (SBU2212041), Ravi Shankar (SBU2251012)",
                        "remarks": "Super raid on buzzer sealed victory."
                    },
                ]
            },

            # =========================================================================
            # --- 2023 ---
            # =========================================================================
            {
                "year": 2023,
                "edition_title": "SBU UMANG 2023 — 5th Inter-House Sports Championship",
                "theme": "Champions of Character & Athletic Excellence",
                "start_date": datetime.date(2023, 11, 23),
                "end_date": datetime.date(2023, 11, 26),
                "chief_guest": "Prof. (Dr.) B. K. Birla, Chairman Board of Governors",
                "total_athletes": 550,
                "summary": "Celebrating 5 years of UMANG with record student participation. Vishvesvaraya House reclaimed the overall trophy after sweeping volleyball, relay races, and field throwing events.",
                "banner_url": "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
                "champion": vish,
                "runner_up": chan,
                "third": pata,
                "best_boy": "Ritik Sharma (Enrollment No: SBU2323019)",
                "best_girl": "Rhea Sen (Enrollment No: SBU2315054)",
                "fair_play": "Ramanujan House",
                "march_past": "Patanjali House",
                "standings": [
                    {"team": vish, "points": 148, "rank": 1, "gold": 7, "silver": 5, "bronze": 4},
                    {"team": chan, "points": 135, "rank": 2, "gold": 6, "silver": 4, "bronze": 5},
                    {"team": pata, "points": 118, "rank": 3, "gold": 4, "silver": 5, "bronze": 4},
                    {"team": rama, "points": 105, "rank": 4, "gold": 3, "silver": 4, "bronze": 6},
                ],
                "sports": [
                    {
                        "sport": "100m Sprint (Boys)",
                        "category": "Athletics & Track",
                        "gender": "Boys",
                        "win_team": vish,
                        "winner": "Ritik Sharma",
                        "winner_enrollment": "SBU2323019",
                        "winner_players": None,
                        "metric": "10.82s",
                        "run_team": chan,
                        "run_part": "Aman Toppo",
                        "run_enrollment": "SBU2312019",
                        "run_players": None,
                        "remarks": "Campus record time!"
                    },
                    {
                        "sport": "100m Sprint (Girls)",
                        "category": "Athletics & Track",
                        "gender": "Girls",
                        "win_team": pata,
                        "winner": "Rhea Sen",
                        "winner_enrollment": "SBU2315054",
                        "winner_players": None,
                        "metric": "12.74s",
                        "run_team": vish,
                        "run_part": "Priyanka Kumari",
                        "run_enrollment": "SBU2323088",
                        "run_players": None,
                        "remarks": "Blistering stride rhythm over final 30m."
                    },
                    {
                        "sport": "4x100m Relay (Boys)",
                        "category": "Athletics & Track",
                        "gender": "Boys",
                        "win_team": vish,
                        "winner": "Vishvesvaraya Lightning 4",
                        "winner_enrollment": "SBU2323019",
                        "winner_players": "Ritik Sharma (SBU2323019), Vivek Munda (SBU2323056), Gaurav Mishra (SBU2323027), Ashish Lakra (SBU2323058)",
                        "metric": "44.35s",
                        "run_team": chan,
                        "run_part": "Chanakya Express",
                        "run_enrollment": "SBU2312019",
                        "run_players": "Aman Toppo (SBU2312019), Harshvardhan (SBU2323022), Vishal Pandey (SBU2323071), Shubham Raj (SBU2312015)",
                        "remarks": "Flawless baton handovers in zone 2."
                    },
                    {
                        "sport": "Volleyball (Boys)",
                        "category": "Outdoor Team",
                        "gender": "Boys",
                        "win_team": vish,
                        "winner": "Vishvesvaraya Spikers (Capt. Gaurav Mishra)",
                        "winner_enrollment": "SBU2323027",
                        "winner_players": "Gaurav Mishra (SBU2323027) [C], Ritik Sharma (SBU2323019), Ayush Sharma (SBU2312046), Roshan Mahto (SBU2315033), Kunal Sen (SBU2318019), Manish Topno (SBU2323091)",
                        "metric": "3 — 1 Sets (25-22, 23-25, 25-19, 25-20)",
                        "run_team": chan,
                        "run_part": "Chanakya Titans (Capt. Harshvardhan)",
                        "run_enrollment": "SBU2323022",
                        "run_players": "Harshvardhan (SBU2323022) [C], Vishal Pandey (SBU2323071), Aman Toppo (SBU2312019), Shubham Raj (SBU2312015), Aniket Kumar (SBU2315038), Nikhil Singh (SBU2318007)",
                        "remarks": "Aggressive jump-serving controlled the tempo."
                    },
                    {
                        "sport": "Basketball (Girls)",
                        "category": "Outdoor Team",
                        "gender": "Girls",
                        "win_team": pata,
                        "winner": "Patanjali Queens (Capt. Rhea Sen)",
                        "winner_enrollment": "SBU2315054",
                        "winner_players": "Rhea Sen (SBU2315054) [C], Divya Rani (SBU2315034), Ananya Roy (SBU2323041), Shreya Sinha (SBU2312016), Megha Verma (SBU2318025)",
                        "metric": "36 — 29",
                        "run_team": vish,
                        "run_part": "Vishvesvaraya Amazons (Capt. Priyanka Kumari)",
                        "run_enrollment": "SBU2323088",
                        "run_players": "Priyanka Kumari (SBU2323088) [C], Pooja Verma (SBU2318014), Swati Mahto (SBU2312039), Ritu Sahu (SBU2315047), Anjali Beck (SBU2323072)",
                        "remarks": "14 points in the 3rd quarter swing."
                    },
                ]
            },

            # =========================================================================
            # --- 2024 ---
            # =========================================================================
            {
                "year": 2024,
                "edition_title": "SBU UMANG 2024 — Annual Inter-House Championship",
                "theme": "Ignite the Spirit of Athletic Excellence",
                "start_date": datetime.date(2024, 10, 22),
                "end_date": datetime.date(2024, 10, 25),
                "chief_guest": "Dr. Pradeep Kumar Verma, Registrar, SBU Ranchi",
                "total_athletes": 680,
                "summary": "Historic triumph for Patanjali House, claiming their very first UMANG overall championship trophy through monumental victories in traditional sports, racquet games, and middle-distance running.",
                "banner_url": "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80",
                "champion": pata,
                "runner_up": rama,
                "third": vish,
                "best_boy": "Amit Sen (Enrollment No: SBU2423621)",
                "best_girl": "Kavita Tirkey (Enrollment No: SBU2415014)",
                "fair_play": "Vishvesvaraya House",
                "march_past": "Patanjali House",
                "standings": [
                    {"team": pata, "points": 152, "rank": 1, "gold": 8, "silver": 5, "bronze": 3},
                    {"team": rama, "points": 139, "rank": 2, "gold": 6, "silver": 6, "bronze": 4},
                    {"team": vish, "points": 132, "rank": 3, "gold": 5, "silver": 5, "bronze": 5},
                    {"team": chan, "points": 124, "rank": 4, "gold": 4, "silver": 5, "bronze": 6},
                ],
                "sports": [
                    {
                        "sport": "100m Sprint (Boys)",
                        "category": "Athletics & Track",
                        "gender": "Boys",
                        "win_team": pata,
                        "winner": "Amit Sen",
                        "winner_enrollment": "SBU2423621",
                        "winner_players": None,
                        "metric": "10.74s",
                        "run_team": vish,
                        "run_part": "Ritik Sharma",
                        "run_enrollment": "SBU2423019",
                        "run_players": None,
                        "remarks": "Electrifying 0.08s sprint victory."
                    },
                    {
                        "sport": "Cricket Tournament",
                        "category": "Outdoor Team",
                        "gender": "Boys",
                        "win_team": pata,
                        "winner": "Patanjali Strikers (Capt. Ritesh Pandey)",
                        "winner_enrollment": "SBU2423621",
                        "winner_players": "Ritesh Pandey (SBU2423621) [C], Amit Sen (SBU2423621), Sumit Kumar (SBU2412044), Manish Sahu (SBU2423081), Vikash Mahto (SBU2431012), Rajesh Sen (SBU2418029), Abhishek Oraon (SBU2423063), Sandeep Roy (SBU2415058), Pankaj Verma (SBU2441019), Rohit Topno (SBU2423102), Hemant Tirkey (SBU2412068)",
                        "metric": "178/5 vs 174/8",
                        "run_team": chan,
                        "run_part": "Chanakya Warriors (Capt. Harshvardhan)",
                        "run_enrollment": "SBU2423022",
                        "run_players": "Harshvardhan (SBU2423022) [C], Vishal Pandey (SBU2423071), Aman Toppo (SBU2412019), Shubham Raj (SBU2412015), Aniket Kumar (SBU2415038), Nikhil Singh (SBU2418007), Rahul Sen (SBU2441011), Ayush Tiwary (SBU2423093), Gaurav Jha (SBU2415062), Pranay Das (SBU2423110), Kunal Beck (SBU2431031)",
                        "remarks": "Defended 14 runs in the final death over."
                    },
                    {
                        "sport": "Football Championship",
                        "category": "Outdoor Team",
                        "gender": "Boys",
                        "win_team": rama,
                        "winner": "Ramanujan FC (Capt. Alok Roy)",
                        "winner_enrollment": "SBU2423014",
                        "winner_players": "Alok Roy (SBU2423014) [C], Sunny Tirkey (SBU2423052), Rohit Shaw (SBU2412033), Karan Mehta (SBU2415019), Manish Kumar (SBU2431008), Deepak Soren (SBU2412041), Ravi Shankar (SBU2451012), Abhishek Sinha (SBU2423089), Vikash Yadav (SBU2415045), Sandeep Oraon (SBU2418022), Amit Topno (SBU2423104)",
                        "metric": "3 — 1",
                        "run_team": pata,
                        "run_part": "Patanjali United (Capt. Ritesh Pandey)",
                        "run_enrollment": "SBU2423621",
                        "run_players": "Ritesh Pandey (SBU2423621) [C], Amit Sen (SBU2423621), Sumit Kumar (SBU2412044), Manish Sahu (SBU2423081), Vikash Mahto (SBU2431012), Rajesh Sen (SBU2418029), Abhishek Oraon (SBU2423063), Sandeep Roy (SBU2415058), Pankaj Verma (SBU2441019), Rohit Topno (SBU2423102), Hemant Tirkey (SBU2412068)",
                        "remarks": "Dynamic counter-attack football masterclass."
                    },
                    {
                        "sport": "Kabaddi Championship",
                        "category": "Traditional",
                        "gender": "Boys",
                        "win_team": pata,
                        "winner": "Patanjali Yoddhas (Capt. Manish Sahu)",
                        "winner_enrollment": "SBU2423081",
                        "winner_players": "Manish Sahu (SBU2423081) [C], Vikash Mahto (SBU2431012), Rajesh Sen (SBU2418029), Abhishek Oraon (SBU2423063), Sandeep Roy (SBU2415058), Pankaj Verma (SBU2441019), Rohit Topno (SBU2423102)",
                        "metric": "42 — 35",
                        "run_team": chan,
                        "run_part": "Chanakya Lions (Capt. Kuldeep Mahto)",
                        "run_enrollment": "SBU2412037",
                        "run_players": "Kuldeep Mahto (SBU2412037) [C], Arjun Singh (SBU2423062), Ranjeet Yadav (SBU2415021), Manoj Verma (SBU2418040), Dheeraj Kumar (SBU2431016), Pradeep Soren (SBU2423087), Vicky Pandey (SBU2412059)",
                        "remarks": "All-out inflicted in 34th minute."
                    },
                    {
                        "sport": "Table Tennis (Boys Singles)",
                        "category": "Indoor Racket",
                        "gender": "Boys",
                        "win_team": rama,
                        "winner": "Kunal Sharma",
                        "winner_enrollment": "SBU2412007",
                        "winner_players": None,
                        "metric": "3 — 1 (11-9, 11-7, 8-11, 11-6)",
                        "run_team": vish,
                        "run_part": "Aryan Gupta",
                        "run_enrollment": "SBU2423048",
                        "run_players": None,
                        "remarks": "Aggressive forehand topspin winner."
                    },
                ]
            },

            # =========================================================================
            # --- 2025 ---
            # =========================================================================
            {
                "year": 2025,
                "edition_title": "SBU UMANG 2025 — Golden Legacy Sports Championship",
                "theme": "Champions of Character & Athletic Excellence",
                "start_date": datetime.date(2025, 11, 12),
                "end_date": datetime.date(2025, 11, 15),
                "chief_guest": "Dr. Pradeep Kumar Verma (Registrar) & Olympians Panel",
                "total_athletes": 740,
                "summary": "The grandest UMANG spectacle to date with 740 athletes across 13 disciplines. Vishvesvaraya House captured their 2nd overall championship title by setting 3 new university sprint and field records.",
                "banner_url": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=1200&q=80",
                "champion": vish,
                "runner_up": chan,
                "third": pata,
                "best_boy": "Rohan Verma (Enrollment No: SBU2523012)",
                "best_girl": "Tanvi Singh (Enrollment No: SBU2515045)",
                "fair_play": "Chanakya House",
                "march_past": "Vishvesvaraya House",
                "standings": [
                    {"team": vish, "points": 158, "rank": 1, "gold": 9, "silver": 5, "bronze": 3},
                    {"team": chan, "points": 142, "rank": 2, "gold": 6, "silver": 7, "bronze": 4},
                    {"team": pata, "points": 132, "rank": 3, "gold": 5, "silver": 5, "bronze": 6},
                    {"team": rama, "points": 121, "rank": 4, "gold": 4, "silver": 4, "bronze": 6},
                ],
                "sports": [
                    {
                        "sport": "100m Sprint (Boys)",
                        "category": "Athletics & Track",
                        "gender": "Boys",
                        "win_team": vish,
                        "winner": "Rohan Verma",
                        "winner_enrollment": "SBU2523012",
                        "winner_players": None,
                        "metric": "10.65s (New Varsity Record)",
                        "run_team": pata,
                        "run_part": "Amit Sen",
                        "run_enrollment": "SBU2523032",
                        "run_players": None,
                        "remarks": "Broke the 2024 university record by 0.09s."
                    },
                    {
                        "sport": "100m Sprint (Girls)",
                        "category": "Athletics & Track",
                        "gender": "Girls",
                        "win_team": chan,
                        "winner": "Tanvi Singh",
                        "winner_enrollment": "SBU2515045",
                        "winner_players": None,
                        "metric": "12.58s",
                        "run_team": vish,
                        "run_part": "Pooja Verma",
                        "run_enrollment": "SBU2518014",
                        "run_players": None,
                        "remarks": "Fastest female sprint clocking in UMANG history."
                    },
                    {
                        "sport": "Cricket Tournament",
                        "category": "Outdoor Team",
                        "gender": "Boys",
                        "win_team": vish,
                        "winner": "Vishvesvaraya Super Kings (Capt. Rohan Verma)",
                        "winner_enrollment": "SBU2523012",
                        "winner_players": "Rohan Verma (SBU2523012) [C], Gaurav Mishra (SBU2523027), Ritik Sharma (SBU2523019), Ayush Sharma (SBU2512046), Roshan Mahto (SBU2515033), Kunal Sen (SBU2518019), Manish Topno (SBU2523091), Saurabh Singh (SBU2531009), Vivek Munda (SBU2523056), Ashish Lakra (SBU2523058), Sanjay Mahto (SBU2515029)",
                        "metric": "184/3 vs 161/9 (Won by 23 runs)",
                        "run_team": chan,
                        "run_part": "Chanakya Warriors (Capt. Harshvardhan)",
                        "run_enrollment": "SBU2523022",
                        "run_players": "Harshvardhan (SBU2523022) [C], Vishal Pandey (SBU2523071), Aman Toppo (SBU2512019), Shubham Raj (SBU2512015), Aniket Kumar (SBU2515038), Nikhil Singh (SBU2518007), Rahul Sen (SBU2541011), Ayush Tiwary (SBU2523093), Gaurav Jha (SBU2515062), Pranay Das (SBU2523110), Kunal Beck (SBU2531031)",
                        "remarks": "Century partnership for the 2nd wicket."
                    },
                    {
                        "sport": "Football Championship",
                        "category": "Outdoor Team",
                        "gender": "Boys",
                        "win_team": chan,
                        "winner": "Chanakya FC (Capt. Samuel Murmu)",
                        "winner_enrollment": "SBU2512026",
                        "winner_players": "Samuel Murmu (SBU2512026) [C], John Kerketta (SBU2523039), David Barla (SBU2515017), Rohit Soren (SBU2518031), Akash Minz (SBU2523078), Sunil Hembrom (SBU2512054), Aman Ekka (SBU2531019), Manish Bhengra (SBU2523101), Pritam Topno (SBU2515044), Joseph Kujur (SBU2551006), Roshan Gari (SBU2523065)",
                        "metric": "2 — 0",
                        "run_team": vish,
                        "run_part": "Vishvesvaraya United (Capt. Vivek Munda)",
                        "run_enrollment": "SBU2523056",
                        "run_players": "Vivek Munda (SBU2523056) [C], Ashish Lakra (SBU2523058), Rahul Tirkey (SBU2512042), Sanjay Mahto (SBU2515029), Deepak Kumar (SBU2518018), Rohit Verma (SBU2523084), Sunny Munda (SBU2512061), Vinod Sahu (SBU2531024), Amit Khess (SBU2523095), Suraj Gope (SBU2515051), Alok Bara (SBU2523073)",
                        "remarks": "Clean sheet defended by keeper John Kerketta."
                    },
                    {
                        "sport": "Basketball (Boys)",
                        "category": "Outdoor Team",
                        "gender": "Boys",
                        "win_team": chan,
                        "winner": "Chanakya Cagers (Capt. Gaurav Jha)",
                        "winner_enrollment": "SBU2515062",
                        "winner_players": "Gaurav Jha (SBU2515062) [C], Tanvi Singh (SBU2515045), Aman Toppo (SBU2512019), Shubham Raj (SBU2512015), Pranay Das (SBU2523110)",
                        "metric": "54 — 48",
                        "run_team": vish,
                        "run_part": "Vishvesvaraya Cagers (Capt. Rohan Verma)",
                        "run_enrollment": "SBU2523012",
                        "run_players": "Rohan Verma (SBU2523012) [C], Gaurav Mishra (SBU2523027), Ritik Sharma (SBU2523019), Ayush Sharma (SBU2512046), Roshan Mahto (SBU2515033)",
                        "remarks": "Clutch 3-pointer with 18 seconds remaining."
                    },
                    {
                        "sport": "Volleyball (Boys)",
                        "category": "Outdoor Team",
                        "gender": "Boys",
                        "win_team": vish,
                        "winner": "Vishvesvaraya Spikers (Capt. Gaurav Mishra)",
                        "winner_enrollment": "SBU2523027",
                        "winner_players": "Gaurav Mishra (SBU2523027) [C], Rohan Verma (SBU2523012), Ritik Sharma (SBU2523019), Ayush Sharma (SBU2512046), Roshan Mahto (SBU2515033), Kunal Sen (SBU2518019)",
                        "metric": "3 — 0 Sets (25-18, 25-21, 25-16)",
                        "run_team": pata,
                        "run_part": "Patanjali Spikers (Capt. Ritesh Pandey)",
                        "run_enrollment": "SBU2515017",
                        "run_players": "Ritesh Pandey (SBU2515017) [C], Amit Sen (SBU2523032), Sumit Kumar (SBU2512044), Manish Sahu (SBU2523081), Vikash Mahto (SBU2531012), Rajesh Sen (SBU2518029)",
                        "remarks": "Straight-set masterclass."
                    },
                    {
                        "sport": "4x100m Relay (Boys)",
                        "category": "Athletics & Track",
                        "gender": "Boys",
                        "win_team": vish,
                        "winner": "Vishvesvaraya Lightning 4",
                        "winner_enrollment": "SBU2523012",
                        "winner_players": "Rohan Verma (SBU2523012), Ritik Sharma (SBU2523019), Vivek Munda (SBU2523056), Gaurav Mishra (SBU2523027)",
                        "metric": "43.92s (New Varsity Record)",
                        "run_team": chan,
                        "run_part": "Chanakya Express",
                        "run_enrollment": "SBU2512019",
                        "run_players": "Aman Toppo (SBU2512019), Harshvardhan (SBU2523022), Vishal Pandey (SBU2523071), Shubham Raj (SBU2512015)",
                        "remarks": "First relay squad to break the 44-second threshold."
                    },
                    {
                        "sport": "Badminton Singles (Boys)",
                        "category": "Indoor Racket",
                        "gender": "Boys",
                        "win_team": rama,
                        "winner": "Kunal Sharma",
                        "winner_enrollment": "SBU2512007",
                        "winner_players": None,
                        "metric": "21-16, 21-19",
                        "run_team": chan,
                        "run_part": "Ayush Tiwary",
                        "run_enrollment": "SBU2523093",
                        "run_players": None,
                        "remarks": "Rapid baseline smashes."
                    },
                    {
                        "sport": "Shot Put (Boys)",
                        "category": "Athletics & Field",
                        "gender": "Boys",
                        "win_team": pata,
                        "winner": "Vikash Mahto",
                        "winner_enrollment": "SBU2531012",
                        "winner_players": None,
                        "metric": "13.40 meters (Varsity Record)",
                        "run_team": chan,
                        "run_part": "Arjun Singh",
                        "run_enrollment": "SBU2523062",
                        "run_players": None,
                        "remarks": "Clean record-breaking heave in 4th attempt."
                    },
                    {
                        "sport": "Tug of War",
                        "category": "Traditional",
                        "gender": "Boys",
                        "win_team": chan,
                        "winner": "Chanakya Giants (Capt. Arjun Singh)",
                        "winner_enrollment": "SBU2523062",
                        "winner_players": "Arjun Singh (SBU2523062) [C], Kuldeep Mahto (SBU2512037), Ranjeet Yadav (SBU2515021), Manoj Verma (SBU2518040), Dheeraj Kumar (SBU2531016), Pradeep Soren (SBU2523087), Vicky Pandey (SBU2512059), Alok Munda (SBU2551024)",
                        "metric": "2 — 1 Sets",
                        "run_team": pata,
                        "run_part": "Patanjali Squad (Capt. Hemant Kumar)",
                        "run_enrollment": "SBU2523043",
                        "run_players": "Hemant Kumar (SBU2523043) [C], Rajesh Sahu (SBU2512028), Pankaj Sen (SBU2515014), Sandeep Tirkey (SBU2518033), Ramesh Gope (SBU2531021), Santosh Oraon (SBU2523076), Vinay Singh (SBU2512064), Mahesh Verma (SBU2551018)",
                        "remarks": "Epic 4-minute tug battle in the deciding 3rd set."
                    },
                ]
            }
        ]

        for ed_data in editions_payload:
            edition = HistoricalEdition(
                year=ed_data["year"],
                edition_title=ed_data["edition_title"],
                theme=ed_data["theme"],
                start_date=ed_data["start_date"],
                end_date=ed_data["end_date"],
                chief_guest=ed_data["chief_guest"],
                total_athletes=ed_data["total_athletes"],
                summary=ed_data["summary"],
                banner_url=ed_data["banner_url"],
                champion_team_id=ed_data["champion"].id if ed_data["champion"] else None,
                runner_up_team_id=ed_data["runner_up"].id if ed_data["runner_up"] else None,
                third_place_team_id=ed_data["third"].id if ed_data["third"] else None,
                best_athlete_boys=ed_data["best_boy"],
                best_athlete_girls=ed_data["best_girl"],
                fair_play_house=ed_data["fair_play"],
                march_past_winner=ed_data["march_past"],
                is_published=True,
                version=1
            )
            db.add(edition)
            db.commit()
            db.refresh(edition)

            for st in ed_data["standings"]:
                standing = YearlyHouseStanding(
                    edition_id=edition.id,
                    team_id=st["team"].id if st["team"] else None,
                    team_name=st["team"].name,
                    team_code=st["team"].code,
                    color=st["team"].color,
                    total_points=st["points"],
                    rank=st["rank"],
                    gold_medals=st["gold"],
                    silver_medals=st["silver"],
                    bronze_medals=st["bronze"]
                )
                db.add(standing)

            for sp in ed_data["sports"]:
                rec = HistoricalSportRecord(
                    edition_id=edition.id,
                    sport_name=sp["sport"],
                    category=sp["category"],
                    gender=sp["gender"],
                    winner_team_id=sp["win_team"].id if sp.get("win_team") else None,
                    winner_team_name=sp["win_team"].name if sp.get("win_team") else None,
                    winner_participant=sp.get("winner"),
                    winner_enrollment_no=sp.get("winner_enrollment"),
                    winner_players=sp.get("winner_players"),
                    winner_metric=sp.get("metric"),
                    runner_up_team_id=sp["run_team"].id if sp.get("run_team") else None,
                    runner_up_team_name=sp["run_team"].name if sp.get("run_team") else None,
                    runner_up_participant=sp.get("run_part"),
                    runner_up_enrollment_no=sp.get("run_enrollment"),
                    runner_up_players=sp.get("run_players"),
                    remarks=sp.get("remarks")
                )
                db.add(rec)

            db.commit()
            print(f"[Seed Archives] Successfully seeded UMANG {ed_data['year']} with enrollment numbers and squads.")

        print("[Seed Archives] All 5 past years (2021-2025) historical records seeded successfully with enrollment details.")

    finally:
        if should_close:
            db.close()


if __name__ == "__main__":
    seed_historical_archives(force=True)
