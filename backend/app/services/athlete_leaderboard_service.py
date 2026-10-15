import re
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.result import Result
from backend.app.models.event import Event
from backend.app.models.historical_edition import HistoricalEdition, HistoricalSportRecord
from backend.app.models.team import Team
from backend.app.schemas import (
    BestAthleteOut,
    AthleteEventParticipation,
    BestAthletesLeaderboardResponse
)


def parse_player_squad(raw_str: Optional[str]) -> List[Dict[str, str]]:
    """
    Parses squad roster string e.g.
    'Rahul Kumar (SBU2423621) [C], Amit Sen (SBU2423622), Sumit Kumar (SBU2412044)'
    Returns list of dicts with name, enrollment, and tag/role.
    """
    if not raw_str:
        return []
    players = []
    for item in re.split(r"[,;\n]", raw_str):
        item = item.strip()
        if not item:
            continue
        m = re.search(r"^(.*?)\s*\((?:(?:Enrollment\s*(?:No\.?)?|Enr\.?)\s*:\s*)?([A-Za-z0-9/_-]+)\)(.*)$", item, re.I)
        if m:
            players.append({
                "name": m.group(1).strip(),
                "enrollment": m.group(2).strip().upper(),
                "tag": m.group(3).strip()
            })
        else:
            m2 = re.search(r"\b(SBU[0-9A-Z]+)\b", item, re.I)
            if m2:
                players.append({
                    "name": item.replace(m2.group(1), "").strip(" ()[]"),
                    "enrollment": m2.group(1).upper(),
                    "tag": ""
                })
    return players


def get_team_map(db: Session) -> Dict[str, Dict[str, str]]:
    teams = db.query(Team).all()
    mapping = {}
    for t in teams:
        mapping[t.name.lower()] = {
            "name": t.name,
            "code": t.code,
            "color": t.color
        }
        mapping[t.code.lower()] = {
            "name": t.name,
            "code": t.code,
            "color": t.color
        }
    return mapping


