import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.app.database.session import Base


class RegistrationForm(Base):
    __tablename__ = "registration_forms"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    sport_id = Column(Integer, ForeignKey("sports.id", ondelete="SET NULL"), nullable=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="SET NULL"), nullable=True, index=True)
    category = Column(String(100), default="Outdoor Team", nullable=False)
    gender = Column(String(50), default="Boys", nullable=False)  # Boys, Girls, Mixed
    google_form_url = Column(String(500), nullable=False)
    banner_url = Column(String(500), nullable=True)
    
    opening_date = Column(DateTime, nullable=False)
    closing_date = Column(DateTime, nullable=False)
    
    status = Column(String(20), default="UPCOMING", nullable=False)  # UPCOMING, OPEN, CLOSING_SOON, CLOSED
    published_state = Column(String(20), default="DRAFT", index=True, nullable=False)  # DRAFT, PUBLISHED, ARCHIVED
    version = Column(Integer, default=1, nullable=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)

    # Relationships
    sport = relationship("Sport", back_populates="registration_forms")
    event = relationship("Event", back_populates="registration_forms")
