import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.app.database.session import Base


class Sport(Base):
    __tablename__ = "sports"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, index=True, nullable=False)
    slug = Column(String(180), unique=True, index=True, nullable=False)
    category = Column(String(100), index=True, nullable=False)  # Outdoor, Indoor, Athletics, Combat, Traditional
    gender = Column(String(50), default="Boys", nullable=False)  # Boys, Girls, Mixed
    sport_type = Column(String(50), default="Match-based", nullable=False)  # Match-based, Individual, Time-based, Distance-based, Position-based
    venue_id = Column(Integer, ForeignKey("venues.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="Upcoming", nullable=False)  # Upcoming, Ongoing, Completed
    description = Column(Text, nullable=True)
    banner_url = Column(String(500), nullable=True)
    rules = Column(Text, nullable=True)
    scoring_format = Column(String(100), default="Points", nullable=False)  # Points, Goals, Runs/Wickets, Time (s), Distance (m), Sets
    registration_form_url = Column(String(500), nullable=True)
    version = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationships
    venue = relationship("Venue")
    matches = relationship("Event", back_populates="sport")
    registration_forms = relationship("RegistrationForm", back_populates="sport")