def calculate_best_athletes_leaderboard(
    db: Session,
    year: Optional[int] = None,
    limit: int = 5
) -> BestAthletesLeaderboardResponse:
    """
    Calculates individual athlete scores combining solo events and team events,
    referenced strictly by student Enrollment Number.
    Returns exactly the top N (defaults to 5) individual athletes with podium highlighting.
    """
    team_map = get_team_map(db)

    # Available historical editions
    editions = (
        db.query(HistoricalEdition)
        .filter(HistoricalEdition.is_published == True)
        .order_by(HistoricalEdition.year.desc())
        .all()
    )
    available_years = [ed.year for ed in editions]
    # UMANG 2026 is current live year
    if 2026 not in available_years:
        available_years = [2026] + available_years

    # Check if live results exist
    live_results = (
        db.query(Result)
        .filter(Result.published_state == "PUBLISHED")
        .order_by(Result.created_at.desc())
        .all()
    )

    is_live = False
    target_year = year
    edition_label = ""

    # Decide whether to query live results or a historical edition
    if year == 2026 or (year is None and len(live_results) > 0):
        is_live = True
        target_year = 2026
        edition_label = "UMANG 2026 — Live Competition Standings"
    else:
        is_live = False
        if year is None:
            # Fall back to most recent historical edition
            target_year = available_years[1] if len(available_years) > 1 else (editions[0].year if editions else 2025)
        ed_obj = next((e for e in editions if e.year == target_year), None)
        if ed_obj:
            edition_label = f"UMANG {ed_obj.year} — {ed_obj.edition_title}"
        else:
            edition_label = f"UMANG {target_year} Championship"

    athletes: Dict[str, Dict[str, Any]] = {}

    if is_live:
        # Evaluate from published Result rows
        for res in live_results:
            sport_name = res.event.title if res.event else f"Event #{res.event_id}"
            category = res.category or (res.event.category if res.event else "Championship")
            w_team_name = res.winner_team.name if res.winner_team else getattr(res, "winner_team_name", None) or "Independent"
            r_team_name = res.runner_up_team.name if res.runner_up_team else getattr(res, "runner_up_team_name", None) or "Independent"
            t_team_name = res.third_place_team.name if res.third_place_team else getattr(res, "third_place_team_name", None) or "Independent"

            is_team_sport = bool(res.winner_players or res.runner_up_players or res.third_place_players)

            if not is_team_sport:
                # Solo Winner
                if res.winner_enrollment_no:
                    enr = res.winner_enrollment_no.strip().upper()
                    if enr not in athletes:
                        t_meta = team_map.get(w_team_name.lower(), {})
                        athletes[enr] = {
                            "name": res.winner_participant or "Student Athlete",
                            "enrollment_no": enr,
                            "team_name": w_team_name,
                            "team_code": t_meta.get("code", "SBU"),
                            "team_color": t_meta.get("color", "#F59E0B"),
                            "solo_points": 0,
                            "team_points": 0,
                            "gold_medals": 0,
                            "silver_medals": 0,
                            "bronze_medals": 0,
                            "events": []
                        }
                    pts = res.winner_points or 10
                    athletes[enr]["solo_points"] += pts
                    athletes[enr]["gold_medals"] += 1
                    athletes[enr]["events"].append(AthleteEventParticipation(
                        sport_name=sport_name,
                        category=category,
                        event_type="Solo",
                        position="1st (Gold)",
                        points=pts,
                        metric=res.winner_metric
                    ))

                # Solo Runner-up
                if res.runner_up_enrollment_no:
                    enr = res.runner_up_enrollment_no.strip().upper()
                    if enr not in athletes:
                        t_meta = team_map.get(r_team_name.lower(), {})
                        athletes[enr] = {
                            "name": res.runner_up_participant or "Student Athlete",
                            "enrollment_no": enr,
                            "team_name": r_team_name,
                            "team_code": t_meta.get("code", "SBU"),
                            "team_color": t_meta.get("color", "#6B7280"),
                            "solo_points": 0,
                            "team_points": 0,
                            "gold_medals": 0,
                            "silver_medals": 0,
                            "bronze_medals": 0,
                            "events": []
                        }
                    pts = res.runner_up_points or 7
                    athletes[enr]["solo_points"] += pts
                    athletes[enr]["silver_medals"] += 1
                    athletes[enr]["events"].append(AthleteEventParticipation(
                        sport_name=sport_name,
                        category=category,
                        event_type="Solo",
                        position="2nd (Silver)",
                        points=pts,
                        metric=res.runner_up_metric
                    ))

                # Solo 3rd Place
                if res.third_place_enrollment_no:
                    enr = res.third_place_enrollment_no.strip().upper()
                    if enr not in athletes:
                        t_meta = team_map.get(t_team_name.lower(), {})
                        athletes[enr] = {
                            "name": res.third_place_participant or "Student Athlete",
                            "enrollment_no": enr,
                            "team_name": t_team_name,
                            "team_code": t_meta.get("code", "SBU"),
                            "team_color": t_meta.get("color", "#D97706"),
                            "solo_points": 0,
                            "team_points": 0,
                            "gold_medals": 0,
                            "silver_medals": 0,
                            "bronze_medals": 0,
                            "events": []
                        }
                    pts = res.third_place_points or 5
                    athletes[enr]["solo_points"] += pts
                    athletes[enr]["bronze_medals"] += 1
                    athletes[enr]["events"].append(AthleteEventParticipation(
                        sport_name=sport_name,
                        category=category,
                        event_type="Solo",
                        position="3rd (Bronze)",
                        points=pts,
                        metric=res.third_place_metric
                    ))
            else:
                # Team Sport Rosters
                if res.winner_players:
                    for p in parse_player_squad(res.winner_players):
                        enr = p["enrollment"]
                        if not enr:
                            continue
                        if enr not in athletes:
                            t_meta = team_map.get(w_team_name.lower(), {})
                            athletes[enr] = {
                                "name": p["name"],
                                "enrollment_no": enr,
                                "team_name": w_team_name,
                                "team_code": t_meta.get("code", "SBU"),
                                "team_color": t_meta.get("color", "#F59E0B"),
                                "solo_points": 0,
                                "team_points": 0,
                                "gold_medals": 0,
                                "silver_medals": 0,
                                "bronze_medals": 0,
                                "events": []
                            }
                        pts = res.winner_points or 10
                        athletes[enr]["team_points"] += pts
                        athletes[enr]["gold_medals"] += 1
                        athletes[enr]["events"].append(AthleteEventParticipation(
                            sport_name=sport_name,
                            category=category,
                            event_type="Team",
                            position="1st (Gold)",
                            points=pts,
                            role=p["tag"] or "Player",
                            metric=res.winner_metric
                        ))

                if res.runner_up_players:
                    for p in parse_player_squad(res.runner_up_players):
                        enr = p["enrollment"]
                        if not enr:
                            continue
                        if enr not in athletes:
                            t_meta = team_map.get(r_team_name.lower(), {})
                            athletes[enr] = {
                                "name": p["name"],
                                "enrollment_no": enr,
                                "team_name": r_team_name,
                                "team_code": t_meta.get("code", "SBU"),
                                "team_color": t_meta.get("color", "#6B7280"),
                                "solo_points": 0,
                                "team_points": 0,
                                "gold_medals": 0,
                                "silver_medals": 0,
                                "bronze_medals": 0,
                                "events": []
                            }
                        pts = res.runner_up_points or 7
                        athletes[enr]["team_points"] += pts
                        athletes[enr]["silver_medals"] += 1
                        athletes[enr]["events"].append(AthleteEventParticipation(
                            sport_name=sport_name,
                            category=category,
                            event_type="Team",
                            position="2nd (Silver)",
                            points=pts,
                            role=p["tag"] or "Player",
                            metric=res.runner_up_metric
                        ))

                if res.third_place_players:
                    for p in parse_player_squad(res.third_place_players):
                        enr = p["enrollment"]
                        if not enr:
                            continue
                        if enr not in athletes:
                            t_meta = team_map.get(t_team_name.lower(), {})
                            athletes[enr] = {
                                "name": p["name"],
                                "enrollment_no": enr,
                                "team_name": t_team_name,
                                "team_code": t_meta.get("code", "SBU"),
                                "team_color": t_meta.get("color", "#D97706"),
                                "solo_points": 0,
                                "team_points": 0,
                                "gold_medals": 0,
                                "silver_medals": 0,
                                "bronze_medals": 0,
                                "events": []
                            }
                        pts = res.third_place_points or 5
                        athletes[enr]["team_points"] += pts
                        athletes[enr]["bronze_medals"] += 1
                        athletes[enr]["events"].append(AthleteEventParticipation(
                            sport_name=sport_name,
                            category=category,
                            event_type="Team",
                            position="3rd (Bronze)",
                            points=pts,
                            role=p["tag"] or "Player",
                            metric=res.third_place_metric
                        ))

    else:
        # Evaluate from historical edition
        ed_obj = db.query(HistoricalEdition).filter(HistoricalEdition.year == target_year).first()
        if ed_obj:
            WIN_PTS = 10
            RUN_PTS = 7

            for sp in ed_obj.sports_records:
                is_team_sport = bool(sp.winner_players or sp.runner_up_players)

                if not is_team_sport:
                    # Solo Winner
                    if sp.winner_enrollment_no:
                        enr = sp.winner_enrollment_no.strip().upper()
                        w_team = sp.winner_team_name or "Independent"
                        if enr not in athletes:
                            t_meta = team_map.get(w_team.lower(), {})
                            athletes[enr] = {
                                "name": sp.winner_participant or "Student Athlete",
                                "enrollment_no": enr,
                                "team_name": w_team,
                                "team_code": t_meta.get("code", "SBU"),
                                "team_color": t_meta.get("color", "#F59E0B"),
                                "solo_points": 0,
                                "team_points": 0,
                                "gold_medals": 0,
                                "silver_medals": 0,
                                "bronze_medals": 0,
                                "events": []
                            }
                        athletes[enr]["solo_points"] += WIN_PTS
                        athletes[enr]["gold_medals"] += 1
                        athletes[enr]["events"].append(AthleteEventParticipation(
                            sport_name=sp.sport_name,
                            category=sp.category,
                            event_type="Solo",
                            position="1st (Gold)",
                            points=WIN_PTS,
                            metric=sp.winner_metric
                        ))

                    # Solo Runner-up
                    if sp.runner_up_enrollment_no:
                        enr = sp.runner_up_enrollment_no.strip().upper()
                        r_team = sp.runner_up_team_name or "Independent"
                        if enr not in athletes:
                            t_meta = team_map.get(r_team.lower(), {})
                            athletes[enr] = {
                                "name": sp.runner_up_participant or "Student Athlete",
                                "enrollment_no": enr,
                                "team_name": r_team,
                                "team_code": t_meta.get("code", "SBU"),
                                "team_color": t_meta.get("color", "#6B7280"),
                                "solo_points": 0,
                                "team_points": 0,
                                "gold_medals": 0,
                                "silver_medals": 0,
                                "bronze_medals": 0,
                                "events": []
                            }
                        athletes[enr]["solo_points"] += RUN_PTS
                        athletes[enr]["silver_medals"] += 1
                        athletes[enr]["events"].append(AthleteEventParticipation(
                            sport_name=sp.sport_name,
                            category=sp.category,
                            event_type="Solo",
                            position="2nd (Silver)",
                            points=RUN_PTS
                        ))

                else:
                    # Team Sport Squads
                    w_team = sp.winner_team_name or "Independent"
                    r_team = sp.runner_up_team_name or "Independent"

                    if sp.winner_players:
                        for p in parse_player_squad(sp.winner_players):
                            enr = p["enrollment"]
                            if not enr:
                                continue
                            if enr not in athletes:
                                t_meta = team_map.get(w_team.lower(), {})
                                athletes[enr] = {
                                    "name": p["name"],
                                    "enrollment_no": enr,
                                    "team_name": w_team,
                                    "team_code": t_meta.get("code", "SBU"),
                                    "team_color": t_meta.get("color", "#F59E0B"),
                                    "solo_points": 0,
                                    "team_points": 0,
                                    "gold_medals": 0,
                                    "silver_medals": 0,
                                    "bronze_medals": 0,
                                    "events": []
                                }
                            athletes[enr]["team_points"] += WIN_PTS
                            athletes[enr]["gold_medals"] += 1
                            athletes[enr]["events"].append(AthleteEventParticipation(
                                sport_name=sp.sport_name,
                                category=sp.category,
                                event_type="Team",
                                position="1st (Gold)",
                                points=WIN_PTS,
                                role=p["tag"] or "Player",
                                metric=sp.winner_metric
                            ))

                    if sp.runner_up_players:
                        for p in parse_player_squad(sp.runner_up_players):
                            enr = p["enrollment"]
                            if not enr:
                                continue
                            if enr not in athletes:
                                t_meta = team_map.get(r_team.lower(), {})
                                athletes[enr] = {
                                    "name": p["name"],
                                    "enrollment_no": enr,
                                    "team_name": r_team,
                                    "team_code": t_meta.get("code", "SBU"),
                                    "team_color": t_meta.get("color", "#6B7280"),
                                    "solo_points": 0,
                                    "team_points": 0,
                                    "gold_medals": 0,
                                    "silver_medals": 0,
                                    "bronze_medals": 0,
                                    "events": []
                                }
                            athletes[enr]["team_points"] += RUN_PTS
                            athletes[enr]["silver_medals"] += 1
                            athletes[enr]["events"].append(AthleteEventParticipation(
                                sport_name=sp.sport_name,
                                category=sp.category,
                                event_type="Team",
                                position="2nd (Silver)",
                                points=RUN_PTS,
                                role=p["tag"] or "Player"
                            ))

    # Compute totals and sort athletes
    athlete_list: List[Dict[str, Any]] = []
    for ath in athletes.values():
        total_pts = ath["solo_points"] + ath["team_points"]
        total_medals = ath["gold_medals"] + ath["silver_medals"] + ath["bronze_medals"]
        athlete_list.append({
            **ath,
            "total_points": total_pts,
            "total_medals": total_medals,
            "events_count": len(ath["events"])
        })

    # Sort: Total Points DESC > Gold Medals DESC > Silver Medals DESC > Total Medals DESC > Name ASC
    sorted_athletes = sorted(
        athlete_list,
        key=lambda x: (
            -x["total_points"],
            -x["gold_medals"],
            -x["silver_medals"],
            -x["total_medals"],
            x["name"].lower()
        )
    )

    # Reflect only the top N (5) individual athletes
    top_athletes_out: List[BestAthleteOut] = []
    for idx, ath in enumerate(sorted_athletes[:limit]):
        top_athletes_out.append(BestAthleteOut(
            rank=idx + 1,
            name=ath["name"],
            enrollment_no=ath["enrollment_no"],
            team_name=ath["team_name"],
            team_code=ath["team_code"],
            team_color=ath["team_color"],
            total_points=ath["total_points"],
            solo_points=ath["solo_points"],
            team_points=ath["team_points"],
            gold_medals=ath["gold_medals"],
            silver_medals=ath["silver_medals"],
            bronze_medals=ath["bronze_medals"],
            total_medals=ath["total_medals"],
            events_count=ath["events_count"],
            events=ath["events"]
        ))

    return BestAthletesLeaderboardResponse(
        edition_label=edition_label,
        year=target_year,
        is_live=is_live,
        available_years=available_years,
        top_athletes=top_athletes_out
    )
