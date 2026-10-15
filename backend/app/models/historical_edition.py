import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.session import Base


class HistoricalEdition(Base):
    __tablename__ = "historical_editions"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, unique=True, index=True, nullable=False)
    edition_title = Column(String(200), nullable=False)
    theme = Column(String(200), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    chief_guest = Column(String(200), nullable=True)
    total_athletes = Column(Integer, default=0, nullable=False)
    summary = Column(Text, nullable=True)
    banner_url = Column(String(500), nullable=True)

    # Trophy winners
    champion_team_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    runner_up_team_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    third_place_team_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)

    # Special accolades
    best_athlete_boys = Column(String(150), nullable=True)
    best_athlete_girls = Column(String(150), nullable=True)
    fair_play_house = Column(String(100), nullable=True)
    march_past_winner = Column(String(100), nullable=True)

    is_published = Column(Boolean, default=True, nullable=False)
    version = Column(Integer, default=1, nullable=False)

    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationships
    champion_team = relationship("Team", foreign_keys=[champion_team_id])
    runner_up_team = relationship("Team", foreign_keys=[runner_up_team_id])
    third_place_team = relationship("Team", foreign_keys=[third_place_team_id])

    standings = relationship("YearlyHouseStanding", back_populates="edition", cascade="all, delete-orphan", order_by="YearlyHouseStanding.rank.asc()")
    sports_records = relationship("HistoricalSportRecord", back_populates="edition", cascade="all, delete-orphan", order_by="HistoricalSportRecord.sport_name.asc()")


class YearlyHouseStanding(Base):
    __tablename__ = "yearly_house_standings"

    id = Column(Integer, primary_key=True, index=True)
    edition_id = Column(Integer, ForeignKey("historical_editions.id", ondelete="CASCADE"), nullable=False, index=True)
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    team_name = Column(String(100), nullable=False)
    team_code = Column(String(20), nullable=False)
    color = Column(String(30), default="#800000", nullable=False)
    total_points = Column(Integer, default=0, nullable=False)
    rank = Column(Integer, default=1, nullable=False)
    gold_medals = Column(Integer, default=0, nullable=False)
    silver_medals = Column(Integer, default=0, nullable=False)
    bronze_medals = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    edition = relationship("HistoricalEdition", back_populates="standings")
    team = relationship("Team")


class HistoricalSportRecord(Base):
    __tablename__ = "historical_sport_records"

    id = Column(Integer, primary_key=True, index=True)
    edition_id = Column(Integer, ForeignKey("historical_editions.id", ondelete="CASCADE"), nullable=False, index=True)
    sport_name = Column(String(150), nullable=False)
    category = Column(String(100), default="Outdoor Team", nullable=False)  # Outdoor Team, Athletics & Track, Indoor Racket, Traditional, Mind Sports
    gender = Column(String(50), default="Boys", nullable=False)

    winner_team_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    winner_team_name = Column(String(100), nullable=True)
    winner_participant = Column(String(150), nullable=True)
    winner_enrollment_no = Column(String(100), nullable=True)  # SBU Enrollment No. of winner / captain
    winner_players = Column(Text, nullable=True)               # Team squad: list of player names & enrollment numbers
    winner_metric = Column(String(100), nullable=True)         # e.g., "10.68s", "14.2m", "3-1 sets"

    runner_up_team_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    runner_up_team_name = Column(String(100), nullable=True)
    runner_up_participant = Column(String(150), nullable=True)
    runner_up_enrollment_no = Column(String(100), nullable=True)
    runner_up_players = Column(Text, nullable=True)

    remarks = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    edition = relationship("HistoricalEdition", back_populates="sports_records")
    winner_team = relationship("Team", foreign_keys=[winner_team_id])
    runner_up_team = relationship("Team", foreign_keys=[runner_up_team_id])
