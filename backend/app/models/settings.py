import datetime
from sqlalchemy import Column, Integer, String, Text, Date, DateTime
from backend.app.database.session import Base


class WebsiteSettings(Base):
    __tablename__ = "website_settings"

    id = Column(Integer, primary_key=True, index=True)
    university_name = Column(String(200), default="Sarala Birla University, Ranchi", nullable=False)
    university_short_name = Column(String(50), default="SBU Ranchi", nullable=False)
    logo_url = Column(String(500), nullable=True)
    location = Column(String(255), default="Birla Knowledge City, PO Mahilong, Purulia Road, Ranchi, Jharkhand - 835103", nullable=False)
    contact_email = Column(String(100), default="sports@sbu.ac.in", nullable=False)
    contact_phone = Column(String(50), default="+91-9525110012", nullable=False)
    
    fest_name = Column(String(150), default="SBU UMANG — Annual Sports Meet", nullable=False)
    fest_tagline = Column(String(255), default="Annual Inter-House Sports Championship | Sarala Birla University, Ranchi", nullable=False)
    fest_start_date = Column(Date, nullable=True)
    fest_end_date = Column(Date, nullable=True)
    hero_image_url = Column(String(500), nullable=True)
    
    # Leaderboard Point System (Configurable by Admin)
    points_first_place = Column(Integer, default=10, nullable=False)
    points_second_place = Column(Integer, default=7, nullable=False)
    points_third_place = Column(Integer, default=5, nullable=False)

    # Branding Colors (Dynamic Institution Theming)
    primary_color = Column(String(20), default="#800000", nullable=False)     # SBU Crimson / Maroon
    secondary_color = Column(String(20), default="#1B2A4A", nullable=False)   # Deep Academic Navy
    accent_color = Column(String(20), default="#E2A93B", nullable=False)      # Heritage Gold
    
    # Social Media
    website_url = Column(String(255), default="https://sbu.ac.in", nullable=False)
    instagram_url = Column(String(255), nullable=True)
    facebook_url = Column(String(255), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    youtube_url = Column(String(255), nullable=True)
    
    # Footer
    footer_text = Column(Text, default="Sarala Birla University is established under the Sarala Birla University Act, 2017 (Jharkhand Act. No. 13, 2017). Department of Physical Education and Sports.", nullable=True)
    copyright_text = Column(String(255), default="© 2026 Sarala Birla University, Ranchi. All rights reserved.", nullable=False)
    
    version = Column(Integer, default=1, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow, nullable=False)
