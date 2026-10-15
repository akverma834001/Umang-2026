import datetime
from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.app.database.session import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(220), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), index=True, nullable=False)  # Outdoor, Indoor, Athletics, Combat, Traditional
    
    # Sports Meet fields
    sport_id = Column(Integer, ForeignKey("sports.id", ondelete="SET NULL"), nullable=True, index=True)
    gender = Column(String(50), default="Boys", nullable=False)  # Boys, Girls, Mixed
    event_type = Column(String(50), default="Match-based", nullable=False)  # Match-based, Individual, Time-based, Distance-based, Position-based
    round = Column(String(100), nullable=True)  # Round 1, Quarter-Final, Semi-Final, Final, Heats
    stage = Column(String(100), nullable=True)  # Group Stage, Knockout, Finals
    
    # House/Team matchups
    team_a_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    team_b_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    score_a = Column(String(50), nullable=True)  # e.g., "32", "145/4"
    score_b = Column(String(50), nullable=True)  # e.g., "28", "142/8"
    winner_team_id = Column(Integer, ForeignKey("teams.id", ondelete="SET NULL"), nullable=True)
    
    venue_id = Column(Integer, ForeignKey("venues.id", ondelete="SET NULL"), nullable=True)
    event_date = Column(Date, nullable=False, index=True)
    start_time = Column(String(10), nullable=False)  # "10:00"
    end_time = Column(String(10), nullable=False)    # "12:30"
    banner_url = Column(String(500), nullable=True)
    rules = Column(Text, nullable=True)
    status = Column(String(20), default="UPCOMING", nullable=False)  # UPCOMING, LIVE, COMPLETED, CANCELLED
    published_state = Column(String(20), default="DRAFT", index=True, nullable=False)  # DRAFT, PUBLISHED, ARCHIVED
    
    # Live match dynamic attributes
    live_score = Column(String(255), nullable=True)  # Composite score e.g. "32 — 28"
    live_round = Column(String(100), nullable=True)
    live_stage = Column(String(100), nullable=True)
    live_status_detail = Column(String(100), nullable=True)  # Quarter 3, 2nd Half, Final Over
    live_notes = Column(Text, nullable=True)
    
    # Optimistic locking version
    version = Column(Integer, default=1, nullable=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationships
    venue = relationship("Venue", back_populates="events")
    sport = relationship("Sport", back_populates="matches")
    team_a = relationship("Team", foreign_keys=[team_a_id])
    team_b = relationship("Team", foreign_keys=[team_b_id])
    winner_team = relationship("Team", foreign_keys=[winner_team_id])
    results = relationship("Result", back_populates="event", cascade="all, delete-orphan")
    registration_forms = relationship("RegistrationForm", back_populates="event")
