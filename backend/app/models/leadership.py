from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from backend.app.database.session import Base

class LeadershipMember(Base):
    __tablename__ = "leadership_members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    designation = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False, default="executive")  # 'executive' or 'sports'
    bio = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    display_order = Column(Integer, default=0, index=True)
    is_active = Column(Boolean, default=True, index=True)
    contact_email = Column(String(200), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
