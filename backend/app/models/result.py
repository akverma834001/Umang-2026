import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from backend.app.database.session import Base


class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(100), default="Main", nullable=False)
    
    # 1st Place / Winner
    winner_team_id = Column(Integer, ForeignKey("teams.id", ondelete="RESTRICT"), nullable=False)
    winner_points = Column(Integer, default=10, nullable=False)
    winner_participant = Column(String(150), nullable=True)  # Individual athlete or team captain
    winner_enrollment_no = Column(String(100), nullable=True)  # SBU Enrollment No.
    winner_players = Column(Text, nullable=True)             # Team squad: list of player names & enrollment numbers
    winner_metric = Column(String(100), nullable=True)       # Score/Time/Distance e.g. "10.45s", "14.2m", "32-28"
    
    # 2nd Place / Runner-up
    runner_up_team_id = Column(Integer, ForeignKey("teams.id", ondelete="RESTRICT"), nullable=True)
    runner_up_points = Column(Integer, default=7, nullable=False)
    runner_up_participant = Column(String(150), nullable=True)
    runner_up_enrollment_no = Column(String(100), nullable=True)
    runner_up_players = Column(Text, nullable=True)
    runner_up_metric = Column(String(100), nullable=True)
    
    # 3rd Place
    third_place_team_id = Column(Integer, ForeignKey("teams.id", ondelete="RESTRICT"), nullable=True)
    third_place_points = Column(Integer, default=5, nullable=False)
    third_place_participant = Column(String(150), nullable=True)
    third_place_enrollment_no = Column(String(100), nullable=True)
    third_place_players = Column(Text, nullable=True)
    third_place_metric = Column(String(100), nullable=True)
    
    remarks = Column(Text, nullable=True)
    published_state = Column(String(20), default="DRAFT", index=True, nullable=False)  # DRAFT, PUBLISHED, ARCHIVED
    version = Column(Integer, default=1, nullable=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("event_id", "category", name="uq_result_event_category"),
    )

    # Relationships
    event = relationship("Event", back_populates="results")
    winner_team = relationship("Team", foreign_keys=[winner_team_id])
    runner_up_team = relationship("Team", foreign_keys=[runner_up_team_id])
    third_place_team = relationship("Team", foreign_keys=[third_place_team_id])
    ledger_entries = relationship("PointLedger", back_populates="result", cascade="all, delete-orphan")
