import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from backend.app.database.session import Base


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), default="GENERAL", index=True, nullable=False)  # IMPORTANT, GENERAL, SCHEDULE_UPDATE, RESULT, NOTICE
    priority = Column(String(20), default="MEDIUM", index=True, nullable=False)   # HIGH, MEDIUM, LOW
    image_url = Column(String(500), nullable=True)
    published_state = Column(String(20), default="DRAFT", index=True, nullable=False)  # DRAFT, PUBLISHED, ARCHIVED
    published_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    version = Column(Integer, default=1, nullable=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)
