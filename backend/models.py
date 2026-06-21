from sqlalchemy import Column, String, Integer, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(50), primary_key=True, default=generate_uuid)
    username = Column(String(50), unique=True, index=True)
    full_name = Column(String(100))
    track = Column(String(20), default="ICSE9")
    role = Column(String(20), default="student")
    total_xp = Column(Integer, default=0)
    level = Column(Integer, default=1)
    current_streak = Column(Integer, default=1)
    longest_streak = Column(Integer, default=1)
    last_active_date = Column(String(20), nullable=True)

    activities = relationship("UserActivity", back_populates="profile", cascade="all, delete-orphan")

class UserActivity(Base):
    __tablename__ = "user_activities"

    id = Column(String(50), primary_key=True, default=generate_uuid)
    user_id = Column(String(50), ForeignKey("profiles.id", ondelete="CASCADE"))
    activityType = Column(String(50))
    displayName = Column(String(200))
    xpEarned = Column(Integer)
    createdAt = Column(String(50)) # ISO string
    activity_metadata = Column(JSON, nullable=True)

    profile = relationship("Profile", back_populates="activities")

class Question(Base):
    __tablename__ = "questions"

    id = Column(String(50), primary_key=True, default=generate_uuid)
    track = Column(String(20)) # ICSE9, ICSE10, APCSA
    chapter_title = Column(String(100))
    type = Column(String(50)) # type_confusion, predict_output, bug_fix, flashcard, etc.
    content = Column(JSON) # MCQ options, etc.
    correct_answer = Column(String(200))
    explanation = Column(Text, nullable=True)

class Trace(Base):
    __tablename__ = "traces"

    id = Column(String(50), primary_key=True, default=generate_uuid)
    question_id = Column(String(50), ForeignKey("questions.id", ondelete="CASCADE"), nullable=True)
    code = Column(Text)
    steps = Column(JSON) # Steps list containing variables and output state
    final_output = Column(Text)
